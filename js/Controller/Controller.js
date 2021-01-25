class Controller{
    constructor(el){
        this._video;
        this._file;
        this.connectDatabase()
        this.toAssign(el)
        this.initializeEvents()
    }
    toAssign(el){
        this.video=el.video
        this.file=el.file
    }
    updateTask(files){
        let promises=[];
        [...files].forEach(file => {
            promises.push(new Promise((re,rej)=>{
                let ajax = new XMLHttpRequest()
                ajax.open("POST","/upload")
                ajax.onload=events=>{
                    try {
                        re(JSON.parse(ajax.responseText))
                    } catch (error) {
                        rej(error)
                        
                    }
                }
                ajax.onerror=e=>{
                    rej(e)
                }
                let formdata = new FormData()
                formdata.append("video",file)
                ajax.send(formdata)
            }))
        });
        return Promise.all(promises)
    }
    initializeEvents(){
        this.file.addEventListener("change",e=>{
            /*  this.updateTask(e.target.files)
             .then(ress=>{
                ress.forEach(resp=>{
                    console.log(resp.files["input-file"])
                })
             })
             .catch(err=>{console.error(err)}) */
             this.target(e.target.files)
            })
            
        document.querySelector("button").addEventListener("click",e=>{this.file.click()})
    }
    getFireBaseRef(){
        
        return firebase.database().ref("files")
    }
    target(/* el, */e){
        let file = new FileReader()
            file.onload=()=>{
                document.querySelector("progress").hidden=true
               /*  el.src=file.result
                el.currentTime=0
                el.play() */
               /*  document.querySelector("p").innerHTML=`<marquee>${e.target.files[0].name}</marquee>`
                setInterval(()=>{
                   el.currentTime>431.152382?el.currentTime=0:0
                },1000) */
                console.log(e)
                this.getFireBaseRef().push().set({name:e[0].name,size:e[0].size,type:e[0].type})
            }
            file.addEventListener("progress",e=>{
                document.querySelector("progress").hidden=false
                document.querySelector("progress").value=e.loaded*100/e.total
            })
            file.readAsDataURL(e[0])
           
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
    get file(){return this._file}
    set file(value){this._file=value}
    get video(){return this._video}
    set video(value){this._video=value}
}