class Controller{
    constructor(el){
        //Attributes
        this._video;
        this._file;
        this._currentDataset
        this._currentTimeLoop;
        this._modalVideo=document.querySelector("#video")
        this._playList=document.querySelector("#playList")
        this.model = new Model()
        //-----------------------------------------

        //Calling methods
        this.toAssign(el)
        this.initializeEvents()
        this.loadPlaylist()
        this.listenerInfoBoxClose()
        //------------------------------------
    }

    //listening methods
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
                    e.target.innerText&&obj?this.model.updateFirebase(obj,e.target.innerText):e.target.innerText=name
                })
                e.target.addEventListener("keyup",e=>{
                    if(e.key=="Enter"){
                        e.target.style.height=""
                        e.target.contentEditable=false
                        e.target.innerText&&obj?this.model.updateFirebase(obj,e.target.innerText):e.target.innerText=name
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
            document.querySelector(".box article p span").innerText= `[ ${obj["name"]} ]`
        })})
    }
    listenerInfoBoxClose(){
        document.querySelector("#false").addEventListener("click",e=>{
            document.querySelector(".box").classList.remove("box_open")
            document.querySelector(".box").classList.add("box_close")
        })
        document.querySelector("#true").addEventListener("click",e=>{
            this.model.deleteStorage(this.currentDataset)
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
            .catch(err=>{
                let p = e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML
                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerHTML="Erro! <div id='fechar' style='width: 30px;float:right;background:green;border:2px solid white;cursor:pointer;border-radius:360px;padding:5px;position:fixed;left:85%;top:-30px'>X</div>"
                e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML=`
                <h3><b><u>${this.currentDataset.name}</u></b></h3><br>
                Esse arquivo existe no database mas não existe no storage e por esse motivo não foi possível finalizar a operação. <br><br>
                `
                document.querySelector("#false").disabled=true
                document.querySelector("#true").disabled=true
                document.querySelector("#fechar").addEventListener("click",()=>{
                    document.querySelector(".box").classList.remove("box_open")
                    document.querySelector(".box").classList.add("box_close")
                    document.querySelector("#false").disabled=false
                    document.querySelector("#true").disabled=false
                    setTimeout(()=>{
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header").style.background="rgb(189, 32, 32)"
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerText="Cuidado!"
                        e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML=p
                        this.currentDataset=""
                    },500)
                })
            })
       
        })
    }
    listenerClose(){
        this.modalVideo.querySelector(".x").addEventListener("click",e=>{
            this.modalMoveClose()
        })
    }
    //------------------------------------------------------------------------

    //Methods
    returnsPercent(value,total){
        return value*100/total
    }
    saveAssistedDuration(){
        let data = JSON.parse(this.video.dataset.key)
        this.currentTimeLoop = setInterval(() => {
            this.model.getItem(data["key"])["currentTime"]<this.video.currentTime?this.model.setItem(data.key,{currentTime:this.video.currentTime,duration:this.video.duration}):0  
        },500);  
    }
    modalMoveClose(){
        this.modalVideo.setAttribute("class","close")
        clearInterval(this.currentTimeLoop)
        this.video.src=''
    }
    modalMoveOpen(el){
        if(this.getData(el)){
            this.modalVideo.setAttribute("class","opeen")
            this.video.currentTime=localStorage.getItem(JSON.parse(this.video.dataset.key)["key"])?parseInt(JSON.parse(localStorage.getItem(JSON.parse(this.video.dataset.key)["key"]))["currentTime"]):0
            this.video.play()
            this.saveAssistedDuration()
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
            this.video.dataset.key=JSON.stringify(obj)
            this.video.src=obj.urlFile
            this.video.parentNode.querySelector("marquee").innerHTML=obj.name
            return true
        }else{return false}
    }
    
    initializeEvents(){
        this.file.addEventListener("change",e=>{
             this.model.uploadTask(e.target.files)
             .then(ress=>{
                document.querySelector("#progress").hidden=true
                ress.forEach(resp=>{
                    this.model.getFireBaseRef("files").push().set({
                        name:resp.name,
                        nameFile:resp.name,
                        type:resp.type,
                        contentType:resp.contentType,
                        updated:resp.updated,
                        size:resp.size,
                        currentTime:0,
                        duration:0,
                        urlFile:resp.customMetadata.downloadURL
                    })
                })
             })
             .catch(err=>{console.error(err)})
           
            })
            
        document.querySelector("button").addEventListener("click",e=>{this.file.click()})
    }
    
    loadPlaylist(){
        this.model.getFireBaseRef().on("value",snapshot=>{
            snapshot.val()?this.playList.innerHTML='':0
            snapshot.forEach(snapshotItem=>{
                let el = this.createEl(this.playList,"li","class","list")
                el.innerHTML=`<figure></figure>`
                el.querySelector("figure").innerHTML+=`<div class="info_box">X</div>`
                let img = this.createEl(el.querySelector("figure"),"img","src","img/video-icon-black.png")
                let obj = snapshotItem.val()
                obj["key"]=snapshotItem.key
                img.dataset.key=JSON.stringify(obj)
                localStorage.getItem(snapshotItem.key)?0:localStorage.setItem(snapshotItem.key,JSON.stringify({currentTime:obj.currentTime,duration:obj.duration}))
                el.querySelector("figure").innerHTML+=`
                <div id="minProgress">
                            <div></div>
                </div>
                <figcaption>${snapshotItem.val().name}</figcaption>
                `
                let info = JSON.parse(localStorage.getItem(snapshotItem.key))
                el.querySelector("#minProgress div").style.width=`${info?this.returnsPercent(info.currentTime,info.duration):0}%`
            })
            this.listenerList(this.playList.querySelectorAll("img"))
            this.listenerClose()
            this.listenerInfoBox()
            this.listenerFigcaption()
        })
    }
    //----------------------------------------------------

   // Methods SETs and GETs
    get currentTimeLoop(){return this._currentTimeLoop}
    set currentTimeLoop(value){this._currentTimeLoop=value}
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
    //----------------------------------------------
}