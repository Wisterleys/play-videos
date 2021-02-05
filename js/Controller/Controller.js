class Controller{
    constructor(el){
        this._video;
        this._file;
        this._modalVideo=document.querySelector("#video")
        this._playList=document.querySelector("#playList")
        this.connectDatabase()
        this.toAssign(el)
        this.initializeEvents()
        this.loadPlaylist()
    }
    listenerList(element){
        element.forEach(el=>{
            el.addEventListener("click",e=>{
                this.modalMoveOpen(e)
            })
        });
    }
    listenerClose(){
        this.modalVideo.addEventListener("click",e=>{
            this.modalMoveClose(e)
        })
    }
    modalMoveClose(el){
        this.modalVideo.setAttribute("class","close")
        this.video.pause()
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
            this.video.parentNode.querySelector("marquee").innerHTML=obj.nameFile
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
            snapshot.forEach(snapshotItem=>{
                //this.playList.innerHTML=''
                let el = this.createEl(this.playList,"li","class","list")
                el.innerHTML=`<figure></figure>`
                let img = this.createEl(el.querySelector("figure"),"img","src","img/icone-video.png")
                img.dataset.key=JSON.stringify(snapshotItem.val())
                el.querySelector("figure").innerHTML+=`<figcaption>${snapshotItem.val().nameFile}</figcaption>`
            })
            this.listenerList(this.playList.querySelectorAll("img"))
            this.listenerClose()
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
    get modalVideo(){return this._modalVideo}
    set modalVideo(value){this._modalVideo=value}
    get playList(){return this._playList}
    set playList(value){this._playList=value}
    get playList(){return this._playList}
    set playList(value){this._playList=value}
    get file(){return this._file}
    set file(value){this._file=value}
    get video(){return this._video}
    set video(value){this._video=value}
}