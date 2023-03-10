/**
 *  Canvas is a wrapper-class for a HTML-canvas element. It is linked to a @Gridmodel object, and stores what from that @Gridmodel should be displayed (width, height, property, scale, etc.)
 */

class Canvas {
    /**
    *  The constructor function for a @Canvas object. 
    *  @param {Gridmodel} gridmodel The gridmodel to which this canvas belongs
    *  @param {string} property the property that should be shown on the canvas
    *  @param {int} height height of the canvas (in rows)
    *  @param {int} width width of the canvas (in cols)
    *  @param {scale} scale of the canvas (width/height of each gridpoint in pixels)
    */
    constructor(gridmodel, prop, lab, height, width, scale, continuous) {
        this.label = lab
        this.gridmodel = gridmodel
        this.statecolours = gridmodel.statecolours
        this.property = prop
        this.height = height
        this.width = width
        this.scale = scale        
        this.continuous = continuous
        this.bgcolour = 'black'
        this.offset_x = 0
        this.offset_y = 0        
        this.phase = 0

        if (typeof document !== "undefined")                       // In browser, crease a new HTML canvas-element to draw on 
        {
            this.elem = document.createElement("canvas")
            this.titlediv = document.createElement("div")
            this.titlediv.innerHTML = "<font size = 2>" + this.label + "</font>"

            this.canvasdiv = document.createElement("div")
            this.canvasdiv.className = "grid-holder"
            
            
            this.elem.className = "canvas-cacatoo"
            this.elem.width = this.width * this.scale
            this.elem.height = this.height * this.scale
            this.canvasdiv.appendChild(this.elem)
            this.canvasdiv.appendChild(this.titlediv)            
            document.getElementById("canvas_holder").appendChild(this.canvasdiv)
            this.ctx = this.elem.getContext("2d", { willReadFrequently: true })
            
        }
        else {
            // In nodejs, one may use canvas package. Or write the grid to a file to be plotted with R. 
        }

    }

    

    /**
    *  Draw the state of the Gridmodel (for a specific property) onto the HTML element
    */
     displaygrid() {
        let ctx = this.ctx
        let scale = this.scale
        let ncol = this.width
        let nrow = this.height
        let prop = this.property
        
        if(this.spacetime){
            ctx.fillStyle = this.bgcolour
            ctx.fillRect((this.phase%ncol)*scale, 0, scale, nrow * scale)
        }
        else{
            ctx.clearRect(0, 0, scale * ncol, scale * nrow)        
            ctx.fillStyle = this.bgcolour
            ctx.fillRect(0, 0, ncol * scale, nrow * scale)
        }

        var id = ctx.getImageData(0, 0, scale * ncol, scale * nrow);
        var pixels = id.data;

        let start_col = this.offset_x
        let stop_col = start_col + ncol
        let start_row = this.offset_y
        let stop_row = start_row + nrow

        let statecols = this.statecolours[prop]
        
        for (let i = start_col; i < stop_col; i++)         // i are cols
        {
            for (let j = start_row; j< stop_row; j++)     // j are rows
            {                     
                if (!(prop in this.gridmodel.grid[i][j]))
                    continue                     
                
                let value = this.gridmodel.grid[i][j][prop]
                

                if(this.continuous && value !== 0 && this.maxval !== undefined && this.minval !== undefined)
                {                  
                    value = Math.max(this.minval,Math.min(this.maxval,value))
                    value = Math.ceil((value - this.minval)/(this.maxval-this.minval)*this.num_colours)                    
                }                

                if (statecols[value] == undefined)                   // Don't draw the background state                 
                    continue                                    
                
                let idx 
                if (statecols.constructor == Object) {
                    idx = statecols[value]
                }
                else idx = statecols

                for (let n = 0; n < scale; n++) {
                    for (let m = 0; m < scale; m++) {
                        let x = (i-this.offset_x) * scale + n + (this.phase%ncol)*scale
                        let y = (j-this.offset_y) * scale + m
                        var off = (y * id.width + x) * 4;
                        pixels[off] = idx[0];
                        pixels[off + 1] = idx[1];
                        pixels[off + 2] = idx[2];
                    }
                }


            }
            if(this.spacetime) {
                this.phase = (this.phase+1)
                break
            }
        }
        ctx.putImageData(id, 0, 0);
    }

    /**
    *  Draw the state of the Gridmodel (for a specific property) onto the HTML element
    */
     displaygrid_dots() {
        let ctx = this.ctx
        let scale = this.scale
        let ncol = this.width
        let nrow = this.height
        let prop = this.property

        if(this.spacetime){
            ctx.fillStyle = this.bgcolour
            ctx.fillRect((this.phase%ncol)*scale, 0, scale, nrow * scale)
        }
        else{
            ctx.clearRect(0, 0, scale * ncol, scale * nrow)        
            ctx.fillStyle = this.bgcolour
            ctx.fillRect(0, 0, ncol * scale, nrow * scale)         
        }        

        let start_col = this.offset_x
        let stop_col = start_col + ncol
        let start_row = this.offset_y
        let stop_row = start_row + nrow

        let statecols = this.statecolours[prop]
        
        
        for (let i = start_col; i < stop_col; i++)         // i are cols
        {
            for (let j = start_row; j< stop_row; j++)     // j are rows
            {                     
                if (!(prop in this.gridmodel.grid[i][j]))
                    continue                     
                
               

                let value = this.gridmodel.grid[i][j][prop]

                let radius = this.scale_radius*this.radius
                
                if(isNaN(radius)) radius = this.scale_radius*this.gridmodel.grid[i][j][this.radius]                
                if(isNaN(radius)) radius = this.min_radius
                radius = Math.max(Math.min(radius,this.max_radius),this.min_radius)

                if(this.continuous && value !== 0 && this.maxval !== undefined && this.minval !== undefined)
                {                                      
                    value = Math.max(value,this.minval) - this.minval
                    let mult = this.num_colours/(this.maxval-this.minval)
                    value = Math.min(this.num_colours,Math.max(Math.floor(value*mult),1))
                }                

                if (statecols[value] == undefined)                   // Don't draw the background state                 
                    continue
                
                let idx 
                if (statecols.constructor == Object) {
                    idx = statecols[value]
                }
                else idx = statecols

                ctx.beginPath()
                ctx.arc((i-this.offset_x) * scale + 0.5*scale, (j-this.offset_y) * scale + 0.5*scale, radius, 0, 2 * Math.PI, false)
                ctx.fillStyle = 'rgb('+idx[0]+', '+idx[1]+', '+idx[2]+')';
                // ctx.fillStyle = 'rgb(100,100,100)';
                ctx.fill()
                
                if(this.stroke){
                    ctx.lineWidth = this.strokeWidth                   
                    ctx.strokeStyle = this.strokeStyle;
                    ctx.stroke()     
                }
                           
            }
        }
        // ctx.putImageData(id, 0, 0);
    }

    add_legend(div,property)
    {
        if (typeof document == "undefined") return
        let statecols = this.statecolours[property]
        if(statecols == undefined){
            console.warn(`Cacatoo warning: no colours setup for canvas "${this.label}"`)
            return
        } 
                    
        this.legend = document.createElement("canvas")
        this.legend.className = "legend"
        this.legend.width = this.width*this.scale
        
        this.legend.height = 40
        let ctx = this.legend.getContext("2d")
        if(this.maxval!==undefined) {
            let bar_width = this.width*this.scale*0.8
            let offset = 0.1*this.legend.width  
            let n_ticks = this.nticks-1
            
            let tick_increment = (this.maxval-this.minval) / n_ticks
            let step_size =  (this.legend.width / n_ticks)*0.8
            
            
            for(let i=0;i<bar_width;i++)
            {
                let colval = Math.ceil(this.num_colours*i/bar_width)
                if(statecols[colval] == undefined) {                    
                    ctx.fillStyle = this.bgcolor
                }
                else {                    
                    ctx.fillStyle = rgbToHex(statecols[colval])
                }
                ctx.fillRect(offset+i, 10, 1, 10);                
                ctx.closePath();
                
            }
            for(let i = 0; i<n_ticks+1; i++){
                let tick_position = (i*step_size+offset)
                ctx.strokeStyle = "#FFFFFF";                        
                ctx.beginPath();
                ctx.moveTo(tick_position, 15);
                ctx.lineTo(tick_position, 20);
                ctx.lineWidth=2
                ctx.stroke();
                ctx.closePath();
                ctx.fillStyle = "#000000"
                ctx.textAlign = "center";
                ctx.font = '12px helvetica';     
                let ticklab = (this.minval+i*tick_increment)
                ticklab = ticklab.toFixed(this.decimals)         
                ctx.fillText(ticklab, tick_position, 35);
            }

            ctx.beginPath();
            ctx.rect(offset, 10, bar_width, 10);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
            div.appendChild(this.legend)
        }
        else{                     
            let keys = Object.keys(statecols)
            let total_num_values = keys.length
            let spacing = 0.8
            if(total_num_values < 8) spacing = 0.7
            if(total_num_values < 4) spacing = 0.6
            
            let bar_width = this.width*this.scale*spacing   
            let offset = 0.5*(1-spacing)*this.legend.width
            let step_size = Math.ceil(bar_width / (total_num_values-1))

            if(total_num_values==1){
                step_size=0
                offset = 0.5*this.legend.width
            } 
            
            for(let i=0;i<total_num_values;i++)
            {                                       
                let pos = offset+Math.floor(i*step_size)
                ctx.beginPath()                
                ctx.strokeStyle = "#000000"
                if(statecols[keys[i]] == undefined) ctx.fillStyle = this.bgcolor                
                else ctx.fillStyle = rgbToHex(statecols[keys[i]])
                ctx.fillRect(pos-4, 10, 10, 10)
                ctx.closePath()
                ctx.font = '12px helvetica';
                ctx.fillStyle = "#000000"
                ctx.textAlign = "center";
                ctx.fillText(keys[i], pos, 35);
            }
            div.appendChild(this.legend)
        }
        
    }
    remove_legend()
    {
        this.legend.getContext("2d").clearRect(0, 0, this.legend.width, this.legend.height);
    }

    
}

/* 
Functions below are to make sure dygraphs understands the colours used by Cacatoo (converts to hex)
*/
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(arr) {
    return "#" + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2]);
}

export default Canvas