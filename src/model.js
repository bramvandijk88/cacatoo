import GridSystem from "./grid"
import Canvas from "./canvas";

/**
 *  Model is the primary Class of Cacatoo, containing the main configuration  
 *  for making a grid-based model grid and displaying it in either browser or with
 *  nodejs. */
class Model
{
    constructor(config)
    {                  
        this.config = config
        this.rng = new MersenneTwister(config.seed || 53);
        this.sleep = config.sleep || 0
        this.fps = config.fps*1.4 || 60 
        this.limitfps = true
        if(config.limitfps==false) this.limitfps = false    
        
        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.grids = []
        this.canvases = []
        this.graphs = []
        this.time=0
    }

    makeGrid(name)
    {
        let grid = new GridSystem(name,this.config,this.rng,this.config.show_gridname)
        this[name] = grid
        this.grids.push(grid)
    }

    displayGrid(name,property,height,width,scale)
    {
        let label = `${name} (${property})`
        let grid = this[name]
        if(height==undefined) height = grid.nr
        if(width==undefined) width = grid.nc
        if(scale==undefined) scale = grid.scale        
        let cnv = new Canvas(grid,property,label,height,width,scale);  
        this.canvases.push(cnv)
    }

    step()
    {        
        for(let i = 0; i<this.grids.length; i++)
        {
            this.grids[i].update()
            if(this.mix) this.grids[i].perfectMix()
        }
    }
    
    stop()
    {
        model.pause=true
    }

    toggle_play()
    {
        if(this.pause)  this.pause=false;         
        else this.pause = true;
        if(!this.pause) this.start()
    }
    toggle_mix()
    {
        if(this.mix)  this.mix=false;         
        else this.mix = true;
    }


    display()
    {
        for(let i = 0; i<this.canvases.length; i++)
            this.canvases[i].displaygrid()
    }

    start()
    {        
        let model = this    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        if(typeof window != 'undefined')
        {
            let meter = new FPSMeter({show:'fps',left:"auto", top:"80px",right:"30px",graph:1,history:20})

            document.title = `Cacatoo - ${this.config.title}`
            document.getElementById("header").innerHTML = `<h2>Cacatoo - ${this.config.title}</h2><font size=3>${this.config.description}</font size>`
            document.getElementById("footer").innerHTML = "<h2>Cacatoo (<u>grid</u>sh-like <u>c</u>ellular <u>a</u>utomaton <u>too</u>lkit) is currently <a href=\"https://github.com/bramvandijk88/cacatoo\">under development</a>. Feedback <a href=\"https://www.bramvandijk.org/contact/\">very welcome.</a></h2>"
            let simStartTime = performance.now();
      
            async function animate()
            {   
                if(model.config.fastmode)          // Fast-mode tracks the performance so that frames can be skipped / paused / etc. Has some overhead, so use wisely!
                {
                    if(model.sleep>0) await pause(model.sleep)                                
                    
                    let t = 0;              // Will track cumulative time per step in microseconds 

                    while(t<16.67*60/model.fps)          //(t < 16.67) results in 60 fps if possible
                    {
                        let startTime = performance.now();
                        model.step();
                        let endTime = performance.now();            
                        t += (endTime - startTime);                    
                        model.time++    
                        if(!model.limitfps) break        
                    }      
                    model.display()
                    meter.tick()                   
                }
                else                    // A slightly more simple setup, but does not allow controls like frame-rate, skipping every nth frame, etc. 
                {
                    meter.tickStart()
                    model.step();                                    
                    model.display()
                    meter.tick()
                    model.time++  
                }
                
                let frame = requestAnimationFrame(animate);        
                if(model.time>=model.config.maxtime)
                { 
                    let simStopTime = performance.now();
                    console.log("Cacatoo completed after",Math.round(simStopTime-simStartTime)/1000,"seconds")
                    cancelAnimationFrame(frame)                
                }
                if(model.pause==true) {cancelAnimationFrame(frame) }
                
            }
            
            requestAnimationFrame(animate);
        }
        else
        {
            while(true)
            {
                model.step();   
                model.time++
            }
        }
    }

    initialGrid(grid,property,def_state)
    {
        let p = property || 'val'
        let bg = def_state
        
        for(let i=0;i<grid.nc;i++)                          // i are columns
                for(let j=0;j<grid.nr;j++)                  // j are rows
                    grid.grid[i][j][p] = bg
        
        for (let arg=3; arg<arguments.length; arg+=2)       // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<grid.nc;i++)                        // i are columns
                for(let j=0;j<grid.nr;j++)                    // j are rows
                    if(this.rng.random() < arguments[arg+1]) grid.grid[i][j][p] = arguments[arg];                    
    }

    initialPattern(grid,property,image_path, x, y)
    {
        if(typeof window != undefined)
        {
            for(let i=0;i<grid.nc;i++) for(let j=0;j<grid.nr;j++) grid.grid[i][j][property] = 0                        
            let tempcanv = document.createElement("canvas")
            let tempctx = tempcanv.getContext('2d')
            var tempimg = new Image();                        
            tempimg.onload = function() 
            {                               
                tempcanv.width = tempimg.width
                tempcanv.height = tempimg.height
                tempctx.drawImage(tempimg,0,0);
                let grid_data = get2DFromCanvas(tempcanv)                                                        
                if(x+tempimg.width >= grid.nc || y+tempimg.height >= grid.nr) throw RangeError("Cannot place pattern outside of the canvas")                
                for(let i=0;i<grid_data[0].length;i++)         // i are columns
                for(let j=0;j<grid_data.length;j++)     // j are rows
                {                       
                    grid.grid[x+i][y+j][property] = grid_data[j][i]
                }                
                grid.displaygrid()              
            }                
            
            tempimg.src=image_path   
            tempimg.crossOrigin="anonymous"
            
        }
        else
        {
            console.error("initialPattern currently only supported in browser-mode")
        }
        
    }

    addButton(text,func)
    {
        if(typeof window == undefined) console.error("Buttons can't be added in command-line mode.")
        let button = document.createElement("button") 
        button.innerHTML = text;
        button.addEventListener("click", func, true); 
        document.getElementById("form_holder").appendChild(button)                   
    }

    addSlider(parameter,min=0.0,max=2.0,step=0.01)
    {
        if(typeof window == undefined) console.warn("Sliders can't be added in command-line mode.")
        if(window[parameter] == undefined) {console.warn(`addSlider: parameter ${parameter} not found. No slider made.`); return;}
        let container = document.createElement("div")
        container.classList.add("form-container")
        let slider = document.createElement("input") 
        let output = document.createElement("output")
        container.innerHTML += "<div style='width:100%'><b>"+parameter+":</b></div>"
        output.innerHTML = window[parameter].toFixed(3)
        slider.type='range'
        slider.classList.add("slider")
        slider.min=min
        slider.max=max        
        slider.step=step
        slider.value=window[parameter]
        slider.oninput = function()
        {
            let value = parseFloat(slider.value)
            output.innerHTML = value.toFixed(3)
            window[parameter] = parseFloat(value)
        }        
        container.appendChild(slider)
        container.appendChild(output)
        document.getElementById("form_holder").appendChild(container)                   
    }

    addPatternButton(targetgrid, property)
    {        
        let imageLoader = document.createElement("input") 
        imageLoader.type  = "file"       
        imageLoader.id = "imageLoader"
        imageLoader.style="display:none"
        imageLoader.name="imageLoader"
        document.getElementById("form_holder").appendChild(imageLoader)
        let label = document.createElement("label")
        label.setAttribute("for","imageLoader");
        label.style="background-color: rgb(171, 228, 230); border-radius: 10px; border:1px solid grey;padding:4px;margin:5px;width:200px;"
        label.innerHTML="<font size=2>Select your own initial state</font>"
        document.getElementById("form_holder").appendChild(label)
        let canvas = document.createElement('canvas');
        canvas.name="imageCanvas"
        let ctx = canvas.getContext('2d');
        function handleImage(e)
        {
            let reader = new FileReader();
            let grid_data
            
            let grid = e.currentTarget.grid 
            reader.onload = function(event)
            {
                var img = new Image();        
                img.onload = function()
                {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img,0,0);
                    
                    grid_data = get2DFromCanvas(canvas)
                    
                    for(let i=0;i<grid.nc;i++) for(let j=0;j<grid.nr;j++) grid.grid[i][j].alive = 0
                    for(let i=0;i<grid_data[0].length;i++)          // i are columns
                    for(let j=0;j<grid_data.length;j++)             // j are rows
                    {                                     
                        grid.grid[Math.floor(i+grid.nc/2-img.width/2)][Math.floor(j+grid.nr/2-img.height/2)][property] = grid_data[j][i]
                    }
                     
                    
                }
                img.src = event.target.result;
            }              
            reader.readAsDataURL(e.target.files[0]);
            document.getElementById("imageLoader").value = "";
    }

    imageLoader.addEventListener('change', handleImage, false);
    imageLoader.grid = targetgrid    // Bind a grid to imageLoader 
    imageLoader.property = property
    }    
}

export default Model

/**
* Delay for a number of milliseconds
*/
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve,timeoutMsec))

function get2DFromCanvas(canvas)
{
    let width = canvas.width
    let height = canvas.height
    let ctx = canvas.getContext('2d');    
    let img1 = ctx.getImageData(0, 0, width, height); 
    let binary = new Array(img1.data.length);
    let idx = 0
    for (var i = 0; i < img1.data.length; i+=4) 
    {            
        let num = [img1.data[i],img1.data[i+1],img1.data[i+2]]
        let state 
        // console.log(num)
        if(JSON.stringify(num) == JSON.stringify([0,0,0])) state = 0
        else if(JSON.stringify(num) == JSON.stringify([255,255,255])) state = 1
        else if(JSON.stringify(num) == JSON.stringify([255,0,0])) state = 2
        else if(JSON.stringify(num) == JSON.stringify([0,0,255])) state = 3
        else throw RangeError("Colour in your pattern does not exist in cash")
        binary[idx] = state
        idx++
    }

    const arr2D = [];
    let rows = 0
    while(rows < height) 
    {
        arr2D.push(binary.splice(0,width));
        rows++;
    }
    return arr2D
}


