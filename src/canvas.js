/**
 *  Canvas is a wrapper-class for a HTML-canvas element. It is linked to a @Gridmodel object, and stores what from that @Gridmodel should be displayed (width, height, property, scale, etc.)
 */

class Canvas {
    /**
    *  The constructor function for a @Canvas object. 
    *  @param {model} model The model ( @Gridmodel or @Flockmodel ) to which this canvas belongs
    *  @param {string} property the property that should be shown on the canvas
    *  @param {int} height height of the canvas (in rows)
    *  @param {int} width width of the canvas (in cols)
    *  @param {scale} scale of the canvas (width/height of each gridpoint in pixels)
    */
    constructor(model, prop, lab, height, width, scale, continuous, addToDisplay) {
        this.label = lab
        this.model = model
        this.statecolours = model.statecolours
        this.property = prop
        this.height = height
        this.width = width
        this.scale = scale        
        this.continuous = continuous
        this.bgcolour = 'black'
        this.offset_x = 0
        this.offset_y = 0        
        this.phase = 0
        this.addToDisplay = addToDisplay
        
        if (typeof document !== "undefined")                       // In browser, crease a new HTML canvas-element to draw on 
        {
            this.elem = document.createElement("canvas")
            this.titlediv = document.createElement("div")
            if(this.label) this.titlediv.innerHTML = "<p style='height:10'><font size = 3>" + this.label + "</font></p>"

            this.canvasdiv = document.createElement("div")
            this.canvasdiv.className = "grid-holder"
            
            this.elem.className = "canvas-cacatoo"
            this.elem.width = this.width * this.scale
            this.elem.height = this.height * this.scale
            if(!addToDisplay){
                this.canvasdiv.appendChild(this.elem)
                this.canvasdiv.appendChild(this.titlediv)            
                document.getElementById("canvas_holder").appendChild(this.canvasdiv)
            }
            this.ctx = this.elem.getContext("2d", { willReadFrequently: true })
            this.display = this.displaygrid
        }
        else {
            // In nodejs, one may use canvas package. Or write the grid to a file to be plotted with R. 
        }

        this.underlay = function(){}
        this.overlay = function(){}

    }

    

    /**
    *  Draw the state of the model (for a specific property) onto the HTML element
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
        this.underlay()

        var id = ctx.getImageData(0, 0, scale * ncol, scale * nrow);
        var pixels = id.data;

        let start_col = this.offset_x
        let stop_col = start_col + ncol
        let start_row = this.offset_y
        let stop_row = start_row + nrow

        let statecols = this.statecolours[prop]
        
        for (let x = start_col; x < stop_col; x++)         // x are cols
        {
            for (let y = start_row; y< stop_row; y++)     // y are rows
            {                     
                if (!(prop in this.model.grid[x][y]))
                    continue                     
                
                let value = this.model.grid[x][y][prop]
                

                if(this.continuous && this.maxval !== undefined && this.minval !== undefined)
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
                        let xpos = (x-this.offset_x) * scale + n + (this.phase%ncol)*scale
                        let ypos = (y-this.offset_y) * scale + m
                        var off = (ypos * id.width + xpos) * 4;
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
        this.overlay()
    }

    /**
    *  Draw the state of the model (for a specific property) onto the HTML element
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
        this.underlay()

        let start_col = this.offset_x
        let stop_col = start_col + ncol
        let start_row = this.offset_y
        let stop_row = start_row + nrow

        let statecols = this.statecolours[prop]
        
        
        for (let x = start_col; x < stop_col; x++)         // x are cols
        {
            for (let y = start_row; y< stop_row; y++)     // y are rows
            {                     
                if (!(prop in this.model.grid[x][y]))
                    continue                     
                
               

                let value = this.model.grid[x][y][prop]

                let radius = this.scale_radius*this.radius
                
                if(isNaN(radius)) radius = this.scale_radius*this.model.grid[x][y][this.radius]                
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
                ctx.arc((x-this.offset_x) * scale + 0.5*scale, (y-this.offset_y) * scale + 0.5*scale, radius, 0, 2 * Math.PI, false)
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
        this.overlay()
    }

    /**
    *  Draw the state of the flockmodel onto the HTML element
    */
    displayflock() {
        let ctx = this.ctx 
        if(this.model.draw == false) return
        if(this.addToDisplay) this.ctx = this.addToDisplay.ctx
        
        let scale = this.scale
        let ncol = this.width
        let nrow = this.height
        let prop = this.property

        if(!this.addToDisplay) {
            ctx.clearRect(0, 0, scale * ncol, scale * nrow)   
            ctx.fillStyle = this.bgcolour
            ctx.fillRect(0, 0, ncol * scale, nrow * scale)         
        }
        this.underlay()
        
        if(this.model.config.qt_colour) this.model.qt.draw(ctx, this.scale, this.model.config.qt_colour)

        for (let boid of this.model.boids){  // Plot all individuals
            
            if(boid.invisible) continue
            if(!boid.fill) boid.fill = 'black'
            
            if(this.model.statecolours[prop]){
                let val = boid[prop]
                if(this.maxval !== undefined){
                    let cols = this.model.statecolours[prop]
                    val = Math.max(val,this.minval) - this.minval
                    let mult = this.num_colours/(this.maxval-this.minval)
                    val = Math.min(this.num_colours,Math.max(Math.floor(val*mult),1))
                    boid.fill = rgbToHex(cols[val])
                }
                else{
                    boid.fill = rgbToHex(this.model.statecolours[prop][val])
                }
            }
            if(boid.col == undefined) boid.col = this.strokeStyle
            if(boid.lwd == undefined) boid.lwd = this.strokeWidth
            this.drawBoid(boid,ctx)        
        }
        
        if(this.model.config.draw_mouse_radius){
            ctx.beginPath()
            ctx.strokeStyle = this.model.config.draw_mouse_colour || '#FFFFFF'
            ctx.arc(this.model.mousecoords.x*this.scale, this.model.mousecoords.y*this.scale,this.model.config.mouse_radius*this.scale, 0, Math.PI*2)
            ctx.stroke()
            ctx.closePath()
        }
        for(let obs of this.model.obstacles){
            if(obs.type=='rectangle'){
                ctx.fillStyle = obs.fill || '#00000033'
                ctx.fillRect(obs.x*this.scale, obs.y*this.scale,obs.w*this.scale,obs.h*this.scale)
            }
            else if(obs.type=='circle'){
                ctx.beginPath()
                ctx.fillStyle = obs.fill || '#00000033'
                ctx.lineStyle = '#FFFFFF'
                ctx.arc(obs.x*this.scale,obs.y*this.scale,obs.r*this.scale,0,Math.PI*2)
                ctx.fill()
                ctx.closePath()
            }
        }
        
        this.draw_qt()

        this.overlay()

    }

    /**
    *  This function is empty by default, and is overriden based on parameters chose by the model. 
    *  Override options are all below this option. Options are: 
    *  Point: a circle
    *  Rect: a square
    *  Arrow: an arrow that rotates in the direction the boid is moving
    *  Bird: an arrow, but very wide so it looks like a bird
    *  Line: a line that has the direction AND length of the velocity vector
    *  Ant: three dots form an ant body with two lines forming antanae
    *  Png: an image. PNG is sourced from boid.png 
    */
    drawBoid(){
    }

    // Draw a circle at the position of the boid
    drawBoidPoint(boid,ctx){ 
        ctx.fillStyle = boid.fill
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()
        if(boid.col){
            ctx.strokeStyle = boid.col
            ctx.lineWidth = boid.lwd
            ctx.stroke()
        } 
        ctx.closePath()
    }
    
    // Draw a rectangle at the position of the boid
    drawBoidRect(boid,ctx){
        ctx.fillStyle = boid.fill;
        ctx.fillRect(boid.position.x*this.scale,boid.position.y*this.scale,boid.size,boid.size)
        if(boid.col){
            ctx.strokeStyle = boid.col
            ctx.lineWidth = boid.stroke
            ctx.strokeRect(boid.position.x*this.scale,boid.position.y*this.scale,boid.size,boid.size)
        } 
    }
    
    // Draw an arrow pointing in the direction of the velocity vector
    drawBoidArrow(boid,ctx, length=1, width=0.3){
        ctx.save()
        ctx.translate(boid.position.x*this.scale, boid.position.y*this.scale);
        let angle = Math.atan2(boid.velocity.y*this.scale,boid.velocity.x*this.scale)
        ctx.rotate(angle);
        ctx.fillStyle = boid.fill;
        ctx.beginPath();
        ctx.moveTo(length*boid.size,0)
        ctx.lineTo(0, width*boid.size); // Left wing */
        ctx.lineTo(0, -width*boid.size);  // Right wing
        ctx.lineTo(length*boid.size,0);  // Back
        ctx.fill()
        if(boid.col){
            ctx.strokeStyle = boid.col
            ctx.lineWidth = boid.stroke
            ctx.stroke()
        }
        ctx.restore();     
    }

    drawBoidRod(boid, ctx) {
        ctx.fillStyle = boid.fill;
        ctx.lineWidth = boid.size * this.scale;

        // Normalised velocity
        const vector = this.model.normaliseVector(boid.velocity);

        // Front circle
        const frontx = (boid.position.x + 2 * vector.x) * this.scale;
        const fronty = (boid.position.y + 2 * vector.y) * this.scale;
        ctx.beginPath();
        ctx.arc(frontx, fronty, 0.5 * boid.size * this.scale, 0, Math.PI * 2);
        ctx.fill();

        // Back circle
        const backx = (boid.position.x - 2 * vector.x) * this.scale;
        const backy = (boid.position.y - 2 * vector.y) * this.scale;
        ctx.beginPath();
        ctx.arc(backx, backy, 0.5 * boid.size * this.scale, 0, Math.PI * 2);
        ctx.fill();

        // Connecting rod
        ctx.beginPath();
        ctx.strokeStyle = boid.fill;
        ctx.moveTo(frontx, fronty);
        ctx.lineTo(backx, backy);
        ctx.stroke();


        // ================================
        // FLAGELLA (all logic is here!)
        // ================================
        if (boid.flagella) {
            const size = boid.size * this.scale;

            if (boid.flagella === "directed") {
                // Base angle = pointing backwards relative to velocity
                const baseAngle = Math.atan2(-vector.y, -vector.x);

                // 3 flagella fanning out
                const angles = [
                    baseAngle,
                    baseAngle + Math.PI / 10,
                    baseAngle - Math.PI / 10
                ];

                angles.forEach((ang, i) => {
                    this.drawFlagellum(ctx, backx, backy, ang, size, i);
                });

            } else if (boid.flagella === "random") {
                // 3 evenly spaced angles around the circle
                const angles = [
                    0,
                    (2 * Math.PI) / 3,
                    (4 * Math.PI) / 3
                ];

                const r = 0.15 * boid.size * this.scale;
                const cx = boid.position.x * this.scale;
                const cy = boid.position.y * this.scale;

                angles.forEach((ang, i) => {
                    const x = cx + Math.cos(ang) * r;
                    const y = cy + Math.sin(ang) * r;

                    this.drawFlagellum(ctx, x, y, ang, size, i);
                });
            }
        }
    }

    drawFlagellum(ctx, x, y, angle, size, index) {
        const time = this.model.time * 0.2;     // wave speed
        const length = 2 * size;                // flagellum length
        const segments = 6;                     // smoothness
        const amp = 0.3 * size;                 // wiggle amplitude

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let i = 1; i <= segments; i++) {
            const t = i / segments;

            // sinusoidal wave animation
            const wave = Math.sin(t * 6 + time + index) * amp;

            // main direction
            const dx = Math.cos(angle) * (t * length);
            const dy = Math.sin(angle) * (t * length);

            // perpendicular wiggle
            const px = -Math.sin(angle) * wave;
            const py =  Math.cos(angle) * wave;

            ctx.lineTo(x + dx + px, y + dy + py);
        }

        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 0.15 * size;
        ctx.stroke();
    }


    // Similar to the arrow but very wide. Looks a bit like a bird.
    drawBoidBird(boid,ctx){
        this.drawBoidArrow(boid,ctx,0.4,1)
    }

    // Draw a circle at the position of the boid
    drawBoidBunny(boid,ctx){ 
        ctx.fillStyle = boid.fill

        // Head
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        // Ears
        ctx.beginPath()
        ctx.ellipse((boid.position.x+0.2*boid.size)*this.scale,
                (boid.position.y-0.5*boid.size)*this.scale,
                0.2*this.scale*boid.size,
                0.5*this.scale*boid.size,
                0,
                0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.ellipse((boid.position.x-0.2*boid.size)*this.scale,
                (boid.position.y-0.5*boid.size)*this.scale,
                0.2*this.scale*boid.size,
                0.5*this.scale*boid.size,
                0,
                0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        // Eyes
        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.arc((boid.position.x-0.25*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()  
        ctx.closePath()

        ctx.beginPath()
        ctx.arc((boid.position.x+0.25*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()  

        ctx.closePath()

    }

    // Draw a circle at the position of the boid
    drawBoidBear(boid,ctx){ 
        ctx.fillStyle = boid.fill

        // Head
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        // Ears
        ctx.beginPath()
        ctx.arc((boid.position.x+0.4*boid.size)*this.scale,
                (boid.position.y-0.4*boid.size)*this.scale,
                0.25*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc((boid.position.x-0.4*boid.size)*this.scale,
                (boid.position.y-0.4*boid.size)*this.scale,
                0.25*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()

        // Eyes
        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.arc((boid.position.x-0.15*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()  
        ctx.closePath()

        ctx.beginPath()
        ctx.arc((boid.position.x+0.15*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2)
        ctx.fill()  

        ctx.closePath()

    }

    // Draw a line from the boids position to the velocity vector. Indicates speed. 
    drawBoidLine(boid,ctx){
        ctx.beginPath()
        ctx.strokeStyle = boid.col || boid.fill
        ctx.lineWidth = boid.stroke
        
        ctx.moveTo(boid.position.x*this.scale, boid.position.y*this.scale)
            
        ctx.lineTo(boid.position.x*this.scale+boid.velocity.x*boid.size,
                    boid.position.y*this.scale+boid.velocity.y*boid.size)
        ctx.strokeStyle = boid.fill
        ctx.stroke()
        ctx.closePath()
    }

    // Draw three points along the velocity vector + 2 antanae. Sort of an ant thingy. 
    drawBoidAnt(boid,ctx){
        ctx.fillStyle = boid.fill
        
        let vector = this.model.normaliseVector({x: boid.velocity.x, y: boid.velocity.y})

        // First body part
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale-vector.x*boid.size*1.5,
                 boid.position.y*this.scale-vector.y*boid.size*1.5,boid.size*1.2,0,Math.PI*2)
        ctx.fill()
        ctx.closePath()
        
        // Second body part
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale,
                boid.position.y*this.scale,
                boid.size/1.3,0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        // Third body part
        ctx.beginPath()
        ctx.arc(boid.position.x*this.scale+vector.x*boid.size*1.3,
             boid.position.y*this.scale+vector.y*boid.size*1.3,
              boid.size/1.1,0,Math.PI*2)
        ctx.fill()
        ctx.closePath()

        // Food
        if(boid.food){
            ctx.beginPath()
            ctx.fillStyle = boid.food
            
            ctx.arc(boid.position.x*this.scale+vector.x*boid.size*3.5,
                boid.position.y*this.scale+vector.y*boid.size*3.5,
                boid.size*1.2,0,Math.PI*2)
            ctx.fill()
            ctx.closePath()
        }
        
        let dir
        
        ctx.beginPath()
        // First antenna
        dir = this.model.rotateVector(vector,30)
        ctx.moveTo(boid.position.x*this.scale+vector.x*boid.size*1,
            boid.position.y*this.scale+vector.y*boid.size*1)
        ctx.lineTo(boid.position.x*this.scale+vector.x*boid.size*1.8+dir.x*boid.size*1.3,
                    boid.position.y*this.scale+vector.y*boid.size*1.8+dir.y*boid.size*1.3)
        ctx.strokeStyle = boid.fill
        ctx.lineWidth = boid.size/2
        

        // // Second antenna
        
        dir = this.model.rotateVector(vector,-30)
        ctx.moveTo(boid.position.x*this.scale+vector.x*boid.size*1,
            boid.position.y*this.scale+vector.y*boid.size*1)
        ctx.lineTo(boid.position.x*this.scale+vector.x*boid.size*1.8+dir.x*boid.size*1.3,
                    boid.position.y*this.scale+vector.y*boid.size*1.8+dir.y*boid.size*1.3)
        ctx.strokeStyle = boid.fill
        ctx.lineWidth = boid.size/2
        ctx.stroke()
        
        if(boid.col){
            ctx.strokeStyle = boid.col
            ctx.lineWidth = boid.stroke
            ctx.stroke()
        } 
        ctx.closePath()
        
        
    }


    // Draw an image at the position of the boid. Requires boid.png to be set. Optional is boid.pngangle to
    // let the png adjust direction according to the velocity vector
    drawBoidPng(boid,ctx){
        if(boid.pngangle !==undefined){
            ctx.save()
            ctx.translate(boid.position.x*this.scale-boid.size*this.scale*0.5, 
                         boid.position.y*this.scale-boid.size*this.scale*0.5);
            let angle = Math.atan2(boid.velocity.y*this.scale,boid.velocity.x*this.scale+boid.pngangle)
            ctx.rotate(angle);
            if(boid.img == undefined) boid.img = new Image();
            boid.img.src = boid.png
            if(!boid.png) console.warn("Boid does not have a PNG associated with it")
            ctx.drawImage(base_image,0,0,boid.size*this.scale,boid.size*this.scale);
            ctx.restore()
        }
        else{
            if(boid.img == undefined) boid.img = new Image();
            boid.img.src = boid.png
            if(!boid.png) console.warn("Boid does not have a PNG associated with it")
            ctx.drawImage(boid.img, (boid.position.x-0.5*boid.size)*this.scale,
                                       (boid.position.y-0.5*boid.size)*this.scale,
                                      boid.size*this.scale,boid.size*this.scale);
        }
    }
    draw_qt(){


    }
    // Add legend to plot
    add_legend(div,property,lab="")
    {
        if (typeof document == "undefined") return
        let statecols = this.statecolours[property]
        if(statecols == undefined){
            console.warn(`Cacatoo warning: no colours setup for canvas "${this.label}"`)
            return
        }
                    
        this.legend = document.createElement("canvas")
        this.legend.className = "legend"
        this.legend.width = this.width*this.scale*0.6
        
        this.legend.height = 50
        let ctx = this.legend.getContext("2d")

        ctx.textAlign = "center";
        ctx.font = '14px helvetica';     
        ctx.fillText(lab, this.legend.width/2, 16);

        if(this.maxval!==undefined) {
            let bar_width = this.width*this.scale*0.48
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
                ctx.fillRect(offset+i, 20, 1, 10);
                ctx.closePath();
                
            }
            for(let i = 0; i<n_ticks+1; i++){
                let tick_position = (i*step_size+offset)
                ctx.strokeStyle = "#FFFFFF";                        
                ctx.beginPath();
                ctx.moveTo(tick_position, 25);
                ctx.lineTo(tick_position, 30);
                ctx.lineWidth=2
                ctx.stroke();
                ctx.closePath();
                ctx.fillStyle = "#000000"
                ctx.textAlign = "center";
                ctx.font = '12px helvetica';     
                let ticklab = (this.minval+i*tick_increment)
                ticklab = ticklab.toFixed(this.decimals)         
                ctx.fillText(ticklab, tick_position, 45);
            }

            ctx.beginPath();
            ctx.rect(offset, 20, bar_width, 10);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
            div.appendChild(this.legend)
        }
        else{                    
             
            let keys = Object.keys(statecols)
            
            let total_num_values = keys.length
            let spacing = 0.9
            // if(total_num_values < 8) spacing = 0.7
            // if(total_num_values < 4) spacing = 0.8
            
            let bar_width = this.width*this.scale*spacing   
            
            let step_size = Math.round(bar_width / (total_num_values+1))
            let offset = this.legend.width*0.5 - step_size*(total_num_values-1)/2
           

            for(let i=0;i<total_num_values;i++)
            {                                    
                let pos = offset+Math.floor(i*step_size)
                ctx.beginPath()                
                ctx.strokeStyle = "#000000"
                if(statecols[keys[i]] == undefined) ctx.fillStyle = this.bgcolor                
                else ctx.fillStyle = rgbToHex(statecols[keys[i]])
                if(this.radius){
                    ctx.beginPath()
                    ctx.arc(pos,10,5,0,Math.PI*2)
                    ctx.fill()
                    ctx.closePath()
                }
                else{
                    ctx.fillRect(pos-4, 10, 10, 10)
                }
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
    if(arr.length==3) return "#" + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2])
    if(arr.length==4) return "#" + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2]) + componentToHex(arr[3])
}

export default Canvas