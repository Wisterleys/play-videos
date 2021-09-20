class Model{
    constructor(){
        this.connectDatabase()
    }
    setItem(key,obj){
        localStorage.setItem(key,JSON.stringify(obj))
    }
    getItem(key){
        return JSON.parse(localStorage.getItem(key))
    }
    updateFirebase(json,name){
        if(name){
         json.name=name
         this.getFireBaseRef().child(json.key).set(json)
        }
     }
    deleteFirebase(key){
        this.getFireBaseRef().child(key).remove()
        localStorage.removeItem(key)
    }
    deleteStorage(json){
        return new Promise((resolve,reject)=>{
            firebase.storage().ref("/files").child(json.nameFile).delete()
            .then(res=>{
            this.deleteFirebase(json.key)
                resolve(res)
            })
            .catch(erro=>{reject([erro,json])})
            })
    }
    getFireBaseRef(reff="files"){
        return firebase.database().ref(reff)
    }
    returnsPercent(value,total){
        return value*100/total
    }
    loadingTemplate(){
        /*
            <div id="progress" hidden>
                <div></div>
            </div>
        */
       let div = this.createEl(document.querySelector("#barra"),'div','class','progress')
       this.createEl(div,'div','class','')
       return div;

    }
    createEl(parentEl,nameEl,attEl,valeuEl){
        let el = document.createElement(nameEl)
        let att = document.createAttribute(attEl)
        att.value=valeuEl
        el.setAttributeNode(att)
        parentEl.appendChild(el)
        return el;
    }
    uploadTask(files){
        let promises=[];
        [...files].forEach(file => {
            let progress = this.loadingTemplate();
            promises.push(new Promise((resolve,reject)=>{
                let filename_part = file.name.split(".");
                let filename = filename_part[0]+"-"+Date.now()+"."+filename_part[1]
                let fileRef = firebase.storage().ref("/files").child(filename)
                let task = fileRef.put(file)
                task.on("state_changed",snapshot=>{
                    progress.hidden=false
                    progress.querySelector("div").innerHTML=filename_part[0]
                    progress.querySelector("div").style.textAlign='center'
                    progress.querySelector("div").style.color="white"
                    progress.querySelector("div").style.width=`${this.returnsPercent(snapshot._delegate.bytesTransferred,snapshot._delegate.totalBytes)}%`
                },erro=>{
                    reject(erro)
                },()=>{
                    task.snapshot.ref.getDownloadURL().then(downloadURL=>{
                        task.snapshot.ref.updateMetadata({ customMetadata: { downloadURL }}).then(metadata=>{
                         resolve(metadata)
                         progress.remove()
                       }).catch( error => {
                         console.error( 'Error update metadata:', error)
                         reject( error ) 
                         progress.remove()
                       })
                    })
                })
            }))
        });
        return Promise.all(promises)
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
            //Extra
            /* var firebaseConfig = {
                apiKey: "AIzaSyAJ9zmuqV5EFJ9f8HY0eQy7mnX870c0iNg",
                authDomain: "playextra-27f40.firebaseapp.com",
                databaseURL: "https://playextra-27f40-default-rtdb.firebaseio.com",
                projectId: "playextra-27f40",
                storageBucket: "playextra-27f40.appspot.com",
                messagingSenderId: "637998280658",
                appId: "1:637998280658:web:5c666fe4b3138ba1a5620b",
                measurementId: "G-Z2GHFR8880"
              }; */
             // Initialize Firebase
             firebase.initializeApp(firebaseConfig);
             firebase.analytics();
     }
}
