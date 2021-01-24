class Controller{
    constructor(el){
        this._video;
        this._file;
        this.toAssign(el)
        this.all()
        this.connectDatabase()
    }
    toAssign(el){
        this.video=el.video
        this.file=el.file
    }
    all(){
        this.file.addEventListener("change",e=>{this.target(this.video,e)})
        document.querySelector("button").addEventListener("click",e=>{this.file.click()})
    }
    connectDatabase(){
         // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyC5KGA89n_JtT1U4C6eQfqhZ4rW7IlhuNc",
            authDomain: "play-fb088.firebaseapp.com",
            databaseURL: "https://play-fb088-default-rtdb.firebaseio.com",
            projectId: "play-fb088",
            storageBucket: "play-fb088.appspot.com",
            messagingSenderId: "727436387567",
            appId: "1:727436387567:web:263637f2a913ccd0bbe71a",
            measurementId: "G-Y1SBWR29GE"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
    }
    target(el,e){
        let file = new FileReader()
            file.onload=()=>{
                document.querySelector("progress").hidden=true
               /*  el.src=file.result
                el.currentTime=0
                el.play() */
                document.querySelector("p").innerHTML=`<marquee>${e.target.files[0].name}</marquee>`
                setInterval(()=>{
                   el.currentTime>431.152382?el.currentTime=0:0
                },1000)
            }
            file.addEventListener("progress",e=>{
                document.querySelector("progress").hidden=false
                document.querySelector("progress").value=e.loaded*100/e.total
            })
            file.readAsDataURL(e.target.files[0],file)
    }
    get file(){return this._file}
    set file(value){this._file=value}
    get video(){return this._video}
    set video(value){this._video=value}
}