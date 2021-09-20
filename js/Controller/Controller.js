class Controller{
    constructor(el){
        //Attributes
        this._video;
        this._file;
        this._currentDataset
        this._currentTimeLoop;
        this._modalVideo=S.s("#video")
        this._playList=S.s("#playList")
        this.model = new Model()
        this.promise=true
        //-----------------------------------------

        //Calling methods
        this.toAssign(el)
        this.initializeEvents()
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
        S.sAll("figcaption").forEach(el=>{
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
        S.sAll(".info_box").forEach(el=>{el.addEventListener("click",e=>{
            S.s(".box_close")? S.s(".box").classList.remove("box_close"):0
            S.s(".box").classList.add("box_open")
            let obj = JSON.parse(e.target.parentNode.querySelector("img").dataset.key)
            this.currentDataset=obj
            S.s(".box article p span").innerText= `[ ${obj["name"]} ]`
        })})
    }
    delFire(){
        alert("!")
    }
    listenerInfoBoxClose(){
        S.s("#false").addEventListener("click",e=>{
            S.s(".box").classList.remove("box_open")
            S.s(".box").classList.add("box_close")
        })
        S.s("#true").addEventListener("click",e=>{
            this.model.deleteStorage(this.currentDataset)
            .then(res=>{
                S.s("#false").disabled=true
                S.s("#true").disabled=true
                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header").style.background="green"
                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerText="Removido"
                let p = e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML
                e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML="Arquivo Removido com sucesso! <br><img src='img/Green_check.png' style='width:20%;margin:auto;'/>"
                e.target.parentNode.parentNode.parentNode.querySelector("p").style.textAlign="center"
                setTimeout(()=>{
                    S.s(".box").classList.remove("box_open")
                    S.s(".box").classList.add("box_close")
                    S.s("#false").disabled=false
                    S.s("#true").disabled=false
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
                Esse arquivo existe no database mas não existe no storage e por esse motivo não foi possível finalizar a operação. <br><button id="delFire" data-key="${err[1].key}">EXCLUIR</button><br><br>
                `
                S.s("#false").disabled=true
                S.s("#true").disabled=true
                S.s("#fechar").addEventListener("click",()=>{
                    S.s(".box").classList.remove("box_open")
                    S.s(".box").classList.add("box_close")
                    S.s("#false").disabled=false
                    S.s("#true").disabled=false
                    setTimeout(()=>{
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header").style.background="rgb(189, 32, 32)"
                        e.target.parentNode.parentNode.parentNode.parentNode.querySelector("header h1").innerText="Cuidado!"
                        e.target.parentNode.parentNode.parentNode.querySelector("p").innerHTML=p
                        this.currentDataset=""
                    },500)
                })
                S.s("#delFire").addEventListener("click",e=>{
                    this.model.deleteFirebase(e.target.dataset.key)
                })
            })
       
        })
    }
    listenerClose(){
        this.modalVideo.querySelector(".x").addEventListener("click",e=>{
            this.modalMoveClose()
        })
    }
    listeningPlayButton(){
        let el = S.s("#menuPlay")
        S.s("#menuPlay").addEventListener("click",e=>{
            if(this.promise){
                this.exchangeInternalElements(el.classList.value,el)
            }
        })
        window.addEventListener("keyup",e=>{
            e.code=="Space"?this.exchangeInternalElements(el.classList.value,el):0
        })
    }
    listenerVolume(){
        S.s("input[type='range']").addEventListener("change",e=>{
            this.video.volume=e.target.value*1.0/100
        })
    }
    
    listeningToTheVideoTime(){//video time progress bar
        this.video.addEventListener("timeupdate",e=>{
            if(this.video.src){
                S.s("#minProgressVideo div").style.width=`${this.returnsPercent(e.target.currentTime,e.target.duration)}%`
                S.s("#duration").innerText=`${this.formatsDate(this.video.currentTime)} / ${this.formatsDate(e.target.duration)}`
                S.s(".listC p")?this.selectCurrentScene(S.s("#modal_gallery")):0
            }
        })
    }
    listenGallery(){
        this.video.onplaying=e=>{
            S.s("#gallery").style.visibility="visible"
            this.videoGalleryGenerator()
            .then(res=>{
                this.selectCurrentScene(S.s("#modal_gallery"))
                //console.log(res.info)
            })
            .catch(err=>{console.log(err)})
        }
        S.s("#gallery").addEventListener("click",e=>{
            let g = S.s("#modal_gallery")
            g.hidden?g.hidden=false:g.hidden=true
        })
    }
    listenerScreen(){
        S.s("#screen").style.cursor="pointer"
        S.s("#screen").addEventListener("click",e=>{
            this.video.requestFullscreen().then(res=>console.log(res))
        })
    }
    //------------------------------------------------------------------------

    //Methods
    convertToNumbers(string){//convert time string to numbers
        let time = string.split(":")
        return [parseInt(time[0]),parseInt(time[1]),parseInt(time[2])];
    }
    compareArray(array,array_two){// this method only accepts an array that has 3 index. It is linked directly to meet the needs of the selectCurrentScene () method
        return array[0]==array_two[0]&&array[1]==array_two[1]&&array_two[2]>=array[2]&&array_two[2]<array[2]+10
    }
    moveScroll(el,i){
        let lines = document.querySelectorAll(".listC");
        if(lines){
            el.scrollTo(lines[i].offsetLeft-((el.offsetWidth/2)-(lines[i].offsetWidth/2)),0)
        }
    }
    selectCurrentScene(el){
        el.querySelectorAll("li").forEach((e,i)=>{
            let time = this.convertToNumbers(e.querySelector("p").innerText)
            let video = this.convertToNumbers(this.formatsDate(this.video.currentTime))
            this.compareArray(time,video)?e.querySelector("img").style.background="green":e.querySelector("img").style.background="none"
            this.compareArray(time,video)?this.moveScroll(el,i):0
        })
    }
    videoGalleryGenerator(){
        return new Promise((resolve,reject)=>{
            let obj = this.video
            if(obj.src){
                S.s("#modal_gallery ul").innerHTML=""
                let duration = obj.duration
                for(let l=0;l<duration;l+=10){
                    let el = this.createEl(S.s("#modal_gallery ul"),"li","class","listC")
                    el.innerHTML=`<img src="img/video-icon-red.png">`
                    el.innerHTML+=`<p>${this.formatsDate(l)}</p>`
                    el.addEventListener("click",e=>{
                        this.promise=false
                        this.video.pause()
                        this.video.currentTime=l;
                        this.video.play().then(res=>{
                            this.promise=true
                            this.exchangeInternalElements("inactive",S.s("#menuPlay"),`<div id="t"></div>`)
                            console.log(res)
                        })
                    })
                }
                resolve({info:"ok"})
            }else reject({err:"src do vídeo vazia"})
          
        })
    }
    formatsDate(duration){
        let s = isNaN(duration)?0:parseInt(((duration)%60))
        let m = isNaN(duration)?0:parseInt(((duration/60)%60))
        let h = isNaN(duration)?0:parseInt(((duration/60/60)%24))
        return `${h<10?"0"+h:h}:${m<10?"0"+m:m}:${s<10?"0"+s:s}`
    }
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
        this.video.src=""
        S.s("#modal_gallery").hidden=true
        S.s("#gallery").style.visibility="hidden"
    }
    modalMoveOpen(el){
        if(this.getData(el)){
            this.modalVideo.setAttribute("class","opeen")
            this.video.currentTime=localStorage.getItem(JSON.parse(this.video.dataset.key)["key"])?parseInt(JSON.parse(localStorage.getItem(JSON.parse(this.video.dataset.key)["key"]))["currentTime"]):0
            if(this.promise){ this.exchangeInternalElements("inactive",S.s("#menuPlay"),`<div id="t"></div>`)}
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
        this.loadPlaylist()
        this.listenerInfoBoxClose()
        this.listeningPlayButton()
        this.listenerVolume()
        this.listeningToTheVideoTime()
        this.listenGallery()
        this.listenerScreen()
        this.file.addEventListener("change",e=>{
             this.model.uploadTask(e.target.files)
             .then(ress=>{
                ress.forEach(resp=>{
                    const part = resp.name.split("-")
                    const name = part[0]
                    this.model.getFireBaseRef("files").push().set({
                        name,
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
            
        S.s("button").addEventListener("click",e=>{this.file.click()})
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
    // CONTROLS PLAY
    toggle(vet){// need to pass three values index 0 1 2
        return vet[1]==vet[0]?vet[2]:vet[1]
    }
    exchangeInternalElements(classe,el,eltwo=false){
        if(this.promise){
            this.promise=false
            let ell = el.innerHTML
            el.classList.remove(classe)
            el.classList.add(this.toggle([classe,"inactive","active"]))
            el.innerHTML=this.toggle([!eltwo?ell:eltwo,`<div id="pl"></div><div id="pr"></div>`,`<div id="t"></div>`])
            if(el.innerHTML==`<div id="pl"></div><div id="pr"></div>`){this.video.play();this.promise=true}
            else {this.video.pause();this.promise=true}
        }
    }
    //------------------------

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