class Canvas
{
    constructor(cols,rows,scale)
    {        
        this.height = rows
        this.width = cols
        this.scale = scale

        if( typeof document !== "undefined" ){              // In browser, crease a new HTML canvas-element to draw on 
            this.elem = document.createElement("canvas")
            this.elem.className="grid-holder"
            this.elem.width = this.width*this.scale
            this.elem.height = this.height*this.scale   
            // document.body.appendChild(this.elem)         
            document.getElementById("canvas_holder").appendChild(this.elem)
        } 
        else 
        {                                            // In nodejs, use canvas package, FIXING THIS LATER, FIRST STUDENT BROWSER-VERSION
			const {createCanvas} = require("canvas")
			this.elem = createCanvas( this.width*this.scale, this.height*this.scale)
			//this.fs = require("fs")
		}
		this.ctx = this.elem.getContext("2d")
		this.ctx.lineWidth = 1
        this.ctx.fillStyle = "#AAAAAA";
        this.ctx.fillRect(0, 0, cols*scale, rows*scale);
        this.ctx.strokeRect(0, 0, cols*scale, rows*scale);
    }
}
export default Canvas