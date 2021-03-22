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
            .catch(erro=>{reject(erro)})
            })
    }
    getFireBaseRef(reff="files"){
        return firebase.database().ref(reff)
    }
    returnsPercent(value,total){
        return value*100/total
    }
    uploadTask(files){
        let promises=[];
        [...files].forEach(file => {
            promises.push(new Promise((resolve,reject)=>{
                let fileRef = firebase.storage().ref("/files").child(file.name)
                let task = fileRef.put(file)
                task.on("state_changed",snapshot=>{
                    document.querySelector("#progress").hidden=false
                    document.querySelector("#progress div").style.width=`${this.returnsPercent(snapshot._delegate.bytesTransferred,snapshot._delegate.totalBytes)}%`
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
    connectDatabase(){
        // Your web app's Firebase configuration
         // For Firebase JS SDK v7.20.0 and later, measurementId is optional
            var firebaseConfig = {
    apiKey: "AIzaSyCT_UmK-N9-6j6RrvNr0nUnsT3DacOhMbc",
    authDomain: "play-again-ca6f3.firebaseapp.com",
    databaseURL: "https://play-again-ca6f3-default-rtdb.firebaseio.com",
    projectId: "play-again-ca6f3",
    storageBucket: "play-again-ca6f3.appspot.com",
    messagingSenderId: "108631991776",
    appId: "1:108631991776:web:f4624e342423fc6211f785",
    measurementId: "G-JZRHWWD95W"
  };
             /*var firebaseConfig = {
                apiKey: "AIzaSyAJ9zmuqV5EFJ9f8HY0eQy7mnX870c0iNg",
                authDomain: "playextra-27f40.firebaseapp.com",
                projectId: "playextra-27f40",
                storageBucket: "playextra-27f40.appspot.com",
                messagingSenderId: "637998280658",
                appId: "1:637998280658:web:5c666fe4b3138ba1a5620b",
                measurementId: "G-Z2GHFR8880"
              };*/
             // Initialize Firebase
             firebase.initializeApp(firebaseConfig);
             firebase.analytics();
     }
}
