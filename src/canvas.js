class Canvas
{
    constructor(cols,rows,scale,title)
    {        
        this.height = rows
        this.width = cols
        this.scale = scale

        if( typeof document !== "undefined" ){              // In browser, crease a new HTML canvas-element to draw on 
            this.elem = document.createElement("canvas")
            this.titlediv = document.createElement("div")
            this.titlediv.innerHTML = "<font size = 1>"+title+"</font>"
            this.canvasdiv = document.createElement("div")
            this.canvasdiv.className="grid-holder"
            this.elem.className="grid-holder"
            this.elem.width = this.width*this.scale
            this.elem.height = this.height*this.scale   
            this.canvasdiv.appendChild(this.elem)
            this.canvasdiv.appendChild(this.titlediv)
            // document.body.appendChild(this.elem)         
            document.getElementById("canvas_holder").appendChild(this.canvasdiv)
            
            this.ctx = this.elem.getContext("2d")
	    	this.ctx.lineWidth = 1
            this.ctx.fillStyle = "#AAAAAA";
            this.ctx.fillRect(0, 0, cols*scale, rows*scale);
            this.ctx.strokeRect(0, 0, cols*scale, rows*scale);
        } 
        else 
        {                                            // In nodejs, use canvas package, FIXING THIS LATER, FIRST STUDENT BROWSER-VERSION
			//const {createCanvas} = require("canvas")
			//this.elem = createCanvas( this.width*this.scale, this.height*this.scale)
            //this.fs = require("fs")
            console.log("WARNING: No canvas available in NodeJS-mode (yet)")
		}
		
    }
}
export default Canvas