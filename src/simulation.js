import Gridmodel from "./gridmodel"
import Flockmodel from "./flockmodel"
import Canvas from "./canvas"
//import MersenneTwister from '../lib/mersenne' 
import * as utility from './utility'
import random from '../lib/random'


/**
 *  Simulation is the global class of Cacatoo, containing the main configuration  
 *  for making a grid-based model and displaying it in either browser or with
 *  nodejs. 
 */
class Simulation {
    /**
    *  The constructor function for a @Simulation object. Takes a config dictionary.
    *  and sets options accordingly.  
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo simulation. 
    */
    constructor(config) {        
        if(config == undefined) config = {}
        this.config = config                
        this.rng = this.setupRandom(config.seed)
        // this.rng_old = new MersenneTwister(config.seed || 53);        
        this.sleep = config.sleep = config.sleep || 0
        this.maxtime = config.maxtime = config.maxtime || 1000000
        this.ncol = config.ncol = config.ncol || 100
        this.nrow = config.nrow = config.nrow || 100  
        this.scale = config.scale = config.scale || 2
        this.skip = config.skip || 0;
        this.graph_interval = config.graph_interval = config.graph_interval || 10
        this.graph_update = config.graph_update= config.graph_update || 50
        this.fps = config.fps * 1.4 || 60 // Multiplied by 1.4 to adjust for overhead
        this.mousecoords = {x:-1000, y:-1000}

        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.gridmodels = []            // All gridmodels in this simulation
        this.flockmodels = []            // All gridmodels in this simulation
        this.canvases = []              // Array with refs to all canvases (from all models) from this simulation
        this.graphs = []                // All graphs
        this.time = 0
        this.inbrowser = (typeof document !== "undefined")        
        this.fpsmeter = false
        if(config.fpsmeter == true) this.fpsmeter = true
        
        this.printcursor = true
        if(config.printcursor == false) this.printcursor = false        
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
    *  Generate a new GridModel within this simulation.  
    *  @param {string} name The name of your new model, e.g. "gol" for game of life. Cannot contain whitespaces. 
    */
    makeFlockmodel(name, cfg) {
        let cfg_combined = {...this.config,...cfg}
        if (name.indexOf(' ') >= 0) throw new Error("The name of a gridmodel cannot contain whitespaces.")
        let model = new Flockmodel(name, cfg_combined, this.rng) // ,this.config.show_gridname weggecomment
        this[name] = model           // this = model["cheater"] = CA-obj
        this.flockmodels.push(model)
    }

    /**
    * Set up the random number generator
    * @param {int} seed Seed for fast-random module
    */
    setupRandom(seed){   
        // Load mersennetwister random number generator  
        // genrand_real1()          [0,1]
        // genrand_real2()          [0,1)
        // genrand_real3()          (0,1)
        // genrand_int(min,max)     integer between min and max
        // let rng = new MersenneTwister(seed || 53)                                        // Use this if you need a more precise RNG      
        
        let rng = random(seed);
        
        rng.genrand_real1 = function () { return (rng.nextInt() - 1) / 2147483645 }         // Generate random number in [0,1] range        
        rng.genrand_real2 = function () { return (rng.nextInt() - 1) / 2147483646 }         // Generate random number in [0,1) range        
        rng.genrand_real3 = function () { return rng.nextInt() / 2147483647 }               // Generate random number in (0,1) range        
        rng.genrand_int = function (min,max) { return min+ rng.nextInt() % (max-min+1) }    // Generate random integer between (and including) min and max    
                
        for(let i = 0; i < 1000; i++) rng.genrand_real2()        
        rng.random = () => { return rng.genrand_real2() }        
        rng.randomInt = () => { return rng.genrand_int() }     
        
        rng.randomGaus = (mean=0, stdev=1) => { // Standard gaussian sample
            const u = 1 - sim.rng.random(); 
            const v = sim.rng.random();
            const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
            return z * stdev + mean;
        }           
        return rng
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
    createDisplay(name, property, customlab, height, width, scale) {
        if(! this.inbrowser) {
            console.warn("Cacatoo:createDisplay, cannot create display in command-line mode.")
            return
        }
        if(typeof arguments[0] === 'object')
        {
            name = arguments[0].name 
            property = arguments[0].property
            customlab = arguments[0].label 
            height = arguments[0].height 
            width = arguments[0].width 
            scale = arguments[0].scale 
        }
        
        
        if(name==undefined || property == undefined) throw new Error("Cacatoo: can't make a display with out a 'name' and 'property'")        

        let label = customlab 
        if (customlab == undefined) label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name]        
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if (height == undefined) height = gridmodel.nr
        if (width == undefined) width = gridmodel.nc
        if (scale == undefined) scale = gridmodel.scale

        if(gridmodel.statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`)                        
            gridmodel.statecolours[property] = utility.default_colours(10)
        } 
        
        let cnv = new Canvas(gridmodel, property, label, height, width, scale);
        gridmodel.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        const canvas = cnv        
        cnv.add_legend(cnv.canvasdiv,property)
        cnv.bgcolour = this.config.bgcolour || 'black'
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(canvas, e, scale) }, false)
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas }, false)
        cnv.displaygrid()                
    }       
    createGridDisplay = this.createDisplay

    /**
    * Create a display for a flockmodel, showing the boids
    * @param {string} name The name of an existing gridmodel to display
    * @param {Object} config All the options for the flocking behaviour etc.
    */
    createFlockDisplay(name, config = {}) {
        if(! this.inbrowser) {
            console.warn("Cacatoo:createFlockDisplay, cannot create display in command-line mode.")
            return
        }

        if(name==undefined) throw new Error("Cacatoo: can't make a display with out a 'name'")        

        let flockmodel = this[name]        
        if (flockmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)

        let property = config.property 
        let addToDisplay = config.addToDisplay
        
        
        let label = config.label || ""
        let legendlabel = config.legendlabel
        let height = sim.height || flockmodel.height
        let width = config.width || sim.width || flockmodel.width
        let scale = config.scale || this[name].scale               
        let maxval = config.maxval || this.maxval || undefined   
        let decimals= config.decimals || 0
        let nticks= config.nticks || 5
        let minval = config.minval || 0
        let num_colours = config.num_colours || 100
        

        if(config.fill == "viridis") this[name].colourViridis(property, num_colours)    
        else if(config.fill == "inferno") this[name].colourViridis(property, num_colours, false, "inferno")    
        else if(config.fill == "pride") this[name].colourViridis(property, num_colours, false, "pride")    
        else if(config.fill == "rainbow") this[name].colourViridis(property, num_colours, false, "rainbow")    
        else if(config.fill == "inferno_rev") this[name].colourViridis(property, num_colours, true, "inferno")    
        else if(config.fill == "red") this[name].colourGradient(property, num_colours, [0, 0, 0], [255, 0, 0])
        else if(config.fill == "green") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 255, 0])
        else if(config.fill == "blue") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255])
        else if(this[name].statecolours[property]==undefined && property){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`)
            this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255])
        }
        
        
        let cnv = new Canvas(flockmodel, property, label, height, width,scale,false,addToDisplay);
        if (maxval !== undefined) cnv.maxval = maxval
        if (minval !== undefined) cnv.minval = minval
        if (num_colours !== undefined) cnv.num_colours = num_colours
        if (decimals !== undefined) cnv.decimals = decimals
        if (nticks !== undefined) cnv.nticks = nticks

        cnv.strokeStyle = config.strokeStyle
        cnv.strokeWidth = config.strokeWidth
        
        if(config.legend!==false){
            if(addToDisplay) cnv.add_legend(addToDisplay.canvasdiv,property,legendlabel)
            else cnv.add_legend(cnv.canvasdiv,property,legendlabel )
        }

        // Set the shape of the boid
        let shape = flockmodel.config.shape || 'dot'
        cnv.drawBoid = cnv.drawBoidArrow
        if(shape == 'bird') cnv.drawBoid = cnv.drawBoidBird
        else if(shape == 'arrow') cnv.drawBoid = cnv.drawBoidArrow
        else if(shape == 'rect') cnv.drawBoid = cnv.drawBoidRect
        else if(shape == 'dot') cnv.drawBoid = cnv.drawBoidPoint
        else if(shape == 'ant') cnv.drawBoid = cnv.drawBoidAnt
        else if(shape == 'line') cnv.drawBoid = cnv.drawBoidLine
        else if(shape == 'png') cnv.drawBoid = cnv.drawBoidPng
        
        // Replace function that handles the left mousebutton
        let click = flockmodel.config.click || 'none'
        if(click == 'repel') flockmodel.handleMouseBoids = flockmodel.repelBoids
        else if(click == 'pull') flockmodel.handleMouseBoids = flockmodel.pullBoids
        else if(click == 'kill') flockmodel.handleMouseBoids = flockmodel.killBoids
       
        flockmodel.canvases[label] = cnv  // Add a reference to the canvas to the flockmodel
        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        const canvas = addToDisplay || cnv

        flockmodel.mouseDown = false
        flockmodel.mouseClick = false
        canvas.elem.addEventListener('mousemove', (e) => { 
            let mouse = this.getCursorPosition(canvas,e,1,false) 
            if(mouse.x == this.mousecoords.x && mouse.y == this.mousecoords.y) return this.mousecoords
            this.mousecoords = {x:mouse.x/this.scale, y:mouse.y/this.scale}            
            flockmodel.mousecoords = this.mousecoords
        }) 
        canvas.elem.addEventListener('touchmove', (e) => { 
            let mouse = this.getCursorPosition(canvas,e.touches[0],1,false) 
            if(mouse.x == this.mousecoords.x && mouse.y == this.mousecoords.y) return this.mousecoords
            this.mousecoords = {x:mouse.x/this.scale, y:mouse.y/this.scale}            
            flockmodel.mousecoords = this.mousecoords
            e.preventDefault();
        }) 
        
        canvas.elem.addEventListener('mousedown', (e) => { flockmodel.mouseDown = true})
        canvas.elem.addEventListener('touchstart', (e) => { flockmodel.mouseDown = true})

        canvas.elem.addEventListener('mouseup', (e) => { flockmodel.mouseDown = false })
        canvas.elem.addEventListener('touchend', (e) => { flockmodel.mouseDown = false; flockmodel.mousecoords = {x:-1000,y:-1000}})
        canvas.elem.addEventListener('mouseout', (e) => { flockmodel.mousecoords = {x:-1000,y:-1000}})
        cnv.bgcolour = this.config.bgcolour || 'black'
        cnv.display = cnv.displayflock                
        cnv.display()
    }       

    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {object} config Object with the keys name, property, label, width, height, scale, minval, maxval, nticks, decimals, num_colours, fill
    *                        These keys:value pairs are:
    * @param {string} name The name of the model to display
    * @param {string} property The name of the property to display
    * @param {string} customlab Overwrite the display name with something more descriptive
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    * @param {numeric}  minval colour scale is capped off below this value
    * @param {numeric}  maxval colour scale is capped off above this value
    * @param {integer} nticks how many ticks
    * @param {integer} decimals how many decimals for tick labels
    * @param {integer} num_colours how many steps in the colour gradient
    * @param {string} fill type of gradient to use (viridis, inferno, red, green, blue)

    */
     createDisplay_discrete(config) {  
        if(! this.inbrowser) {
            console.warn("Cacatoo:createDisplay_discrete, cannot create display in command-line mode.")
            return
        }
        let name = config.model
        
        let property = config.property                 
        let legend = true
        if(config.legend == false) legend = false

        let label = config.label
        if (label == undefined) label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name]
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr        
        let width = config.width || this[name].nc
        let scale = config.scale || this[name].scale          
        let legendlabel = config.legendlabel
    
        
        if(name==undefined || property == undefined) throw new Error("Cacatoo: can't make a display with out a 'name' and 'property'")        

        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if (height == undefined) height = gridmodel.nr
        if (width == undefined) width = gridmodel.nc
        if (scale == undefined) scale = gridmodel.scale

        if(gridmodel.statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`)                        
            gridmodel.statecolours[property] = utility.default_colours(10)
        } 
        
        let cnv = new Canvas(gridmodel, property, label, height, width, scale);
        if(config.drawdots) {
            cnv.display = cnv.displaygrid_dots
            cnv.stroke = config.stroke 
            cnv.strokeStyle = config.strokeStyle
            cnv.strokeWidth = config.strokeWidth
            cnv.radius = config.radius || 10
            cnv.max_radius = config.max_radius || 10
            cnv.scale_radius = config.scale_radius || 1
            cnv.min_radius = config.min_radius || 0
        }
        gridmodel.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        const canvas = cnv        
        if(legend) cnv.add_legend(cnv.canvasdiv,property, legendlabel)
        cnv.bgcolour = this.config.bgcolour || 'black'
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(canvas, e, scale) }, false)
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas }, false)
        cnv.displaygrid() 
    }

    /**
    * Create a display for a gridmodel, showing a certain property on it. 
    * @param {object} config Object with the keys name, property, label, width, height, scale, minval, maxval, nticks, decimals, num_colours, fill
    *                        These keys:value pairs are:
    * @param {string} name The name of the model to display
    * @param {string} property The name of the property to display
    * @param {string} customlab Overwrite the display name with something more descriptive
    * @param {integer} height Number of rows to display (default = ALL)
    * @param {integer} width Number of cols to display (default = ALL)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    * @param {numeric}  minval colour scale is capped off below this value
    * @param {numeric}  maxval colour scale is capped off above this value
    * @param {integer} nticks how many ticks
    * @param {integer} decimals how many decimals for tick labels
    * @param {integer} num_colours how many steps in the colour gradient
    * @param {string} fill type of gradient to use (viridis, inferno, red, green, blue)

    */
    createDisplay_continuous(config) {  
        if(! this.inbrowser) {
            console.warn("Cacatoo:createDisplay_continuous, cannot create display in command-line mode.")
            return
        }
        let name = config.model
        
        let property = config.property 
        
        let label = config.label
        let legendlabel = config.legendlabel
        let legend = true
        if(config.legend == false) legend = false

        if (label == undefined) label = `${name} (${property})` // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name]
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr        
        let width = config.width || this[name].nc
        let scale = config.scale || this[name].scale               
        let maxval = config.maxval || this.maxval || undefined   
        let decimals= config.decimals || 0
        let nticks= config.nticks || 5
        let minval = config.minval || 0
        let num_colours = config.num_colours || 100
        
        if(config.fill == "viridis") this[name].colourViridis(property, num_colours)    
        else if(config.fill == "inferno") this[name].colourViridis(property, num_colours, false, "inferno")    
        else if(config.fill == "pride") this[name].colourViridis(property, num_colours, false, "pride")    
        else if(config.fill == "rainbow") this[name].colourViridis(property, num_colours, false, "rainbow")    
        else if(config.fill == "inferno_rev") this[name].colourViridis(property, num_colours, true, "inferno")    
        else if(config.fill == "red") this[name].colourGradient(property, num_colours, [0, 0, 0], [255, 0, 0])
        else if(config.fill == "green") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 255, 0])
        else if(config.fill == "blue") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255])
        else if(this[name].statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`)
            this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255])
        } 
        

        let cnv = new Canvas(gridmodel, property, label, height, width, scale, true);

        if(config.drawdots) {
            cnv.display = cnv.displaygrid_dots
            cnv.stroke = config.stroke 
            cnv.strokeStyle = config.strokeStyle
            cnv.strokeWidth = config.strokeWidth
            cnv.radius = config.radius || 10
            cnv.max_radius = config.max_radius || 10
            cnv.scale_radius = config.scale_radius || 1
            cnv.min_radius = config.min_radius || 0
        }

        gridmodel.canvases[label] = cnv  // Add a reference to the canvas to the gridmodel
        if (maxval !== undefined) cnv.maxval = maxval
        if (minval !== undefined) cnv.minval = minval
        if (num_colours !== undefined) cnv.num_colours = num_colours
        if (decimals !== undefined) cnv.decimals = decimals
        if (nticks !== undefined) cnv.nticks = nticks
        
        if(legend!==false) cnv.add_legend(cnv.canvasdiv,property,legendlabel)
        cnv.bgcolour = this.config.bgcolour || 'black'
        this.canvases.push(cnv)  // Add a reference to the canvas to the sim
        const canvas = cnv        
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(cnv, e, scale) }, false)
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas }, false)
        cnv.displaygrid()
    }

    /**
    * Create a space time display for a gridmodel
    * @param {string} name The name of an existing gridmodel to display
    * @param {string} source_canvas_label The name of the property to display
    * @param {string} label Overwrite the display name with something more descriptive
    * @param {integer} col_to_draw Col to display (default = center)
    * @param {integer} ncol Number of cols (i.e. time points) to display (default = ncol)
    * @param {integer} scale Scale of display (default inherited from @Simulation class)
    */
     spaceTimePlot(name, source_canvas_label, label, col_to_draw, ncolumn) {
        if(! this.inbrowser) {
            console.warn("Cacatoo:spaceTimePlot, cannot create display in command-line mode.")
            return
        }
        
        let source_canvas = this[name].canvases[source_canvas_label]
        let property = source_canvas.property
        let height = source_canvas.height
        let width = ncolumn
        let scale = source_canvas.scale
        

        let cnv = new Canvas(this[name], property, label, height, width, scale);
        
        cnv.spacetime=true
        cnv.offset_x = col_to_draw
        cnv.continuous = source_canvas.continuous
        cnv.minval = source_canvas.minval
        cnv.maxval = source_canvas.maxval
        cnv.num_colours = source_canvas.num_colours
        cnv.ctx.fillRect(0, 0, width*scale , height*scale)

        this[name].canvases[label] = cnv    // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv)             // Add a reference to the canvas to the sim
        const canvas = cnv

        var newCanvas = document.createElement('canvas')
        var context = newCanvas.getContext('2d')
        newCanvas.width = source_canvas.legend.width
        newCanvas.height = source_canvas.legend.height
        context.drawImage(source_canvas.legend, 0, 0)

        cnv.canvasdiv.appendChild(newCanvas)
        cnv.bgcolour = this.config.bgcolour || 'black'
        cnv.elem.addEventListener('mousedown', (e) => { sim.active_canvas = cnv }, false)
    }


    /**
    * Get the position of the cursor on the canvas
    * @param {canvas} canvas A (constant) canvas object
    * @param {event-handler} event Event handler (mousedown)
    * @param {scale} scale The zoom (scale) of the grid to grab the correct grid point
    */
    getCursorPosition(canvas, event, scale, floor=true) {
        const rect = canvas.elem.getBoundingClientRect()
        let x = Math.max(0, event.clientX - rect.left) / scale + canvas.offset_x
        let y = Math.max(0, event.clientY - rect.top) / scale + canvas.offset_y
        if(floor){
            x = Math.floor(x)
            y = Math.floor(y)
        }
        return({x:x,y:y})
    }

    /**
    * Get *and print the GP* at the cursor position
    * @param {canvas} canvas A (constant) canvas object
    * @param {event-handler} event Event handler (mousedown)
    * @param {scale} scale The zoom (scale) of the grid to grab the correct grid point
    */
    printCursorPosition(canvas, event, scale){
        if(!this.printcursor) return
        let coords = this.getCursorPosition(canvas,event,scale)
        let x = coords.x
        let y = coords.y
        if( x< 0 || x >= this.ncol || y < 0 || y >= this.nrow) return
        console.log(`You have clicked the grid at position ${x},${y}, which has:`)
        for (let model of this.gridmodels) {
            console.log("grid point:", model.grid[x][y])
        }
        for (let model of this.flockmodels) {
            console.log("boids:", model.mouseboids)
        }
    }



    /**
    * Update all the grid models one step. Apply optional mixing
    */
    step() {
        for (let i = 0; i < this.gridmodels.length; i++){
            this.gridmodels[i].update()
            this.gridmodels[i].time++
        }

        for (let i = 0; i < this.flockmodels.length; i++){
            let model = this.flockmodels[i]
            model.flock()
            model.update()
            model.time++
            let mouse = model.mousecoords
            if(model.mouse_radius) model.mouseboids = model.getIndividualsInRange(mouse,model.mouse_radius)
            if(model.mouseDown)model.handleMouseBoids()
        }

        for (let i = 0; i < this.canvases.length; i++)
            if(this.canvases[i].recording == true)
                this.captureFrame(this.canvases[i])
        this.time++
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
        for (let i = 0; i < this.canvases.length; i++){
            this.canvases[i].display()
            if(this.canvases[i].recording == true){
                this.captureFrame(this.canvases[i])
            }
        }
    }

    /**
     *  Start the simulation. start() detects whether the user is running the code from the browser or, alternatively,
     *  in nodejs. In the browser, a GUI is provided to interact with the model. In nodejs the 
     *  programmer can simply wait for the result without wasting time on displaying intermediate stuff 
     *  (which can be slow)
     */
    start() {
        let sim = this;    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        let meter = undefined;
        if (this.inbrowser) {
            if(this.fpsmeter){               
                meter = new FPSMeter({ position: 'absolute', show: 'fps', left: "auto", top: "45px", right: "25px", graph: 1, history: 20, smoothing: 100});                
                
            } 

            if (this.config.noheader != true) document.title = `Cacatoo - ${this.config.title}`;            
            
            var link = document.querySelector("link[rel~='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); }
            link.href = '../../images/favicon.png';

            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML = `<a target="blank" href="https://bramvandijk88.github.io/cacatoo/"><img class="logos" src=""https://bramvandijk88.github.io/cacatoo/images/elephant_cacatoo_small.png"></a>`;
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += `<a target="blank" href="https://github.com/bramvandijk88/cacatoo"><img class="logos" style="padding-top:32px;" src=""https://bramvandijk88.github.io/cacatoo/images/gh.png"></a></img>`;
            if (this.config.noheader != true && document.getElementById("header") != null) document.getElementById("header").innerHTML = `<div style="height:40px;"><h2>Cacatoo - ${this.config.title}</h2></div><div style="padding-bottom:20px;"><font size=2>${this.config.description}</font size></div>`;
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += "<h2>Cacatoo is a toolbox to explore spatially structured models straight from your webbrowser. Suggestions or issues can be reported <a href=\"https://github.com/bramvandijk88/cacatoo/issues\">here.</a></h2>";
            let simStartTime = performance.now();

            async function animate() {
                if (sim.sleep > 0) await pause(sim.sleep);
                if(sim.fpsmeter) meter.tickStart();
                            
                if (!sim.pause == true) {
                    sim.step();
                    sim.events();                            
                }                

                if(sim.time%(sim.skip+1)==0) sim.display();
                if(sim.fpsmeter) meter.tick();

                let frame = requestAnimationFrame(animate);
                if (sim.time > sim.config.maxtime || sim.exit) {
                    let simStopTime = performance.now();
                    console.log("Cacatoo completed after", Math.round(simStopTime - simStartTime) / 1000, "seconds");
                    cancelAnimationFrame(frame);
                }

                //if (sim.pause == true) { cancelAnimationFrame(frame); }
            }

            requestAnimationFrame(animate);
        }
        else {
            while (true) {
                sim.step();
                if (sim.time >= sim.config.maxtime || sim.exit ) {
                    console.log("Cacatoo completed.");
                    return true;
                }
            }
        }
    }

    /** 
     * Stop the simulation
     */
    stop() {
        this.exit = true
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
    initialGrid(obj,property,defaultvalue=0) {
        // First, make sure you have access to the appropriate gridmodel
        let gridmodel = undefined 
        if (obj instanceof Gridmodel) // user passed a gridmodel object
            gridmodel = obj 
        else
            gridmodel = obj.gridmodel
        if(typeof gridmodel === 'string' || gridmodel instanceof String) // user passed a string
            gridmodel = this[gridmodel]
        // Next, put the default values in the grid
        let p = property || obj.property || 'val'
        if(obj.default != undefined) defaultvalue = obj.default
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++)                  // y are rows
                gridmodel.grid[x][y][p] = defaultvalue

        let frequencies = obj.frequencies || []

        for (let arg = 3; arg < arguments.length; arg += 2) {
            let value = arguments[arg];
            let fract = arguments[arg + 1];
            frequencies.push([value,fract]);
        }
        
        for (let x = 0; x < gridmodel.nc; x++)                        // x are columns
            for (let y = 0; y < gridmodel.nr; y++){                    // y are rows
                let rand = this.rng.random();
                let fract = 0
                for(let k of frequencies){
                    fract += k[1];
                    if(rand < fract){
                        gridmodel.grid[x][y][p] = k[0];
                        break;
                    }
                }
            }
    }
    
     /**
     *  populateGrid populates a grid with custom individuals. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {Array} individuals The properties for individuals 1..n
     *  @param {Array} freqs The initial frequency of individuals 1..n
     */
      populateGrid(gridmodel,individuals,freqs)
      {
          if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
          if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
          if(freqs.reduce((a, b) => a + b) > 1) throw new Error("populateGrid should not have frequencies that sum up to greater than 1")
          for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
              for (let y = 0; y < gridmodel.nr; y++){                 // y are rows
                  for (const property in individuals[0]) {
                      gridmodel.grid[x][y][property] = 0;    
                  }
                  let random_number = this.rng.random()
                  let sum_freqs = 0
                  for(let n=0; n<individuals.length; n++)
                  {
                      sum_freqs += freqs[n]
                      if(random_number < sum_freqs) {
                          gridmodel.grid[x][y] = {...gridmodel.grid[x][y],...JSON.parse(JSON.stringify(individuals[n]))};
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
    */
    initialSpot(gridmodel, property, value, size, x, y,background_state=false) {
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
        let p = property || 'val'
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++) 
                if(background_state) gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr][p] = background_state
        this.putSpot(gridmodel,property,value,size,x,y)
    }

    /**
    *  putSpot sets values at a certain position with a certain radius. Grid points close to a certain coordinate are set to state value, while
    *  other cells are set to the bg-state of 0. 
    *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
    *  @param {String} property The name of the state to be set 
    *  @param {integer} value The value of the state to be set (optional argument with position 2, 4, 6, ..., n)
    *  @param {float} fraction The chance the grid point is set to this state (optional argument with position 3, 5, 7, ..., n)
    */
   putSpot(gridmodel, property, value, size, putx, puty) {
         if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
        // Draw a circle
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++)                           // y are rows
            {
                if ((Math.pow((x - putx), 2) + Math.pow((y - puty), 2)) < size)
                    gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr][property] = value
            }
    }

    /**
     *  populateSpot populates a spot with custom individuals. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {Array} individuals The properties for individuals 1..n
     *  @param {Array} freqs The initial frequency of individuals 1..n
     */
     populateSpot(gridmodel,individuals, freqs,size, putx, puty, background_state=false)
     {
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
        let sumfreqs =0
        if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
        for(let i=0; i<freqs.length; i++) sumfreqs += freqs[i]
        
        // Draw a circle
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
        for (let y = 0; y < gridmodel.nr; y++)                           // y are rows
        {
            

            if ((Math.pow((x - putx), 2) + Math.pow((y - puty), 2)) < size)
            {
                let cumsumfreq = 0
                let rand = this.rng.random()                
                for(let n=0; n<individuals.length; n++)
                {
                    cumsumfreq += freqs[n]
                    if(rand < cumsumfreq) {
                        Object.assign(gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr],individuals[n])
                        break
                    }
                }
            }
            else if(background_state) Object.assign(gridmodel.grid[x][y], background_state)
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
        button.id = text
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
     *  addCustomSlider adds a HTML slider to the DOM-environment which allows the user
     *  to add a custom callback function to a slider 
     *  @param {function} func The name of the (global!) parameter to link to the slider
     *  @param {float} [min] Minimal value of the slider
     *  @param {float} [max] Maximum value of the slider
     *  @param {float} [step] Step-size when modifying
     */
     addCustomSlider(label,func, min = 0.0, max = 2.0, step = 0.01, default_value=0) {        
        let lab = label || func
        if (!this.inbrowser) return
        if (func === undefined) { console.warn(`addCustomSlider: callback function not defined. No slider made.`); return; }
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
        slider.value = default_value
        //let parent = sim
        slider.oninput = function () {
            let value = parseFloat(slider.value)
            func(value)
            numeric.value = value
        }

        // Setting number variables / handler
        numeric.type = 'number'
        numeric.classList.add("number")
        numeric.min = min
        numeric.max = max
        numeric.step = step
        numeric.value = default_value
        numeric.onchange = function () {
            let value = parseFloat(numeric.value)
            if (value > this.max) value = this.max
            if (value < this.min) value = this.min
            func(value)
            numeric.value = value
            slider.value = value
        }
        container.appendChild(slider)
        container.appendChild(numeric)
        document.getElementById("form_holder").appendChild(container)
    }

    /**
     * save a PNG of an entire HTML div element
     * @param {div} div object to store to
     */
    sectionToPNG(div, prefix){
        function downloadURI(uri, filename) {
            var link = document.createElement("a");
            link.download = filename;
            link.href = uri;
            link.click();
            
            //after creating link you should delete dynamic link
            //clearDynamicLink(link); 
        }
        
        div = document.getElementById(div)
        let time = sim.time+1
        let timestamp = time.toString()
        timestamp = timestamp.padStart(6, "0")

        html2canvas(div).then(canvas => {
            var myImage = canvas.toDataURL();
            downloadURI(myImage, prefix+timestamp+".png");
        });
    }
    /**
     *  recordVideo captures the canvas to an webm-video (browser only)    
     *  @param {canvas} canvas Canvas object to record
     */
    startRecording(canvas,fps){            
        if(!canvas.recording){
            canvas.recording = true        
            
            canvas.elem.style.outline = '4px solid red';       
            sim.capturer = new CCapture( { format: 'webm', 
                                       quality: 100, 
                                       name: `${canvas.label}_starttime_${sim.time}`,
                                       framerate: fps,                                       
                                       display: false } );
            sim.capturer.start()            
            console.log("Started recording video.")
        }
    }
    captureFrame(canvas){
        if(canvas.recording){            
            sim.capturer.capture(canvas.elem)
        }
        
    }
    stopRecording(canvas){
        if(canvas.recording){
            canvas.recording = false            
            canvas.elem.style.outline = '0px';       
            sim.capturer.stop()
            sim.capturer.save();            
            console.log("Video saved")
        }
    }
    makeMovie(canvas, fps=60){
        if(this.sleep > 0) throw new Error("Cacatoo not combine makeMovie with sleep. Instead, set sleep to 0 and set the framerate of the movie: makeMovie(canvas, fps).")     
        if(!sim.recording){ 
            sim.startRecording(canvas,fps)
            sim.recording=true
        }
        else{
            sim.stopRecording(canvas)
            sim.recording=false
        }
    }
        
    /**
     *  addToggle adds a HTML checkbox element to the DOM-environment which allows the user
     *  to flip boolean values
     *  @param {string} parameter The name of the (global!) boolean to link to the checkbox
     */
     addToggle(parameter, label, func) {
        let lab = label || parameter
        if (!this.inbrowser) return
        if (window[parameter] === undefined) { console.warn(`addToggle: parameter ${parameter} not found. No toggle made.`); return; }
        let container = document.createElement("div")
        container.classList.add("form-container")
        let checkbox = document.createElement("input")
        container.innerHTML += "<div style='width:100%;height:20px;font-size:12px;'><b>" + lab + ":</b></div>"

        // Setting variables / handler
        checkbox.type = 'checkbox'
        checkbox.checked = window[parameter]

        checkbox.oninput = function () {
            window[parameter] = checkbox.checked
            if(func) func()
        }
       
        container.appendChild(checkbox)
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
    *  Add a statedrawing posibility to this canvas
    *  @param {Gridmodel} gridmodel The gridmodel to which this canvas belongs
    *  @param {string} property the property that should be shown on the canvas
    *  @param {} value_to_place set @property to this value
    *  @param {int} brushsize radius of the brush
    *  @param {int} brushflow amounts of substeps taken (1 by default)
    */
    addStatebrush(gridmodel, property_to_change, value_to_place, brushsize, brushflow, canvas)
    {
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
        this.mouseDown = false
        this.coords_previous = []
        this.coords = []
        let thissim = this
        
        // var intervalfunc
        this.place_value = value_to_place
        this.place_size = brushsize 
        this.property_to_change = property_to_change
        this.brushflow = brushflow || 1
        
        if(!canvas){
            let canvs = gridmodel.canvases
            canvas = canvs[Object.keys(canvs)[0]]
        }
        else{
            canvas = gridmodel.canvases[canvas]
        }

        // For mouse:
        canvas.elem.addEventListener('mousemove', (e) => { 
            thissim.coords_previous = thissim.coords
            thissim.coords = sim.getCursorPosition(canvas,e,sim.config.scale) 
        })
        
        canvas.elem.addEventListener('mousedown', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))))
                    let dify = thissim.coords.y - thissim.coords_previous.y
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))))
                    for(let q=0; q<steps; q++)
                    {
                        thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, seqx[q], seqy[q])                    
                    }
                }
                else{
                    thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, thissim.coords.x, thissim.coords.y)                    
                }                
                canvas.displaygrid()
            }
            }, 10)
        })
        canvas.elem.addEventListener('mousedown', (e) => { thissim.mouseDown = true })
        canvas.elem.addEventListener('mouseup', (e) => { thissim.mouseDown = false })


        // For touch screens
        canvas.elem.addEventListener('touchmove', (e) => { 
            thissim.coords_previous = thissim.coords
            thissim.coords = sim.getCursorPosition(canvas,e.touches[0],sim.config.scale) 
            e.preventDefault();
        })
        
        canvas.elem.addEventListener('touchstart', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))))
                    let dify = thissim.coords.y - thissim.coords_previous.y
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))))
                    for(let q=0; q<steps; q++)
                    {
                        thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, seqx[q], seqy[q])                    
                    }
                }
                else{
                    thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, thissim.coords.x, thissim.coords.y)                    
                }                
                canvas.displaygrid()
            }
            }, 10)
        })
        canvas.elem.addEventListener('touchstart', (e) => { thissim.mouseDown = true })
        canvas.elem.addEventListener('touchend', (e) => { thissim.mouseDown = false })
    }

    /**
    *  Add an object-drawing posibility to this canvas
    *  @param {Gridmodel} gridmodel The gridmodel to which this canvas belongs
    *  @param {object} obj Replace current gp with this object
    *  @param {int} brushsize radius of the brush
    *  @param {int} brushflow amounts of substeps taken (1 by default)
    *  @param {string} canvas alternative canvas name to draw on (first canvas by default)
    */
    addObjectbrush(gridmodel, obj, brushsize, brushflow, canvas)
    {
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel]
        this.mouseDown = false
        this.coords_previous = []
        this.coords = []
        let thissim = this
        
        // var intervalfunc
           
        this.place_size = brushsize 
        
        this.brushflow = brushflow || 1
        if(!canvas){
            let canvs = gridmodel.canvases
            canvas = canvs[Object.keys(canvs)[0]]
        }
        else{
            canvas = gridmodel.canvases[canvas]
        }
        
        canvas.elem.addEventListener('mousemove', (e) => { 
            thissim.coords_previous = thissim.coords
            thissim.coords = sim.getCursorPosition(canvas,e,sim.config.scale) 
        })
        
        canvas.elem.addEventListener('mousedown', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))))
                    let dify = thissim.coords.y - thissim.coords_previous.y
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))))
                    for(let q=0; q<steps; q++)
                    {
                        thissim.populateSpot(gridmodel, [obj], [1], thissim.place_size, seqx[q], seqy[q])                    
                    }
                }
                else{
                    thissim.populateSpot(gridmodel, [obj], [1], thissim.place_size, thissim.coords.x, thissim.coords.y)                    
                }                
                canvas.displaygrid()
            }
            }, 10)
        })
        canvas.elem.addEventListener('mousedown', (e) => { thissim.mouseDown = true })
        canvas.elem.addEventListener('mouseup', (e) => { thissim.mouseDown = false })
    }

    /**
     *  log a message to either the console, or to a HTML div. 
     *  @param {String} msg String to write to log
     *  @param {String} target If defined, write log to HTML div with this name
     */
     log(msg, target, append = true) {
        if (!this.inbrowser) console.log(msg)
        else if (typeof target == "undefined") console.log(msg)
        else {
            if(append) document.getElementById(target).innerHTML += `${msg}<br>`
            else document.getElementById(target).innerHTML = `${msg}<br>`
        }
    }

    /**
     *  write a string to either a file, or generate a download request in the browser
     *  @param {String} text String to write
     *  @param {String} filename write to this filename
     */
     write(text, filename){
         
        if (!this.inbrowser) {
            let fs
            try { fs = require('fs') }
            catch(e){ console.warn(`[Cacatoo warning] Module 'fs' is not installed. Cannot write to \'${filename}\'. Please run 'npm install fs'`); return }           
            fs.writeFileSync(filename, text)
        }
        else{            
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);          
            element.style.display = 'none';
            document.body.appendChild(element);          
            element.click();          
            document.body.removeChild(element);
        }
    }

    /**
     *  append a string to a file (only supported in nodejs mode)
     *  @param {String} text String to write
     *  @param {String} filename write to this filename
     */
     write_append(text, filename){        
         if(this.inbrowser)
         {
             console.warn("Cacatoo warning: sorry, appending to files is not supported in browser mode.")
         }
         else {
            let fs
            try { fs = require('fs') }
            catch(e){ console.warn(`[Cacatoo warning] Module 'fs' is not installed. Cannot write to \'${filename}\'. Please run 'npm install fs'`); return }
            fs.appendFileSync(filename, text)
         }        
    }
    

    /**
     *  Write a gridmodel to a file (only works outside of the browser, useful for running stuff overnight)
     *  Defaults to -1 if the property is not set
     *  @param {String} msg String to write to log
     *  @param {String} target If defined, write log to HTML div with this name
     */
    write_grid(model,property,filename,warn=true) {
        if(this.inbrowser){
            if(warn) {
                // const fs = require('fs');
                // fs.writeFile(filename, 'Hello World!', function (err) {
                // if (err) return console.log(err);
                //     console.log('Hello World > helloworld.txt');
                // });
                console.log("Sorry, writing grid files currently works in NODEJS mode only.")
            }
            return
        }
        else{
            const fs = require('fs');
            let string = ""
            for(let x =0; x<model.nc;x++){                
                for(let y=0;y<model.nr;y++){
                    let prop = model.grid[x][y][property] ? model.grid[x][y][property] : -1
                    string += [x,y,prop].join('\t')+'\n'
                }                                       
            }
            fs.appendFileSync(filename, string)            
        }
    }
    

    /**
     * addMovieButton adds a standard button to record a video 
     * @param {@Model} model (@Gridmodel of @Flockmodel) containing the canvas to be recorded. 
     * @param {String} property The name of the display (canvas) to be recorded
     * 
    */
    addMovieButton(model,canvasname,fps=60){
        const simu = this
        this.addButton("Record", function() {
            simu.makeMovie(model.canvases[canvasname],fps)        
        })
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
        label.style = "background-color: rgb(239, 218, 245);border-radius: 10px;border: 2px solid rgb(188, 141, 201);padding:7px;font-size:10px;margin:10px;width:128px;"
        label.innerHTML = "Select your own initial state"
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

                    for (let x = 0; x < grid.nc; x++) for (let y = 0; y < grid.nr; y++) grid.grid[x][y].alive = 0
                    for (let x = 0; x < grid_data[0].length; x++)          // x are columns
                        for (let y = 0; y < grid_data.length; y++)             // y are rows
                        {
                            grid.grid[Math.floor(x + grid.nc / 2 - img.width / 2)][Math.floor(y + grid.nr / 2 - img.height / 2)][property] = grid_data[y][x]
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
     *  addCheckpointButton adds a button to the HTML environment which allows the user
     *  to reload the grid to the state as found in a JSON file saved by save_grid. The JSON
     *  file must of course match the simulation (nrows, ncols, properties in gps), but this
     *  is the users own responsibility. 
     *  @param {@GridModel} targetgrid The gridmodel containing the grid to reload the grid. 
     */
    
     addCheckpointButton(target_model) {
        if (!this.inbrowser) return
        let checkpointLoader = document.createElement("input")
        checkpointLoader.type = "file"
        checkpointLoader.id = "checkpointLoader"
        let sim = this
        checkpointLoader.style = "display:none"
        checkpointLoader.name = "checkpointLoader"
        document.getElementById("form_holder").appendChild(checkpointLoader)
        let label = document.createElement("label")
        label.setAttribute("for", "checkpointLoader");
        label.style = "background-color: rgb(239, 218, 245);border-radius: 10px;border: 2px solid rgb(188, 141, 201);padding:7px;font-size:10px;margin:10px;width:128px;"
        label.innerHTML = "Reload from checkpoint"
        document.getElementById("form_holder").appendChild(label)

        checkpointLoader.addEventListener('change', function()
        {
            let file_to_read = document.getElementById("checkpointLoader").files[0];
            let name = document.getElementById("checkpointLoader").files[0].name;
            let fileread = new FileReader();
            console.log(`Reloading simulation from checkpoint-file \'${name}\'`)
            fileread.onload = function(e) {
              let content = e.target.result;
              let grid_json = JSON.parse(content); // parse json
              console.log(grid_json)  
              let model = sim[target_model]

              model.clearGrid()
              model.grid_from_json(grid_json)   
              sim.display()           
            };
            fileread.readAsText(file_to_read)
        });
        
    }

   /**
     *  initialPattern takes a @GridModel and loads a pattern from a PNG file. Note that this
     *  will only work when Cacatoo is ran on a server due to security issues. If you want to
     *  use this feature locally, there are plugins for most browser to host a simple local
     *  webserver. 
     *  (currently only supports black and white image)
     */
   initialPattern(grid, property, image_path, putx, puty) {
    let sim = this;
    if (typeof window != undefined) {
        for (let x = 0; x < grid.nc; x++) for (let y = 0; y < grid.nr; y++) grid.grid[x][y][property] = 0;
        let tempcanv = document.createElement("canvas");
        let tempctx = tempcanv.getContext('2d');
        var tempimg = new Image();
        tempimg.onload = function () {
            tempcanv.width = tempimg.width;
            tempcanv.height = tempimg.height;
            tempctx.drawImage(tempimg, 0, 0);
            let grid_data = get2DFromCanvas(tempcanv);
            if (putx + tempimg.width >= grid.nc || puty + tempimg.height >= grid.nr) throw RangeError("Cannot place pattern outside of the canvas")
            for (let x = 0; x < grid_data[0].length; x++)         // x are columns
                for (let y = 0; y < grid_data.length; y++)     // y are rows
                {
                    grid.grid[putx + x][puty + y][property] = grid_data[y][x];
                }
            sim.display();
        };

        tempimg.src = image_path;
        tempimg.crossOrigin = "anonymous";

    }
    else {
        console.error("initialPattern currently only supported in browser-mode");
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