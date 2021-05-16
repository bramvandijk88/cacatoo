import CA from "./ca"
import Graph from './graph'


class Model
{
    constructor(config)
    {                  
        this.config = config
        this.rng = new MersenneTwister(config.seed || 53);
        this.sleep = config.sleep || 0
        this.fps = config.fps || 60 
        this.limitfps = true
        if(config.limitfps==false) this.limitfps = false                                       // Turbo allows multiple updates of the CA before the screen refreshes. It is faster, but it can be confusing if you see two or more changes happening at once. 
        this.CAs = []
        this.time=0
    }

    makeGrid(name)
    {
        let ca = new CA(name,this.config,this.rng,this.config.show_gridname)
        this[name] = ca
        this.CAs.push(ca)
    }

    step()
    {        
        for(let ca of this.CAs)
            ca.update()
    }
    
    stop()
    {
        model.pause=true
    }

    display()
    {
        for(let ca of this.CAs)
            ca.displaygrid()
    }

    start()
    {        
        let model = this    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        if(typeof window != 'undefined')
        {
            let meter = new FPSMeter({show:'fps',left:"auto", top:"80px",right:"30px",graph:1,history:20})

            document.title = `Cacatoo - ${this.config.title}`
            document.getElementById("header").innerHTML = `<h2>Cacatoo - ${this.config.title}</h2><font size=3>${this.config.description}</font size>`
            document.getElementById("footer").innerHTML = "<h2>Cacatoo (<u>ca</u>sh-like <u>c</u>ellular <u>a</u>utomaton <u>too</u>lkit) is currently <a href=\"https://github.com/bramvandijk88/cacatoo\">under development</a>. Feedback <a href=\"https://www.bramvandijk.org/contact/\">very welcome.</a></h2>"
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
                if(model.pause==true) { model.pause=false;cancelAnimationFrame(frame) }
                
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

    initialGrid(ca,property,def_state)
    {
        let p = property || 'val'
        let bg = def_state
        
        for(let i=0;i<ca.nc;i++)                          // i are columns
                for(let j=0;j<ca.nr;j++)                  // j are rows
                    ca.grid[i][j][p] = bg
        
        for (let arg=3; arg<arguments.length; arg+=2)       // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<ca.nc;i++)                        // i are columns
                for(let j=0;j<ca.nr;j++)                    // j are rows
                    if(this.rng.random() < arguments[arg+1]) ca.grid[i][j][p] = arguments[arg];                    
    }

    initialPattern(ca,property,image_path, x, y)
    {
        if(typeof window != undefined)
        {
            for(let i=0;i<ca.nc;i++) for(let j=0;j<ca.nr;j++) ca.grid[i][j][property] = 0                        
            let tempcanv = document.createElement("canvas")
            let tempctx = tempcanv.getContext('2d')
            var tempimg = new Image();                        
            tempimg.onload = function() 
            {                               
                tempcanv.width = tempimg.width
                tempcanv.height = tempimg.height
                tempctx.drawImage(tempimg,0,0);
                let grid_data = get2DFromCanvas(tempcanv)                                                        
                if(x+tempimg.width >= ca.nc || y+tempimg.height >= ca.nr) throw RangeError("Cannot place pattern outside of the canvas")                
                for(let i=0;i<grid_data[0].length;i++)         // i are columns
                for(let j=0;j<grid_data.length;j++)     // j are rows
                {                       
                    ca.grid[x+i][y+j][property] = grid_data[j][i]
                }                
                ca.displaygrid()              
            }                
            
            tempimg.src=image_path   
            tempimg.crossOrigin="anonymous"
            
        }
        else
        {
            console.error("initialPattern currently only supported in browser-mode")
        }
        
    }
    
    addPatternButton(targetca, property)
    {        
        let imageLoader = document.createElement("input") 
        imageLoader.type  = "file"       
        imageLoader.id = "imageLoader"
        imageLoader.style="display:none"
        imageLoader.name="imageLoader"
        document.getElementById("form_holder").appendChild(imageLoader)
        let label = document.createElement("label")
        label.setAttribute("for","imageLoader");
        label.style="background-color: rgb(171, 228, 230); border-radius: 10px; border:1px solid grey;padding:5px;width:200px;"
        label.innerHTML="Select your own initial state"
        document.getElementById("form_holder").appendChild(label)
        let canvas = document.createElement('canvas');
        canvas.name="imageCanvas"
        let ctx = canvas.getContext('2d');
        function handleImage(e)
        {
            let reader = new FileReader();
            let grid_data
            
            let ca = e.currentTarget.ca 
            reader.onload = function(event)
            {
                var img = new Image();        
                img.onload = function()
                {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img,0,0);
                    
                    grid_data = get2DFromCanvas(canvas)
                    
                    for(let i=0;i<ca.nc;i++) for(let j=0;j<ca.nr;j++) ca.grid[i][j].alive = 0
                    for(let i=0;i<grid_data[0].length;i++)          // i are columns
                    for(let j=0;j<grid_data.length;j++)             // j are rows
                    {                                     
                        ca.grid[Math.floor(i+ca.nc/2-img.width/2)][Math.floor(j+ca.nr/2-img.height/2)][property] = grid_data[j][i]
                    }
                     
                    
                }
                img.src = event.target.result;
            }              
            reader.readAsDataURL(e.target.files[0]);
            document.getElementById("imageLoader").value = "";
    }

    imageLoader.addEventListener('change', handleImage, false);
    imageLoader.ca = targetca    // Bind a ca to imageLoader 
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

