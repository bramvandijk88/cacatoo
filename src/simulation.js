import GridModel from "./gridmodel"
import Canvas from "./canvas"
import MersenneTwister from '../lib/mersenne'


/**
 *  Simulation is the global Class of Cacatoo, containing the main configuration  
 *  for making a grid-based model grid and displaying it in either browser or with
 *  nodejs. 
 */
class Simulation
{
    /**
    *  The constructor function for a @Simulation object. Takes a config dictionary.
    *  and sets options accordingly.  
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo simulation. 
    */
    constructor(config)
    {     
        this.config = config
        this.rng = new MersenneTwister(config.seed || 53);
        this.sleep = config.sleep || 0
        this.fps = config.fps*1.4 || 60
        this.limitfps = true
        if(config.limitfps==false) this.limitfps = false    
        
        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.gridmodels = []            // All gridmodels in this simulation
        this.canvases = []              // Array with refs to all canvases (from all models) from this simulation
        this.graphs = []                // All graphs
        this.time=0
    }

    /**
    *  Generate a new GridModel within this simulation.  
    *  @param {string} name The name of your new model, e.g. "gol" for game of life. Cannot contain whitespaces. 
    */
    makeGridModel(name)
    {
        if(name.indexOf(' ') >= 0) throw new Error("The name of a gridmodel cannot contain whitespaces.")
        let model = new GridModel(name,this.config,this.rng) // ,this.config.show_gridname weggecomment
        this[name] = model           // this = model["cheater"] = CA-obj
        this.gridmodels.push(model)
    }

    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {string} name The name of an existing gridmodel to display
    * @param {string} property The name of the property to display
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    */
    createDisplay(name,property,height,width,scale)
    {
        let label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let grid = this[name]
        if(grid == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if(height==undefined) height = grid.nr
        if(width==undefined) width = grid.nc
        if(scale==undefined) scale = grid.scale        
        let cnv = new Canvas(grid,property,label,height,width,scale); 
        grid.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        cnv.displaygrid()
        
    }

    /**
    * Create a dygraphs XY graph, showing an arbitrary number of
    * @param {string} name The name of an existing gridmodel to display
    * @param {string} property The name of the property to display
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    */
    plotXY(graph_labels,graph_values,cols,title,opts)
    {
        if(typeof window == 'undefined') return
        if(!(title in this.graphs))
        {
            cols = parseColours(cols)                            
            this.graphs[title] = new Graph(graph_labels,graph_values,cols,title,opts)                        
        }
        else 
        {
            if(this.time%this.graph_interval==0)
            {  
                this.graphs[title].push_data(graph_values)     
            }
            if(this.time%this.graph_update==0)
            {
                this.graphs[title].update()
            }
        }
        
    }

    /**
    * Update all the grid models one step. Apply optional mixing
    */
    step()
    {        
        for(let i = 0; i<this.gridmodels.length; i++)
            this.gridmodels[i].update()
    }

    /**
    * Apply global events to all grids in the model. 
    * (only perfectmix currently... :D)
    */
    events()
    {        
        for(let i = 0; i<this.gridmodels.length; i++)
        {
            if(this.mix) this.gridmodels[i].perfectMix()            
        }
    }

    /**
     *  Display all the canvases linked to this simulation
     */
    display()
    {
        for(let i = 0; i<this.canvases.length; i++)
            this.canvases[i].displaygrid()
    }

    /**
     *  Start the simulation. start() detects whether the user is running the code from the browser of
     *  in nodejs. In the browser, a GUI is provided to interact with the model. In nodejs the 
     *  programmer can simply wait for the result without wasting time on displaying intermediate stuff 
     *  (which can be slow)
     */
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
                        model.step()
                        model.events()
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
                    model.step()                                    
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

    /**
     *  initialGrid populates a grid with states. The number of arguments 
     *  is flexible and defined the percentage of every state. For example,
     *  initialGrid('grid','species',1,0.5,2,0.25) populates the grid with 
     *  two species (1 and 2), where species 1 occupies 50% of the grid, and
     *  species 2 25%. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {String} property The name of the state to be set 
     *  @param {integer} value The value of the state to be set (optional argument with position 2, 4, 6, ..., n)
     *  @param {float} fraction The chance the grid point is set to this state (optional argument with position 3, 5, 7, ..., n)
     */
    initialGrid(grid,property)
    {
        let p = property || 'val'
        let bg = 0
        
        for(let i=0;i<grid.nc;i++)                          // i are columns
                for(let j=0;j<grid.nr;j++)                  // j are rows
                    grid.grid[i][j][p] = bg
        
        for (let arg=2; arg<arguments.length; arg+=2)         // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<grid.nc;i++)                        // i are columns
                for(let j=0;j<grid.nr;j++)                    // j are rows
                    if(this.rng.random() < arguments[arg+1]) grid.grid[i][j][p] = arguments[arg];                    
    }

    
    /**
     *  addButton adds a HTML button which can be linked to a function by the user. 
     *  @param {string} text Text displayed on the button
     *  @param {function} func Function to be linked to the button
     */
    addButton(text,func)
    {
        if(typeof window == 'undefined') return
        let button = document.createElement("button") 
        button.innerHTML = text;
        button.addEventListener("click", func, true); 
        document.getElementById("form_holder").appendChild(button)                   
    }
    
    /**
     *  addSlider adds a HTML slider to the DOM-environment which allows the user
     *  to modify a model parameter at runtime. 
     *  @param {string} parameter The name of the (global!) parameter to link to the slider
     *  @param {float} [min] Minimal value of the slider
     *  @param {float} [max] Maximum value of the slider
     *  @param {float} [step] Step-size when modifying
     */
    addSlider(parameter,min=0.0,max=2.0,step=0.01)
    {
        if(typeof window == "undefined") return
        if(window[parameter] == "undefined") {console.warn(`addSlider: parameter ${parameter} not found. No slider made.`); return;}
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

    /**
     *  addPatternButton adds a pattern button to the HTML environment which allows the user
     *  to load a PNG which then sets the state of 'proparty' for the @GridModel. 
     *  (currently only supports black and white image)
     *  @param {@GridModel} targetgrid The gridmodel containing the grid to be modified. 
     *  @param {String} property The name of the state to be set 
     */
    addPatternButton(targetgrid,property)
    {        
        let imageLoader = document.createElement("input") 
        imageLoader.type  = "file"       
        imageLoader.id = "imageLoader"
        let sim = this
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
                    sim.display()
                    
                }
                img.src = event.target.result;
                
            }              
            reader.readAsDataURL(e.target.files[0]);
            document.getElementById("imageLoader").value = "";
        }
    imageLoader.addEventListener('change', handleImage, false);
    imageLoader.grid = targetgrid    // Bind a grid to imageLoader 
    }   

    /**
     *  initialPattern takes a @GridModel and loads a pattern from a PNG file. Note that this
     *  will only work when Cacatoo is ran on a server due to security issues. If you want to
     *  use this feature locally, there are plugins for most browser to host a simple local
     *  webserver. 
     *  (currently only supports black and white image)
     */
     initialPattern(grid,property,image_path, x, y)
     {
         let sim = this
         if(typeof window != undefined)
         {
             for(let i=0;i<grid.nc;i++) for(let j=0;j<grid.nr;j++) grid.grid[i][j][property] = 0
             let tempcanv = document.createElement("canvas")
             let tempctx = tempcanv.getContext('2d')
             var tempimg = new Image()
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
                 sim.display()         
             }                
             
             tempimg.src=image_path   
             tempimg.crossOrigin="anonymous"
             
         }
         else
         {
             console.error("initialPattern currently only supported in browser-mode")
         }
         
    }

    /**
     *  Toggle the mix option
     */
    toggle_mix()
    {
        if(this.mix)  this.mix=false;         
        else this.mix = true;
    } 

    /**
     *  Toggle the pause option. Restart the model if pause is disabled. 
     */  
    toggle_play()
    {
        if(this.pause)  this.pause=false;         
        else this.pause = true;
        if(!this.pause) this.start()
    }

    /**
     *  colourRamp interpolates between two arrays to get a smooth colour scale. 
     *  @param {array} arr1 Array of R,G,B values to start fromtargetgrid The gridmodel containing the grid to be modified. 
     *  @param {array} arr2 Array of R,B,B values to transition towards
     *  @param {integer} n number of steps taken
     *  @return {dict} A dictionary (i.e. named JS object) of colours
     */    
    colourRamp(arr1, arr2, n)
    {
        let return_dict = {}
        for(let i=0;i<n;i++)
        {
            
            return_dict[i] = [Math.floor(arr1[0]+arr2[0]*(i/n)), 
                              Math.floor(arr1[1]+arr2[1]*(i/n)), 
                              Math.floor(arr1[2]+arr2[2]*(i/n))]
        }
        return return_dict
    }
}

export default Simulation


/**
* Below are a few global functions that are used by Simulation classes, but not a method of a Simulation instance per se
*/

//Delay for a number of milliseconds
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve,timeoutMsec))

//Reconstruct a 2D array based on the canvas
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


