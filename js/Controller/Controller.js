class Controller{
    constructor(el){
        this._video;
        this._file;
        this._currentDataset
        this._modalVideo=document.querySelector("#video")
        this._playList=document.querySelector("#playList")
        this.connectDatabase()
        this.toAssign(el)
        this.initializeEvents()
        this.loadPlaylist()
        this.listenerInfoBoxClose()
    }
    listenerList(element){
        element.forEach(el=>{
            el.addEventListener("mouseover",e=>{
                e.target.src="img/video-icon-red.png"
            })
            el.addEventListener("mouseout",e=>{
                e.target.src="img/video-icon-black.png"
            })
            el.addEventListener("click",e=>{
                this.modalMoveOpen(e)
            })
        });
    }
    deleteStorage(json){
        return new Promise((resolve,reject)=>{
            firebase.storage().ref("/files").child(json.nameFile).delete()
            .then(res=>{
            this.deleteFirebase(json.key)
                resolve(res)
            })
            .catch(erro=>{reject(erro)})
            })
    }
    deleteFirebase(key){
         this.getFireBaseRef().child(key).remove()
     }
    updateFirebase(json,name){
       if(name){
        json.name=name
        this.getFireBaseRef().child(json.key).set(json)
       }
    }
    listenerFigcaption(){
        document.querySelectorAll("figcaption").forEach(el=>{
            el.addEventListener("dblclick",e=>{
                let obj=e.target.parentNode.querySelector("img").dataset.key?JSON.parse(e.target.parentNode.querySelector("img").dataset.key):""
                let name = e.target.innerText
                e.target.style.height="100px"
                e.target.contentEditable=true
                e.target.addEventListener("blur",e=>{
                    e.target.style.height=""
                    e.target.contentEditable=false
                    e.target.innerText&&obj?this.updateFirebase(obj,e.target.innerText):e.target.innerText=name
                })
                e.target.addEventListener("keyup",e=>{
                    if(e.key=="Enter"){
                        e.target.style.height=""
                        e.target.contentEditable=false
                        e.target.innerText&&obj?this.updateFirebase(obj,e.target.innerText):e.target.innerText=name
                    }
                })
            })
        })
    }
    listenerInfoBox(){
        document.querySelectorAll(".info_box").forEach(el=>{el.addEventListener("click",e=>{
            document.querySelector(".box_close")? document.querySelector(".box").classList.remove("box_close"):0
            document.querySelector(".box").classList.add("box_open")
            let obj = JSON.parse(e.target.parentNode.querySelector("img").dataset.key)
            this.currentDataset=obj
            document.querySelector(".box article p span").innerText= `[ ${obj["name"].replace(/[\ ]/ig,"")} ]`
        })})
    }
    listenerInfoBoxClose(){
        document.querySelector("#false").addEventListener("click",e=>{
            document.querySelector(".box").classList.remove("box_open")
            document.querySelector(".box").classList.add("box_close")
        })
        document.querySelector("#true").addEventListener("click",e=>{
            this.deleteStorage(this.currentDataset)
            .then(res=>{
                document.querySelector("#false").disabled=true
                document.querySelector("#true").disabled=true
                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header").style.background="green"
                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerText="Removido"
                let p = e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML
                e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML="Arquivo Removido com sucesso! <br><img src='img/Green_check.png' style='width:20%;margin:auto;'/>"
                e.target.parentNode.parentNode.parentNode.querySelector("p").style.textAlign="center"
                

            
                setTimeout(()=>{
                    document.querySelector(".box").classList.remove("box_open")
                    document.querySelector(".box").classList.add("box_close")
                    document.querySelector("#false").disabled=false
                    document.querySelector("#true").disabled=false
                    setTimeout(()=>{
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header").style.background="rgb(189, 32, 32)"
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerText="Cuidado!"
                        e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML=p
                        this.currentDataset=""
                    },1000)
                },3000)
            })
            .catch(err=>console.log(err))
       
        })
    }
    listenerClose(){
        this.modalVideo.querySelector(".x").addEventListener("click",e=>{
            this.modalMoveClose()
        })
    }
    modalMoveClose(){
        this.modalVideo.setAttribute("class","close")
        this.video.src=''
    }
    modalMoveOpen(el){
        if(this.getData(el)){
            this.modalVideo.setAttribute("class","opeen")
            this.video.play()
        }
       
    }
    toAssign(el){
        this.video=el.video
        this.file=el.file
    }
    createEl(parentEl,nameEl,attEl,valeuEl){
        let el = document.createElement(nameEl)
        let att = document.createAttribute(attEl)
        att.value=valeuEl
        el.setAttributeNode(att)
        parentEl.appendChild(el)
        return el;
    }
    getData(data){
       if(data.target.dataset.key){
            let obj = JSON.parse(data.target.dataset.key)
            this.video.src=obj.urlFile
            this.video.parentNode.querySelector("marquee").innerHTML=obj.name
            return true
        }else{return false}
    }
    updateTask(files){
        let promises=[];
        [...files].forEach(file => {
            promises.push(new Promise((resolve,reject)=>{
                let fileRef = firebase.storage().ref("/files").child(file.name)
                let task = fileRef.put(file)
                task.on("state_changed",snapshot=>{
                    document.querySelector("progress").hidden=false
                    document.querySelector("progress").value=snapshot._delegate.bytesTransferred*100/snapshot._delegate.totalBytes
                },erro=>{
                    reject(erro)
                },()=>{
                    task.snapshot.ref.getDownloadURL().then(downloadURL=>{
                        task.snapshot.ref.updateMetadata({ customMetadata: { downloadURL }}).then(metadata=>{
                         resolve(metadata)
                       }).catch( error => {
                         console.error( 'Error update metadata:', error)
                         reject( error ) 
                       })
                    })
                })
            }))
        });
        return Promise.all(promises)
    }
    initializeEvents(){
        this.file.addEventListener("change",e=>{
             this.updateTask(e.target.files)
             .then(ress=>{
                document.querySelector("progress").hidden=true
                ress.forEach(resp=>{
                    this.getFireBaseRef("files").push().set({
                        name:resp.name,
                        nameFile:resp.name,
                        type:resp.type,
                        contentType:resp.contentType,
                        updated:resp.updated,
                        size:resp.size,
                        currentTime:"",
                        urlFile:resp.customMetadata.downloadURL
                    })
                })
             })
             .catch(err=>{console.error(err)})
           
            })
            
        document.querySelector("button").addEventListener("click",e=>{this.file.click()})
    }
    getFireBaseRef(reff="files"){
        
        return firebase.database().ref(reff)
    }
    loadPlaylist(){
        this.getFireBaseRef().on("value",snapshot=>{
            snapshot.val()?this.playList.innerHTML='':0
            snapshot.forEach(snapshotItem=>{
                let el = this.createEl(this.playList,"li","class","list")
                el.innerHTML=`<figure></figure>`
                el.querySelector("figure").innerHTML+=`<div class="info_box">X</div>`
                let img = this.createEl(el.querySelector("figure"),"img","src","img/video-icon-black.png")
                let obj = snapshotItem.val()
                obj["key"]=snapshotItem.key
                img.dataset.key=JSON.stringify(obj)
                el.querySelector("figure").innerHTML+=`<figcaption>${snapshotItem.val().name}</figcaption>`
            })
            this.listenerList(this.playList.querySelectorAll("img"))
            this.listenerClose()
            this.listenerInfoBox()
            this.listenerFigcaption()
        })
    }
   
    connectDatabase(){
       // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
            var firebaseConfig = {
                apiKey: "AIzaSyDEtpfo5eeBYub1fgCLKM_SMv4ZzmfBAgw",
                authDomain: "play-9775f.firebaseapp.com",
                databaseURL: "https://play-9775f-default-rtdb.firebaseio.com",
                projectId: "play-9775f",
                storageBucket: "play-9775f.appspot.com",
                messagingSenderId: "833926432231",
                appId: "1:833926432231:web:37f9b6a2962c8c79802942",
                measurementId: "G-LDM79RVMSZ"
            };
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            firebase.analytics();
    }
    get currentDataset(){return this._currentDataset}
    set currentDataset(value){this._currentDataset=value}
    get modalVideo(){return this._modalVideo}
    set modalVideo(value){this._modalVideo=value}
    get playList(){return this._playList}
    set playList(value){this._playList=value}
    get file(){return this._file}
    set file(value){this._file=value}
    get video(){return this._video}
    set video(value){this._video=value}
}