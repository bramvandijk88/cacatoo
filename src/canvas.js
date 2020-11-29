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
            document.body.appendChild(this.elem)         
            document.getElementById("canvas_holder").appendChild(this.elem)
        } 
        else 
        {                                            // In nodejs, use canvas package, FIX LATER, FIRST STUDENT VERSION
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

    show()
    {
        let ctx = this.ctx
        let scale = this.scale
        let ncol = this.height
        let nrow = this.width
        let col = [255,255,255,255]

        ctx.clearRect(0,0,scale*ncol,scale*nrow);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        
        

        for(let i=0;i<ncol;i++)         // i are rows
        {
            for(let j=0;j<nrow;j++)     // j are columns
            {   
                if(this.grid[i][j].val == 0) continue // Don't draw
                if(this.grid[i][j].val == 1) col = [255,255,255,255]
                if(this.grid[i][j].val == 2) col = [100,100,100,100]
                
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = col[0];
                            pixels[off + 1] = col[1];
                            pixels[off + 2] = col[2];
                            pixels[off + 3] = col[3];
                        }
                    }

            }
        }
        ctx.putImageData(id, 0, 0);
    }
}
export default Canvas