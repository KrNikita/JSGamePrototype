class Logger{
    constructor(){

    }
    log(msg:string):void{
        console.log(msg);
    }

}

var l = new Logger();
l.log("hello");