class Controller{
    constructor(el){
        this._video;
        this._file;
        this.toAssign(el)
        this.all()
    }
    toAssign(el){
        this.video=el.video
        this.file=el.file
    }
    all(){
        this.file.addEventListener("change",e=>{
            this.target(this.video,e)
            
        })
        document.querySelector("button").addEventListener("click",e=>{
            this.file.click()
        })
    }
    target(el,e){
        let file = new FileReader()
            file.onload=()=>{
                el.src=file.result
                el.currentTime=0
                el.play()
                document.querySelector("p").innerHTML=`<marquee>${e.target.files[0].name}</marquee>`
                setInterval(()=>{
                   el.currentTime>431.152382?el.currentTime=0:0
                },1000)
            }
            file.readAsDataURL(e.target.files[0],file)
    }
    get file(){return this._file}
    set file(value){this._file=value}
    get video(){return this._video}
    set video(value){this._video=value}
}