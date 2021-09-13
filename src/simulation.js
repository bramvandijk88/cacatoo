import Gridmodel from "./gridmodel"
import Graph from "./graph"
import Canvas from "./canvas"
import MersenneTwister from '../lib/mersenne'


/**
 *  Simulation is the global class of Cacatoo, containing the main configuration  
 *  for making a grid-based model grid and displaying it in either browser or with
 *  nodejs. 
 */
class Simulation {
    /**
    *  The constructor function for a @Simulation object. Takes a config dictionary.
    *  and sets options accordingly.  
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo simulation. 
    */
    constructor(config) {
        this.config = config
        this.rng = new MersenneTwister(config.seed || 53);
        this.sleep = config.sleep || 0
        this.maxtime = config.maxtime || 1000000
        this.ncol = config.ncol || 100
        this.nrow = config.nrow || 100
        
        this.scale = config.scale || 2
        this.maxtime = config.maxtime || 1000000
        this.graph_interval = config.graph_interval || 10
        this.graph_update = config.graph_update || 50
        this.fps = config.fps * 1.4 || 60        

        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.gridmodels = []            // All gridmodels in this simulation
        this.canvases = []              // Array with refs to all canvases (from all models) from this simulation
        this.graphs = []                // All graphs
        this.time = 0
        this.inbrowser = (typeof document !== "undefined")
        this.fpsmeter = true
        if(config.fpsmeter == false) this.fpsmeter = false


    }

    /**
    *  Generate a new GridModel within this simulation.  
    *  @param {string} name The name of your new model, e.g. "gol" for game of life. Cannot contain whitespaces. 
    */
    makeGridmodel(name) {
        if (name.indexOf(' ') >= 0) throw new Error("The name of a gridmodel cannot contain whitespaces.")
        let model = new Gridmodel(name, this.config, this.rng) // ,this.config.show_gridname weggecomment
        this[name] = model           // this = model["cheater"] = CA-obj
        this.gridmodels.push(model)
    }

    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {string} name The name of an existing gridmodel to display
    * @param {string} property The name of the property to display
    * @param {string} customlab Overwrite the display name with something more descriptive
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    */
    createDisplay(name, property, customlab, height, width, scale, x, y) {
        let label = customlab
        if (customlab == undefined) label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name]
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if (height == undefined) height = gridmodel.nr
        if (width == undefined) width = gridmodel.nc
        if (scale == undefined) scale = gridmodel.scale
        
        if(this.inbrowser)
        {
            let cnv = new Canvas(gridmodel, property, label, height, width, scale);
            gridmodel.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
            this.canvases.push(cnv)  // Add a reference to the canvas to the sim
            const canvas = cnv.elem        
            cnv.add_legend(cnv.canvasdiv,property)
            canvas.addEventListener('mousedown', (e) => { this.getCursorPosition(canvas, e, scale) })
            cnv.displaygrid()
        }
        
    }

    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {string} name The name of an existing gridmodel to display
    * @param {string} property The name of the property to display
    * @param {string} customlab Overwrite the display name with something more descriptive
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    */
    createDisplay_continuous(config) {  
    
        let name = config.model
        
        let property = config.property 
        
        
        let label = config.label
        if (label == undefined) label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name]
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr        
        let width = config.width || this[name].nc
        let scale = config.scale || this[name].scale
       
        
        let maxval = config.maxval || this.maxval || undefined
        
        
        let minval = config.minval || 0
        let multiplier = config.multiplier || 1

        
        if(config.fill == "viridis") this[name].colourViridis(property, maxval)    
        else if(config.fill == "inferno") this[name].colourViridis(property, maxval, false, "inferno")    
        else if(config.fill == "red") this[name].colourGradient(property, maxval, [0, 0, 0], [255, 0, 0])
        else if(config.fill == "green") this[name].colourGradient(property, maxval, [0, 0, 0], [0, 255, 0])
        else if(config.fill == "blue") this[name].colourGradient(property, maxval, [0, 0, 0], [0, 0, 255])
        else if(this[name].statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`)
            this[name].colourGradient(property, maxval, [0, 0, 0], [0, 0, 255])
        } 
        
        let cnv = new Canvas(gridmodel, property, label, height, width, scale, true);
        
        gridmodel.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
        if (maxval !== undefined) cnv.maxval = maxval
        if (minval !== undefined) cnv.minval = minval
        if (multiplier !== undefined) cnv.multiplier = multiplier
        
        cnv.add_legend(cnv.canvasdiv,property) 

        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        const canvas = cnv.elem
        canvas.addEventListener('mousedown', (e) => { this.getCursorPosition(canvas, e, scale) })
        cnv.displaygrid()
    }


    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {canvas} canvas A (constant) canvas object
    * @param {event-handler} event Event handler (mousedown)
    * @param {scale} scale The zoom (scale) of the grid to grab the correct grid point
    */
    getCursorPosition(canvas, event, scale) {
        const rect = canvas.getBoundingClientRect()
        const x = Math.floor(Math.max(0, event.clientX - rect.left) / scale)
        const y = Math.floor(Math.max(0, event.clientY - rect.top) / scale)
        console.log(`You have clicked the grid at position ${x},${y}`)
        for (let model of this.gridmodels) {
            console.log(`This corresponds to gridpoint...`)
            console.log(model.grid[x][y])
            console.log(`... in model ${model.name}`)
        }
    }



    /**
    * Update all the grid models one step. Apply optional mixing
    */
    step() {
        for (let i = 0; i < this.gridmodels.length; i++)
            this.gridmodels[i].update()
    }

    /**
    * Apply global events to all grids in the model. 
    * (only perfectmix currently... :D)
    */
    events() {
        for (let i = 0; i < this.gridmodels.length; i++) {
            if (this.mix) this.gridmodels[i].perfectMix()
        }
    }

    /**
     *  Display all the canvases linked to this simulation
     */
    display() {
        for (let i = 0; i < this.canvases.length; i++)
            this.canvases[i].displaygrid()
    }

    /**
     *  Start the simulation. start() detects whether the user is running the code from the browser of
     *  in nodejs. In the browser, a GUI is provided to interact with the model. In nodejs the 
     *  programmer can simply wait for the result without wasting time on displaying intermediate stuff 
     *  (which can be slow)
     */
    start() {
        let model = this    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        let meter = undefined
        if (this.inbrowser) {
            if(this.fpsmeter){               
                meter = new FPSMeter({ position: 'absolute', show: 'ms', left: "auto", top: "45px", right: "25px", graph: 1, history: 20, smoothing: 100});                
                
            } 

            document.title = `Cacatoo - ${this.config.title}`            
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML = `<a target="blank" href="https://bramvandijk88.github.io/cacatoo/"><img class="logos" src="/images/elephant_cacatoo_small.png"></a>`
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += `<a target="blank" href="https://github.com/bramvandijk88/cacatoo"><img class="logos" style="padding-top:32px;" src="/images/gh.png"></a></img>`
            if (this.config.noheader != true && document.getElementById("header") != null) document.getElementById("header").innerHTML = `<div style="height:40px;"><h2>Cacatoo - ${this.config.title}</h2></div><div style="padding-bottom:20px;"><font size=2>${this.config.description}</font size></div>`
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += "<h2>Cacatoo is a toolbox to explore spatially structured models straight from your webbrowser. Suggestions or issues can be reported <a href=\"https://github.com/bramvandijk88/cacatoo/issues\">here.</a></h2>"
            let simStartTime = performance.now();

            async function animate() {
                
                if (model.config.fastmode)          // Fast-mode tracks the performance so that frames can be skipped / paused / etc. Has some overhead, so use wisely!
                {
                    
                    if (model.sleep > 0) await pause(model.sleep)
                    if(sim.fpsmeter) meter.tickStart()
                    let t = 0;              // Will track cumulative time per step in microseconds 

                    while (t < 16.67 * 60 / model.fps)          //(t < 16.67) results in 60 fps if possible
                    {
                        let startTime = performance.now();
                        if(!model.pause==true){
                            model.step()
                            model.events()
                            model.time++
                        }
                        let endTime = performance.now();
                        t += (endTime - startTime);
                        
                        if (!model.limitfps) break
                    }
                    model.display()
                    if(sim.fpsmeter) meter.tick()
                }
                else                    // A slightly more simple setup, but does not allow controls like frame-rate, skipping every nth frame, etc. 
                {
                    if (model.sleep > 0) await pause(model.sleep)
                    if(sim.fpsmeter) meter.tickStart()
                    if (!model.pause == true) {
                        model.step()
                        model.events();
                        model.time++
                    }
                    model.display()
                    if(sim.fpsmeter) meter.tick()
                    
                }

                let frame = requestAnimationFrame(animate);
                if (model.time >= model.config.maxtime) {
                    let simStopTime = performance.now();
                    console.log("Cacatoo completed after", Math.round(simStopTime - simStartTime) / 1000, "seconds")
                    cancelAnimationFrame(frame)
                }

                if (model.pause == true) { cancelAnimationFrame(frame) }
            }

            requestAnimationFrame(animate);
        }
        else {
            while (true) {
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
    initialGrid(gridmodel, property) {
        let p = property || 'val'
        let bg = 0

        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++)                  // j are rows
                gridmodel.grid[i][j][p] = bg

        for (let arg = 2; arg < arguments.length; arg += 2)         // Parse remaining 2+ arguments to fill the grid           
            for (let i = 0; i < gridmodel.nc; i++)                        // i are columns
                for (let j = 0; j < gridmodel.nr; j++)                    // j are rows
                    if (this.rng.random() < arguments[arg + 1]) gridmodel.grid[i][j][p] = arguments[arg];
    }

    /**
     *  populateGrid populates a grid with custom individuals. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {Array} individuals The properties for individuals 1..n
     *  @param {Array} freqs The initial frequency of individuals 1..n
     */
    populateGrid(gridmodel,individuals,freqs)
    {
        let sumfreqs =0
        if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
        for(let i=0; i<freqs.length; i++) sumfreqs += freqs[i]

        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++){                 // j are rows
                let cumsumfreq = 0                
                for (const property in individuals[0]) {
                    gridmodel.grid[i][j][property] = 0    
                }
                for(let n=0; n<individuals.length; n++)
                {
                    cumsumfreq += freqs[n]
                    if(this.rng.random() < cumsumfreq) {
                        Object.assign(gridmodel.grid[i][j],individuals[n])
                        break
                    }
                }
            }
        
    }

    /**
    *  initialSpot populates a grid with states. Grid points close to a certain coordinate are set to state value, while
    *  other cells are set to the bg-state of 0. 
    *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
    *  @param {String} property The name of the state to be set 
    *  @param {integer} value The value of the state to be set (optional argument with position 2, 4, 6, ..., n)
    *  @param {float} fraction The chance the grid point is set to this state (optional argument with position 3, 5, 7, ..., n)
    */
    initialSpot(gridmodel, property, value, size, x, y) {
        let p = property || 'val'
        let bg = 0

        // Draw a circle
        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++)                           // j are rows
            {
                if ((Math.pow((i - x), 2) + Math.pow((j - y), 2)) < size)
                    gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr][p] = value
                else
                    gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr][p] = 0
            }
    }

    /**
     *  populateSpot populates a spot with custom individuals. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {Array} individuals The properties for individuals 1..n
     *  @param {Array} freqs The initial frequency of individuals 1..n
     */
     populateSpot(gridmodel,individuals, freqs,size, x, y)
     {
        let sumfreqs =0
        if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
        for(let i=0; i<freqs.length; i++) sumfreqs += freqs[i]
         
        // Draw a circle
        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
        for (let j = 0; j < gridmodel.nr; j++)                           // j are rows
        {
            for (const property in individuals[0]) gridmodel.grid[i][j][property] = 0 

            if ((Math.pow((i - x), 2) + Math.pow((j - y), 2)) < size)
            {
                let cumsumfreq = 0                
                for(let n=0; n<individuals.length; n++)
                {
                    cumsumfreq += freqs[n]
                    if(this.rng.random() < cumsumfreq) {
                        Object.assign(gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr],individuals[n])
                        break
                    }
                }
            }
        }
         
     }


    /**
     *  addButton adds a HTML button which can be linked to a function by the user. 
     *  @param {string} text Text displayed on the button
     *  @param {function} func Function to be linked to the button
     */
    addButton(text, func) {
        if (!this.inbrowser) return
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
    addSlider(parameter, min = 0.0, max = 2.0, step = 0.01, label) {
        let lab = label || parameter
        if (!this.inbrowser) return
        if (window[parameter] === undefined) { console.warn(`addSlider: parameter ${parameter} not found. No slider made.`); return; }
        let container = document.createElement("div")
        container.classList.add("form-container")

        let slider = document.createElement("input")
        let numeric = document.createElement("input")
        container.innerHTML += "<div style='width:100%;height:20px;font-size:12px;'><b>" + lab + ":</b></div>"

        // Setting slider variables / handler
        slider.type = 'range'
        slider.classList.add("slider")
        slider.min = min
        slider.max = max
        slider.step = step
        slider.value = window[parameter]
        slider.oninput = function () {
            let value = parseFloat(slider.value)
            window[parameter] = parseFloat(value)
            numeric.value = value
        }

        // Setting number variables / handler
        numeric.type = 'number'
        numeric.classList.add("number")
        numeric.min = min
        numeric.max = max
        numeric.step = step
        numeric.value = window[parameter]
        numeric.onchange = function () {
            let value = parseFloat(numeric.value)
            if (value > this.max) value = this.max
            if (value < this.min) value = this.min
            window[parameter] = parseFloat(value)
            numeric.value = value
            slider.value = value
        }
        container.appendChild(slider)
        container.appendChild(numeric)
        document.getElementById("form_holder").appendChild(container)
    }

    /**
     *  Adds some html to an existing DIV in your web page. 
     *  @param {String} div Name of DIV to add to
     *  @param {String} html HTML code to add
     */
    addHTML(div, html) {
        if (!this.inbrowser) return
        let container = document.createElement("div")
        container.innerHTML += html
        document.getElementById(div).appendChild(container)
    }
    /**
     *  log a message to either the console, or to a HTML div. 
     *  @param {String} msg String to write to log
     *  @param {String} target If defined, write log to HTML div with this name
     */
    log(msg, target) {
        if (!this.inbrowser) console.log(msg)
        else if (typeof target == "undefined") console.log(msg)
        else document.getElementById(target).innerHTML += `${msg}<br>`
    }

    /**
     *  Write a gridmodel to a file (only works outside of the browser, useful for running stuff overnight)
     *  @param {String} msg String to write to log
     *  @param {String} target If defined, write log to HTML div with this name
     */
    write_grid(model,property,filename,warn=true) {
        if(this.inbrowser){
            if(warn) console.log("Sorry, writing grid files currently works in NODEJS mode only.")
            return
        }
        else{
            const fs = require('fs');
            // fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
            // if (err) return console.log(err);
            //     console.log('Hello World > helloworld.txt');
            // });
            let string = ""
            for(let i =0; i<model.nc;i++){
                let row = []
                
                for(let j=0;j<model.nr;j++){
                    row.push(model.grid[i][j][property])
                }
                string += row.join(',')
                string += "\n"                                
            }
            fs.appendFileSync(filename, string)            
        }
    }
    /**
     *  addPatternButton adds a pattern button to the HTML environment which allows the user
     *  to load a PNG which then sets the state of 'proparty' for the @GridModel. 
     *  (currently only supports black and white image)
     *  @param {@GridModel} targetgrid The gridmodel containing the grid to be modified. 
     *  @param {String} property The name of the state to be set 
     */
    addPatternButton(targetgrid, property) {
        if (!this.inbrowser) return
        let imageLoader = document.createElement("input")
        imageLoader.type = "file"
        imageLoader.id = "imageLoader"
        let sim = this
        imageLoader.style = "display:none"
        imageLoader.name = "imageLoader"
        document.getElementById("form_holder").appendChild(imageLoader)
        let label = document.createElement("label")
        label.setAttribute("for", "imageLoader");
        label.style = "background-color: rgb(217, 234, 245);border-radius: 10px;border: 2px solid rgb(177, 209, 231);padding:7px;font-size:12px;margin:10px;width:128px;"
        label.innerHTML = "<font size=2>Select your own initial state</font>"
        document.getElementById("form_holder").appendChild(label)
        let canvas = document.createElement('canvas');
        canvas.name = "imageCanvas"
        let ctx = canvas.getContext('2d');
        function handleImage(e) {
            let reader = new FileReader();
            let grid_data

            let grid = e.currentTarget.grid
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    grid_data = get2DFromCanvas(canvas)

                    for (let i = 0; i < grid.nc; i++) for (let j = 0; j < grid.nr; j++) grid.grid[i][j].alive = 0
                    for (let i = 0; i < grid_data[0].length; i++)          // i are columns
                        for (let j = 0; j < grid_data.length; j++)             // j are rows
                        {
                            grid.grid[Math.floor(i + grid.nc / 2 - img.width / 2)][Math.floor(j + grid.nr / 2 - img.height / 2)][property] = grid_data[j][i]
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
    initialPattern(grid, property, image_path, x, y) {
        let sim = this
        if (typeof window != undefined) {
            for (let i = 0; i < grid.nc; i++) for (let j = 0; j < grid.nr; j++) grid.grid[i][j][property] = 0
            let tempcanv = document.createElement("canvas")
            let tempctx = tempcanv.getContext('2d')
            var tempimg = new Image()
            tempimg.onload = function () {
                tempcanv.width = tempimg.width
                tempcanv.height = tempimg.height
                tempctx.drawImage(tempimg, 0, 0);
                let grid_data = get2DFromCanvas(tempcanv)
                if (x + tempimg.width >= grid.nc || y + tempimg.height >= grid.nr) throw RangeError("Cannot place pattern outside of the canvas")
                for (let i = 0; i < grid_data[0].length; i++)         // i are columns
                    for (let j = 0; j < grid_data.length; j++)     // j are rows
                    {
                        grid.grid[x + i][y + j][property] = grid_data[j][i]
                    }
                sim.display()
            }

            tempimg.src = image_path
            tempimg.crossOrigin = "anonymous"

        }
        else {
            console.error("initialPattern currently only supported in browser-mode")
        }

    }

    /**
     *  Toggle the mix option
     */
    toggle_mix() {
        if (this.mix) this.mix = false;
        else this.mix = true;
    }

    /**
     *  Toggle the pause option. Restart the model if pause is disabled. 
     */
    toggle_play() {
        if (this.pause) this.pause = false;
        else this.pause = true;
        if (!this.pause) this.start()
    }

    /**
     *  colourRamp interpolates between two arrays to get a smooth colour scale. 
     *  @param {array} arr1 Array of R,G,B values to start fromtargetgrid The gridmodel containing the grid to be modified. 
     *  @param {array} arr2 Array of R,B,B values to transition towards
     *  @param {integer} n number of steps taken
     *  @return {dict} A dictionary (i.e. named JS object) of colours
     */
    colourRamp(arr1, arr2, n) {
        let return_dict = {}
        for (let i = 0; i < n; i++) {

            return_dict[i] = [Math.floor(arr1[0] + arr2[0] * (i / n)),
            Math.floor(arr1[1] + arr2[1] * (i / n)),
            Math.floor(arr1[2] + arr2[2] * (i / n))]
        }
        return return_dict
    }
}

export default Simulation


/**
* Below are a few global functions that are used by Simulation classes, but not a method of a Simulation instance per se
*/


//Delay for a number of milliseconds
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve, timeoutMsec))

/**
 *  Reconstruct a 2D array based on a canvas 
 *  @param {canvas} canvas HTML canvas element to convert to a 2D grid for Cacatoo
 *  @return {2DArray} Returns a 2D array (i.e. a grid) with the states
 */
function get2DFromCanvas(canvas) {
    let width = canvas.width
    let height = canvas.height
    let ctx = canvas.getContext('2d');
    let img1 = ctx.getImageData(0, 0, width, height);
    let binary = new Array(img1.data.length);
    let idx = 0
    for (var i = 0; i < img1.data.length; i += 4) {
        let num = [img1.data[i], img1.data[i + 1], img1.data[i + 2]]
        let state
        // console.log(num)
        if (JSON.stringify(num) == JSON.stringify([0, 0, 0])) state = 0
        else if (JSON.stringify(num) == JSON.stringify([255, 255, 255])) state = 1
        else if (JSON.stringify(num) == JSON.stringify([255, 0, 0])) state = 2
        else if (JSON.stringify(num) == JSON.stringify([0, 0, 255])) state = 3
        else throw RangeError("Colour in your pattern does not exist in Cacatoo")
        binary[idx] = state
        idx++
    }

    const arr2D = [];
    let rows = 0
    while (rows < height) {
        arr2D.push(binary.splice(0, width));
        rows++;
    }
    return arr2D
}

/**
 *  Parse Cacatoo colours, either given as hexadecimal, rgb, or by name
 *  @param {object} cols Dictionary-style object of int,any_type_of_color pairs
 *  @return {object} Dictionary-style object of int,Cacatoo-color pairs
 */
function parseColours(cols) {
    let return_cols = []
    for (let c of cols) {
        if (typeof c === 'string' || c instanceof String) {
            return_cols.push(stringToRGB(c))
        }
        else {
            return_cols.push(c)
        }
    }
    return return_cols
}
