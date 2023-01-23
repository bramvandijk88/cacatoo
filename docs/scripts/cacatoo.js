'use strict';

/**
*  Gridpoint is what Gridmodels are made of. Contains everything that may happen in 1 locality. 
*/

class Gridpoint {
  /**
  *  The constructor function for a @Gridpoint object. Takes an optional template to copy primitives from. (NOTE!! Other types of objects are NOT deep copied by default)
  *  If you need synchronous updating with complex objects (for whatever reason), replate line 18 with line 19. This will slow things down quite a bit, so ony use this
  *  if you really need it. A better option is to use asynchronous updating so you won't have to worry about this at all :)
  *  @param {Gridpoint} template Optional template to make a new @Gridpoint from
  */
  constructor(template) {
    for (var prop in template)
      this[prop] = template[prop];                  // Shallow copy. It's fast, but be careful with syncronous updating!
    // this[prop] = copy(template[prop])         // Deep copy. Takes much more time, and you'll likely end up copying much more than necessary. Use only if you're sure you need it!
  }
}

/**
 *  Graph is a wrapper-class for a Dygraph element (see https://dygraphs.com/). It is attached to the DOM-windows, and stores all values to be plotted, colours, title, axis names, etc. 
 */

class Graph {
    /**
  *  The constructor function for a @Canvas object. 
  *  @param {Array} labels array of strings containing the labels for datapoints (e.g. for the legend)
  *  @param {Array} values Array of floats to plot (here plotted over time)
  * @param {Array} colours Array of colours to use for plotting
  * @param {String} title Title of the plot
  * @param {Object} opts dictionary-style list of opts to pass onto dygraphs
  */
    constructor(labels, values, colours, title, opts) {

        if (typeof window == undefined) throw "Using dygraphs with cashJS only works in browser-mode"
        this.labels = labels;
        this.data = [values];
        this.title = title;
        this.num_dps = values.length; // number of data points for this graphs        
        this.elem = document.createElement("div");
        this.elem.className = "graph-holder";      
        this.colours = [];
        for (let v of colours) {
            if (v == "Time") continue            
            else if (v == undefined) this.colours.push("#000000");
            else this.colours.push(rgbToHex$1(v[0], v[1], v[2]));
        }

        document.body.appendChild(this.elem);
        document.getElementById("graph_holder").appendChild(this.elem);

        this.g = new Dygraph(this.elem, this.data,
            {
                title: this.title,
                showRoller: false,                
                width: opts ? (opts.width != undefined ? opts.width : 500) : 500,
                height: opts ? (opts.height != undefined ? opts.height : 200) : 200,
                xlabel: this.labels[0],
                ylabel: this.labels.length == 2 ? this.labels[1] : "",
                drawPoints: opts ? (opts.drawPoints ? opts.drawPoints : false) : false,
                pointSize: opts ? (opts.pointSize ? opts.pointSize : 0) : 0,
                logscale: opts ? (opts.logscale ? opts.logscale : false) : false,
                strokePattern: opts ? (opts.strokePattern != undefined ? opts.strokePattern : null) : null,
                dateWindow: [0, 100],
                axisLabelFontSize: 10,               
                valueRange: [opts ? (opts.min_y != undefined ? opts.min_y: 0):0, opts ? (opts.max_y != undefined ? opts.max_y: null):null],
                strokeWidth: opts ? (opts.strokeWidth != undefined ? opts.strokeWidth : 3) : 3,
                colors: this.colours,
                labels: labels.length == values.length ? this.labels: null,
                series: opts ? ( opts.series != undefined ? opts.series : null) : null                
            });
    }


    /** Push data to your graph-element
    * @param {array} array of floats to be added to the dygraph object (stored in 'data')
    */
    push_data(data_array) {
        this.data.push(data_array);
    }

    reset_plot() {
        let first_dp = this.data[0];
        this.data = [];
        let empty = Array(first_dp.length).fill(undefined);
        this.data.push(empty);
        this.g.updateOptions(
            {
                'file': this.data
            });
    }

    /** 
     * Update the graph axes   
    */
    update() {
        let max_x = 0;
        let min_x = 999999999999;
        for (let i of this.data) {
            if (i[0] > max_x) max_x = i[0];
            if (i[0] < min_x) min_x = i[0];
        }
        this.g.updateOptions(
        {
            'file': this.data,
            dateWindow: [min_x, max_x]
        });

    }
}

/* 
Functions below are to make sure dygraphs understands the colours used by Cacatoo (converts to hex)
*/
function componentToHex$1(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex$1(r, g, b) {
    return "#" + componentToHex$1(r) + componentToHex$1(g) + componentToHex$1(b);
}

/**
*  The ODE class is used to call the odex.js library and numerically solve ODEs
*/

class ODE {
    /**
    *  The constructor function for a @ODE object. 
    *  @param {function} eq Function that describes the ODE (see examples starting with ode)
    *  @param {Array} state_vector Initial state vector
    *  @param {Array} pars Array of parameters for the ODEs 
    *  @param {Array} diff_rates Array of rates at which each state diffuses to neighbouring grid point (Has to be less than 0.25!)
    *  @param {String} ode_name Name of this ODE
    */
    constructor(eq, state_vector, pars, diff_rates, ode_name, acceptable_error) {
        this.name = ode_name;
        this.eq = eq;
        this.state = state_vector;
        this.diff_rates = diff_rates;
        this.pars = pars;
        this.solver = new Solver(state_vector.length);
        if (acceptable_error !== undefined) this.solver.absoluteTolerance = this.solver.relativeTolerance = acceptable_error;
    }

    /** 
     *  Numerically solve the ODE
     *  @param {float} delta_t Step size
     *  @param {bool} opt_pos When enabled, negative values are set to 0 automatically
    */
     solveTimestep(delta_t = 0.1, pos = false) {
        let newstate = this.solver.solve(
            this.eq(...this.pars),      // function to solve and its pars (... unlists the array as a list of args)
            0,                          // Initial x value
            this.state,                  // Initial y value(s)
            delta_t                           // Final x value            
        ).y;
        if (pos) for (var i = 0; i < newstate.length; i++) if (newstate[i] < 0.000001) newstate[i] = 0.0;
        this.state = newstate;
    }
    /**
    * Prints the current state to the console
    */
    print_state() {
        console.log(this.state);
    }
}

/** 
 *  Reverse dictionary 
 *  @param {Object} obj dictionary-style object to reverse in order 
*/
function dict_reverse(obj) {
    let new_obj = {};
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function (i) {
        new_obj[i] = obj[i];
    });
    return new_obj;
}

/** 
 *  Randomly shuffle an array with custom RNG
 *  @param {Array} array array to be shuffled
 *  @param {MersenneTwister} rng MersenneTwister RNG
*/
function shuffle(array, rng) {
    let i = array.length;
    while (i--) {
        const ri = Math.floor(rng.random() * (i + 1));
        [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
}

/** 
 *  Convert colour string to RGB. Works for colour names ('red','blue' or other colours defined in cacatoo), but also for hexadecimal strings
 *  @param {String} string string to convert to RGB
*/
function stringToRGB(string) {
    if (string[0] != '#') return nameToRGB(string)
    else return hexToRGB(string)
}

/** 
 *  Convert hexadecimal to RGB
 *  @param {String} hex string to convert to RGB
*/
function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

/** 
 *  Convert colour name to RGB
 *  @param {String} name string to look up in the set of known colours (see below)
*/
function nameToRGB(string) {
    let colours = {
        'black': [0, 0, 0],
        'white': [255, 255, 255],
        'red': [255, 0, 0],
        'blue': [0, 0, 255],
        'green': [0, 255, 0],
        'darkgrey': [40, 40, 40],
        'lightgrey': [180, 180, 180],
        'violet': [148, 0, 211],
        'turquoise': [64, 224, 208],
        'orange': [255, 165, 0],
        'gold': [240, 200, 0],
        'grey': [125, 125, 125],
        'yellow': [255, 255, 0],
        'cyan': [0, 255, 255],
        'aqua': [0, 255, 255],
        'silver': [192, 192, 192],
        'nearwhite': [192, 192, 192],
        'purple': [128, 0, 128],
        'darkgreen': [0, 128, 0],
        'olive': [128, 128, 0],
        'teal': [0, 128, 128],
        'navy': [0, 0, 128]

    };
    let c = colours[string];
    if (c == undefined) throw new Error(`Cacatoo has no colour with name '${string}'`)
    return c
}

/** 
 *  Make sure all colours, even when of different types, are stored in the same format (RGB, as cacatoo uses internally)
 *  @param {Array} cols array of strings, or [R,G,B]-arrays. Only strings are converted, other returned. 
*/

function parseColours(cols) {
    let return_cols = [];
    for (let c of cols) {
        if (typeof c === 'string' || c instanceof String) {
            return_cols.push(stringToRGB(c));
        }
        else {
            return_cols.push(c);
        }
    }
    return return_cols
}

/** 
 *  Compile a dict of default colours if nothing is given by the user. Reuses colours if more colours are needed. 
*/
function default_colours(num_colours)
{
    let colour_dict = [
        [0, 0, 0],            // black
        [255, 255, 255],      // white
        [255, 0, 0],          // red
        [0, 0, 255],          // blue
        [0, 255, 0],          //green      
        [60, 60, 60],         //darkgrey    
        [180, 180, 180],      //lightgrey   
        [148, 0, 211],      //violet      
        [64, 224, 208],     //turquoise   
        [255, 165, 0],      //orange       
        [240, 200, 0],       //gold       
        [125, 125, 125],
        [255, 255, 0], // yellow
        [0, 255, 255], // cyan
        [192, 192, 192], // silver
        [0, 128, 0], //darkgreen
        [128, 128, 0], // olive
        [0, 128, 128], // teal
        [0, 0, 128]]; // navy

    let return_dict = {};
    for(let i = 0; i < num_colours; i++)
    {
        return_dict[i] = colour_dict[i%19];
    }
    return return_dict
}


/** 
 *  A list of default colours if nothing is given by the user. 
*/
function random_colours(num_colours,rng)
{
    let return_dict = {};
    return_dict[0] = [0,0,0];
    for(let i = 1; i < num_colours; i++)
    {
        return_dict[i] = [rng.genrand_int(0,255),rng.genrand_int(0,255),rng.genrand_int(0,255)];
    }
    return return_dict
}

/**
 *  Gridmodel is the main (currently only) type of model in Cacatoo. Most of these models
 *  will look and feel like CAs, but GridModels can also contain ODEs with diffusion, making
 *  them more like PDEs. 
 */

class Gridmodel {
    /**
    *  The constructor function for a @Gridmodel object. Takes the same config dictionary as used in @Simulation
    *  @param {string} name The name of your model. This is how it will be listed in @Simulation 's properties
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo GridModel. 
    *  @param {MersenneTwister} rng A random number generator (MersenneTwister object)
    */
    constructor(name, config, rng) {
        this.name = name;
        this.time = 0;
        this.nc = config.ncol || 200;
        this.nr = config.nrow || 200;
        this.grid = MakeGrid(this.nc, this.nr);       // Initialises an (empty) grid
        this.wrap = config.wrap || [true, true];
        this.rng = rng;
        this.random = () => { return this.rng.random()};
        this.randomInt = (a,b) => { return this.rng.randomInt(a,b)};                
        this.statecolours = this.setupColours(config.statecolours,config.num_colours); // Makes sure the statecolours in the config dict are parsed (see below)
        this.lims = {};
        this.scale = config.scale || 1;
        this.graph_update = config.graph_update || 20;
        this.graph_interval = config.graph_interval || 2;
        this.bgcolour = config.bgcolour || 'black';

        this.margolus_phase = 0;
        // Store a simple array to get neighbours from the N, E, S, W, NW, NE, SW, SE (analogous to Cash2.1)
        this.moore = [[0, 0],    // SELF   _____________
        [0, -1],        // NORTH           | 5 | 1 | 6 |
        [-1, 0],        // WEST            | 2 | 0 | 3 |
        [1, 0],         // EAST            | 7 | 4 | 8 |
        [0, 1],         // SOUTH           _____________
        [-1, -1],       // NW              
        [1, -1],        // NE
        [-1, 1],        // SW
        [1, 1]          // SE
        ];

        this.graphs = {};                // Object containing all graphs belonging to this model (HTML usage only)
        this.canvases = {};              // Object containing all Canvases belonging to this model (HTML usage only)
    }

    /** Replaces current grid with an empty grid */
    clearGrid()
    {
        this.grid = MakeGrid(this.nc,this.nr);        
    }

    /**
    *  Saves the current grid in a JSON object. In browser mode, it will throw download-request, which may or may not
    *  work depending on the security of the user's browser.
    *  @param {string} filename The name of of the JSON file
    */
    save_grid(filename) 
    {      
        console.log(`Saving grid in JSON file \'${filename}\'`);
        let gridjson = JSON.stringify(this.grid);        
        if((typeof document !== "undefined")){
            const a = document.createElement('a');
            a.href = URL.createObjectURL( new Blob([gridjson], { type:'text/plain' }) );
            a.download = filename;
            a.click();
            console.warn("Cacatoo: download of grid in browser-mode may be blocked for security reasons.");            
            return
        }                        
        else {
            try { var fs = require('fs'); }
            catch (e) {
                console.log('Cacatoo:save_grid: save_grid requires file-system module. Please install fs via \'npm install fs\'');
            }
            fs.writeFileSync(filename, gridjson, function(err) {
            if (err) {
                console.log(err);
            }
            });
        }
        
        
    }

    /**
    *  Reads a JSON file and loads a JSON object onto this gridmodel. Reading a local JSON file will not work in browser mode because of security reasons,
    *  You can instead use 'addCheckpointButton' instead, which allows you to select a file from the browser manually. 
    *  @param {string} file Path to the json file
    */
    load_grid(file)
    {
        if((typeof document !== "undefined")){
            console.warn("Cacatoo: loading grids directly is not supported in browser-mode for security reasons. Use 'addCheckpointButton' instead. ");            
            return
        }
        this.clearGrid();
        console.log(`Loading grid for ${this.name} from file \'${file}\'`);            

        try { var fs = require('fs'); }
        catch (e) {
            console.log('Cacatoo:load_grid: requires file-system module. Please install fs via \'npm install fs\'');
        }
        let filehandler = fs.readFileSync(file);        
        let gridjson = JSON.parse(filehandler);
        this.grid_from_json(gridjson);
        
    }

    /**
    *  Loads a JSON object onto this gridmodel. 
    *  @param {string} gridjson JSON object to build new grid from
    */
    grid_from_json(gridjson)
    {
        for(let i in gridjson)
            for(let j in gridjson[i])
            {
                let newgp = new Gridpoint(gridjson[i][j]);
                gridjson[i][j] = newgp;
            }
        this.grid = gridjson;
    }
    
    /** Print the entire grid to the console */
    print_grid() {
        console.table(this.grid);
    }
        

    /** Initiate a dictionary with colour arrays [R,G,B] used by Graph and Canvas classes
    *   @param {statecols} object - given object can be in two forms
    *                             | either {state:colour} tuple (e.g. 'alive':'white', see gol.html) 
    *                             | or {state:object} where objects are {val:'colour},
    *                             | e.g.  {'species':{0:"black", 1:"#DDDDDD", 2:"red"}}, see cheater.html 
    */
    setupColours(statecols,num_colours=18) {
        let return_dict = {};
        if (statecols == null)           // If the user did not define statecols (yet)
            return return_dict["state"] = default_colours(num_colours)
        let colours = dict_reverse(statecols) || { 'val': 1 };

        for (const [statekey, statedict] of Object.entries(colours)) {
            if (statedict == 'default') {
                return_dict[statekey] = default_colours(num_colours+1);
            }
            else if (statedict == 'random') {
                return_dict[statekey] = random_colours(num_colours+1,this.rng);
            }
            else if (statedict == 'viridis') {
                 let colours = this.colourGradientArray(num_colours, 0,[68, 1, 84], [59, 82, 139], [33, 144, 140], [93, 201, 99], [253, 231, 37]); 
                 return_dict[statekey] = colours;
            }
            else if (statedict == 'inferno') {
                let colours = this.colourGradientArray(num_colours, 0,[20, 11, 52], [132, 32, 107], [229, 92, 45], [246, 215, 70]); 
                return_dict[statekey] = colours;                
            }
            else if (statedict == 'inferno_rev') {
                console.log("i");
                let colours = this.colourGradientArray(num_colours, 0, [246, 215, 70], [229, 92, 45], [132, 32, 107]);
                return_dict[statekey] = colours;                
            }
            else if (typeof statedict === 'string' || statedict instanceof String)       // For if 
            {
                return_dict[statekey] = stringToRGB(statedict);
            }
            else {
                let c = {};
                for (const [key, val] of Object.entries(statedict)) {
                    if (Array.isArray(val)) c[key] = val;
                    else c[key] = stringToRGB(val);
                }
                return_dict[statekey] = c;
            }
        }
        return return_dict
    }


    /** Initiate a gradient of colours for a property (return array only) 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * For example usage, see colourViridis below
    */
    colourGradientArray(n,total) 
    {        
        let color_dict = {};
        //color_dict[0] = [0, 0, 0]

        let n_arrays = arguments.length - 2;
        if (n_arrays <= 1) throw new Error("colourGradient needs at least 2 arrays")
        let segment_len = Math.ceil(n / (n_arrays-1));

        if(n <= 10 && n_arrays > 3) console.warn("Cacatoo warning: forming a complex gradient with only few colours... hoping for the best.");
        let total_added_colours = 0;

        for (let arr = 0; arr < n_arrays - 1 ; arr++) {
            let arr1 = arguments[2 + arr];
            let arr2 = arguments[2 + arr + 1];

            for (let i = 0; i < segment_len; i++) {
                let r, g, b;
                if (arr2[0] > arr1[0]) r = Math.floor(arr1[0] + (arr2[0] - arr1[0])*( i / (segment_len-1) ));
                else r = Math.floor(arr1[0] - (arr1[0] - arr2[0]) * (i / (segment_len-1)));
                if (arr2[1] > arr1[1]) g = Math.floor(arr1[1] + (arr2[1] - arr1[1]) * (i / (segment_len - 1)));
                else g = Math.floor(arr1[1] - (arr1[1] - arr2[1]) * (i / (segment_len - 1)));
                if (arr2[2] > arr1[2]) b = Math.floor(arr1[2] + (arr2[2] - arr1[2]) * (i / (segment_len - 1)));
                else b = Math.floor(arr1[2] - (arr1[2] - arr2[2]) * (i / (segment_len - 1)));
                color_dict[Math.floor(i + arr * segment_len + total)+1] = [Math.min(r,255), Math.min(g,255), Math.min(b,255)];
                total_added_colours++;
                if(total_added_colours == n) break
            }
        }        
        return(color_dict)
    }

    /** Initiate a gradient of colours for a property. 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * For example usage, see colourViridis below
    */
    colourGradient(property, n) {        
        let offset = 2;        
        let n_arrays = arguments.length - offset;
        
        if (n_arrays <= 1) throw new Error("colourGradient needs at least 2 arrays")
        
        let color_dict = {};
        let total = 0;

        if(this.statecolours !== undefined && this.statecolours[property] !== undefined){
            color_dict = this.statecolours[property];
            total = Object.keys(this.statecolours[property]).length;
        } 
        
        let all_arrays = [];
        for (let arr = 0; arr < n_arrays ; arr++) all_arrays.push(arguments[offset + arr]);

        let new_dict = this.colourGradientArray(n,total,...all_arrays);

        this.statecolours[property] = {...color_dict,...new_dict};
    }

    /** Initiate a gradient of colours for a property, using the Viridis colour scheme (purpleblue-ish to green to yellow) or Inferno (black to orange to yellow)
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * @param {bool} rev Reverse the viridis colour gradient
    */
    colourViridis(property, n, rev = false, option="viridis") {

        if(option=="viridis"){
            if (!rev) this.colourGradient(property, n, [68, 1, 84], [59, 82, 139], [33, 144, 140], [93, 201, 99], [253, 231, 37]);         // Viridis
            else this.colourGradient(property, n, [253, 231, 37], [93, 201, 99], [33, 144, 140], [59, 82, 139], [68, 1, 84]);             // Viridis
        }
        else if(option=="inferno"){
            if (!rev) this.colourGradient(property, n, [20, 11, 52], [132, 32, 107], [229, 92, 45], [246, 215, 70]);         // Inferno
            else this.colourGradient(property, n, [246, 215, 70], [229, 92, 45], [132, 32, 107], [20, 11, 52]);              // Inferno
        }
    }    

    /** The most important function in GridModel: how to determine the next state of a gridpoint?
     * By default, nextState is empty. It should be defined by the user (see examples)
    * @param {int} i Position of grid point to update (column)
    * @param {int} j Position of grid point to update (row)
    */
    nextState(i, j) {
        throw 'Nextstate function of \'' + this.name + '\' undefined';
    }

    /** Synchronously apply the nextState function (defined by user) to the entire grid
     *  Synchronous means that all grid points will be updated simultaneously. This is ensured
     *  by making a back-up grid, which will serve as a reference to know the state in the previous
     *  time step. First all grid points are updated based on the back-up. Only then will the 
     *  actual grid be changed. 
    */
    synchronous()                                               // Do one step (synchronous) of this grid
    {
        let oldstate = MakeGrid(this.nc, this.nr, this.grid);     // Old state based on current grid
        let newstate = MakeGrid(this.nc, this.nr);               // New state == empty grid

        for (let i = 0; i < this.nc; i++) {
            for (let j = 0; j < this.nr; j++) {
                this.nextState(i, j);                             // Update this.grid
                newstate[i][j] = this.grid[i][j];                // Set this.grid to newstate
                this.grid[i][j] = oldstate[i][j];                // Reset this.grid to old state
            }
        }
        this.grid = newstate;
        this.time++;
    }

    /** Like the synchronous function above, but can not take a custom user-defined function rather
     *  than the default next-state function. Technically one should be able to refarctor this by making
     *  the default function of synchronous "nextstate". But this works. :)
    */
    apply_sync(func) {
        let oldstate = MakeGrid(this.nc, this.nr, this.grid);   // Old state based on current grid
        let newstate = MakeGrid(this.nc, this.nr);              // New state == empty grid
        for (let i = 0; i < this.nc; i++) {
            for (let j = 0; j < this.nr; j++) {
                func(i, j);                                      // Update this.grid
                newstate[i][j] = this.grid[i][j];                // Set this.grid to newstate
                this.grid[i][j] = oldstate[i][j];                // Reset this.grid to old state
            }
        }
        this.grid = newstate;
    }

    /** Asynchronously apply the nextState function (defined by user) to the entire grid
     *  Asynchronous means that all grid points will be updated in a random order. For this
     *  first the update_order will be determined (this.set_update_order). Afterwards, the nextState
     *  will be applied in that order. This means that some cells may update while all their neighours 
     *  are still un-updated, and other cells will update while all their neighbours are already done. 
    */
    asynchronous() {
        this.set_update_order();
        for (let n = 0; n < this.nc * this.nr; n++) {
            let m = this.upd_order[n];
            let i = m % this.nc;
            let j = Math.floor(m / this.nc);
            this.nextState(i, j);
        }
        this.time++;
        // Don't have to copy the grid here. Just cycle through i,j in random order and apply nextState :)
    }

    /** Analogous to apply_sync(func), but asynchronous */
    apply_async(func) {
        this.set_update_order();
        for (let n = 0; n < this.nc * this.nr; n++) {
            let m = this.upd_order[n];
            let i = m % this.nc;
            let j = Math.floor(m / this.nc);
            func(i, j);
        }
    }

    /** If called for the first time, make an update order (list of ints), otherwise just shuffle it. */
    set_update_order() {
        if (typeof this.upd_order === 'undefined')  // "Static" variable, only create this array once and reuse it
        {
            this.upd_order = [];
            for (let n = 0; n < this.nc * this.nr; n++) {
                this.upd_order.push(n);
            }
        }
        shuffle(this.upd_order, this.rng);            // Shuffle the update order
    }

    /** The update is, like nextState, user-defined (hence, empty by default).
     *  It should contains all functions that one wants to apply every time step
     *  (e.g. grid manipulations and printing statistics) 
     *  For example, and update function could look like:
     *  this.synchronous()         // Update all cells  
     *  this.MargolusDiffusion()   // Apply Toffoli Margolus diffusion algorithm
     *  this.plotPopsizes('species',[1,2,3]) // Plot the population sizes
        */
    update() {
        throw 'Update function of \'' + this.name + '\' undefined';
    }

    /** Get the gridpoint at coordinates i,j 
     *  Makes sure wrapping is applied if necessary
     *  @param {int} i position (column) for the focal gridpoint
     *  @param {int} j position (row) for the focal gridpoint
     */
     getGridpoint(i, j) {
        let x = i;
        if (this.wrap[0]) x = (i + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if (this.wrap[1]) y = (j + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) return undefined                      // If sampling neighbour outside of the grid, return empty object
        else return this.grid[x][y]
    }

    /** Change the gridpoint at position i,j into gp (typically retrieved with 'getGridpoint')
         *  Makes sure wrapping is applied if necessary
         *  @param {int} i position (column) for the focal gridpoint
         *  @param {int} j position (row) for the focal gridpoint
         *  @param {Gridpoint} @Gridpoint object to set the gp to (result of 'getGridpoint')
    */
    setGridpoint(i, j, gp) {
        let x = i;
        if (this.wrap[0]) x = (i + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if (this.wrap[1]) y = (j + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) this.grid[x][y] = undefined;    
        else this.grid[x][y] = gp;
    }

    /** Return a copy of the gridpoint at position i,j
         *  Makes sure wrapping is applied if necessary
         *  @param {int} i position (column) for the focal gridpoint
         *  @param {int} j position (row) for the focal gridpoint
    */
     copyGridpoint(i, j) {
        let x = i;
        if (this.wrap[0]) x = (i + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if (this.wrap[1]) y = (j + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) return undefined    
        else {
            return new Gridpoint(this.grid[x][y])
        }
    }

    /** Change the gridpoint at position i,j into gp
         *  Makes sure wrapping is applied if necessary
         *  @param {int} i position (column) for the focal gridpoint
         *  @param {int} j position (row) for the focal gridpoint
         *  @param {Gridpoint} @Gridpoint object to set the gp to
    */
     copyIntoGridpoint(i, j, gp) {
        let x = i;
        if (this.wrap[0]) x = (i + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if (this.wrap[1]) y = (j + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) this.grid[x][y] = undefined;    
        else {
            for (var prop in gp)
                this.grid[x][y][prop] = gp[prop];
        }
    }

    /** Get the x,y coordinates of a neighbour in an array. 
     *  Makes sure wrapping is applied if necessary
     */
    getNeighXY(i, j) {
        let x = i;
        if (this.wrap[0]) x = (i + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if (this.wrap[1]) y = (j + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) return undefined                      // If sampling neighbour outside of the grid, return empty object
        else return [x, y]
    }

    /** Get a neighbour at compass direction 
    *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
    *  but can be mixed to make grids interact.
    *  @param {int} col position (column) for the focal gridpoint
    *  @param {int} row position (row) for the focal gridpoint
    *  @param {int} direction the neighbour to return        
    */
    getNeighbour(model,col,row,direction) {        
            let i = model.moore[direction][0];
            let j = model.moore[direction][1];
            return model.getGridpoint(col + i, row + j)
    }

    /** Get array of grid points with val in property (Neu4, Neu5, Moore8, Moore9 depending on range-array)
    *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
    *  but can be mixed to make grids interact.
    *  @param {int} col position (column) for the focal gridpoint
    *  @param {int} row position (row) for the focal gridpoint
    *  @param {string} property the property that is counted
    *  @param {int} val value 'property' should have
    *  @param {Array} range which section of the neighbourhood must be counted? (see this.moore, e.g. 1-8 is Moore8, 0-4 is Neu5,etc)
    *  @return {int} The number of grid points with "property" set to "val"
    *  Below, 4 version of this functions are overloaded (Moore8, Moore9, Neumann4, etc.)
    *  If one wants to count all the "cheater" surrounding a gridpoint in cheater.js in the Moore8 neighbourhood
    *  one needs to look for value '3' in the property 'species':
    *  this.getNeighbours(this,10,10,3,'species',[1-8]);  
    *  or 
    *  this.getMoore8(this,10,10,3,'species')
    */
    getNeighbours(model,col,row,property,val,range) {
        let gps = [];
        for (let n = range[0]; n <= range[1]; n++) {                        
            let i = model.moore[n][0];
            let j = model.moore[n][1];
            let neigh = model.getGridpoint(col + i, row + j);
            if (neigh != undefined && neigh[property] == val)
                    gps.push(neigh);
        }
        return gps;
    }

    /** getNeighbours for the Moore8 neighbourhood (range 1-8 in function getNeighbours) */     
    getMoore8(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[1,8]) }
    getNeighbours8(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[1,8]) }
    /** getNeighbours for the Moore8 neighbourhood (range 1-8 in function getNeighbours) */     
    getMoore9(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[0,8]) }
    getNeighbours9(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[0,8]) }
    /** getNeighbours for the Moore8 neighbourhood (range 1-8 in function getNeighbours) */     
    getNeumann4(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[1,4]) }
    getNeighbours4(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[1,4]) }
    /** getNeighbours for the Moore8 neighbourhood (range 1-8 in function getNeighbours) */     
    getNeumann5(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[0,4]) }
    getNeighbours5(model, col, row, property,val) { return this.getNeighbours(model,col,row,property,val,[0,4]) }


    /** From a list of grid points, e.g. from getNeighbours(), sample one weighted by a property. This is analogous
     *  to spinning a "roulette wheel". Also see a hard-coded versino of this in the "cheater" example
     *  @param {Array} gps Array of gps to sample from (e.g. living individuals in neighbourhood)
     *  @param {string} property The property used to weigh gps (e.g. fitness)
     *  @param {float} non Scales the probability of not returning any gp. 
     */
    rouletteWheel(gps, property, non = 0.0) {
        let sum_property = non;
        for (let i = 0; i < gps.length; i++) sum_property += gps[i][property];       // Now we have the sum of weight + a constant (non)
        let randomnr = this.rng.genrand_real1() * sum_property;                // Sample a randomnr between 0 and sum_property        
        let cumsum = 0.0;                                                    // This will keep track of the cumulative sum of weights
        for (let i = 0; i < gps.length; i++) {
            cumsum += gps[i][property];
            if (randomnr < cumsum) return gps[i]
        }
        return
    }

    /** Sum the properties of grid points in the neighbourhood (Neu4, Neu5, Moore8, Moore9 depending on range-array)
    *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
    *  but can be mixed to make grids interact.
    *  @param {int} col position (column) for the focal gridpoint
    *  @param {int} row position (row) for the focal gridpoint
    *  @param {string} property the property that is counted
    *  @param {Array} range which section of the neighbourhood must be counted? (see this.moore, e.g. 1-8 is Moore8, 0-4 is Neu5,etc)
    *  @return {int} The number of grid points with "property" set to "val"
    *  Below, 4 version of this functions are overloaded (Moore8, Moore9, Neumann4, etc.)
    *  For example, if one wants to sum all the "fitness" surrounding a gridpoint in the Neumann neighbourhood, use
    *  this.sumNeighbours(this,10,10,'fitness',[1-4]);  
    *  or
    *  this.sumNeumann4(this,10,10,'fitness')
    */
     sumNeighbours(model, col, row, property, range) {
        let count = 0;
        for (let n = range[0]; n <= range[1]; n++) {
            let i = model.moore[n][0];
            let j = model.moore[n][1];
            let gp = model.getGridpoint(col + i, row + j);
            if(gp !== undefined && gp[property] !== undefined) count += gp[property];
        }
        return count;
    }

    /** sumNeighbours for range 1-8 (see sumNeighbours) */     
    sumMoore8(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [1,8]) }
    sumNeighbours8(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [1,8]) }
    /** sumNeighbours for range 0-8 (see sumNeighbours) */ 
    sumMoore9(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [0,8]) }
    sumNeighbours9(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [0,8]) }
    /** sumNeighbours for range 1-4 (see sumNeighbours) */ 
    sumNeumann4(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [1,4]) }
    sumNeighbours4(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [1,4]) }
    /** sumNeighbours for range 0-4 (see sumNeighbours) */ 
    sumNeumann5(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [0,4]) }
    sumNeighbours5(grid, col, row, property) { return this.sumNeighbours(grid, col, row, property, [0,4]) }


    /** Count the number of neighbours with 'val' in 'property' (Neu4, Neu5, Moore8, Moore9 depending on range-array)
    *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
    *  but can be mixed to make grids interact.
    *  @param {int} col position (column) for the focal gridpoint
    *  @param {int} row position (row) for the focal gridpoint
    *  @param {string} property the property that is counted
    *  @param {int} val value property must have to be counted
    *  @param {Array} range which section of the neighbourhood must be counted? (see this.moore, e.g. 1-8 is Moore8, 0-4 is Neu5,etc)
    *  @return {int} The number of grid points with "property" set to "val"
    *  Below, 4 version of this functions are overloaded (Moore8, Moore9, Neumann4, etc.)
    *  For example, if one wants to count all the "alive" individuals in the Moore 9 neighbourhood, use
    *  this.countNeighbours(this,10,10,1,'alive',[0-8]);  
    *  or
    *  this.countMoore9(this,10,10,1,'alive');  
    */
    countNeighbours(model, col, row, property, val, range) {
        let count = 0;
        for (let n = range[0]; n <= range[1]; n++) {            
            let i = model.moore[n][0];
            let j = model.moore[n][1];
            let neigh = model.getGridpoint(col + i, row + j);
            if (neigh !== undefined && neigh[property]==val) count++;
        }
        return count;
    }

    /** countNeighbours for range 1-8 (see countNeighbours) */     
    countMoore8(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [1,8]) }
    countNeighbours8(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [1,8]) }
    /** countNeighbours for range 0-8 (see countNeighbours) */ 
    countMoore9(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [0,8]) }
    countNeighbours9(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [0,8]) }
    /** countNeighbours for range 1-4 (see countNeighbours) */ 
    countNeumann4(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [1,4]) }
    countNeighbours4(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [1,4]) }
    /** countNeighbours for range 0-4 (see countNeighbours) */ 
    countNeumann5(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [0,4]) }
    countNeighbours5(model, col, row, property, val) { return this.countNeighbours(model, col, row, property, val, [0,4]) }



    /** Return a random neighbour from the neighbourhood defined by range array
     *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
     *  but can be mixed to make grids interact.
     *  @param {int} col position (column) for the focal gridpoint
     *  @param {int} row position (row) for the focal gridpoint
     *  @param {Array} range from which to sample (1-8 is Moore8, 0-4 is Neu5, etc.)
     */
    randomNeighbour(grid, col, row,range) {
        let rand = this.rng.genrand_int(range[0], range[1]);
        let i = this.moore[rand][0];
        let j = this.moore[rand][1];
        let neigh = grid.getGridpoint(col + i, row + j);
        while (neigh == undefined) neigh = this.randomNeighbour(grid, col, row,range);
        return neigh
    }

    /** randomMoore for range 1-8 (see randomMoore) */     
    randomMoore8(model, col, row) { return this.randomNeighbour(model, col, row, [1,8]) }
    randomNeighbour8(model, col, row) { return this.randomNeighbour(model, col, row, [1,8]) }

    /** randomMoore for range 0-8 (see randomMoore) */ 
    randomMoore9(model, col, row) { return this.randomNeighbour(model, col, row, [0,8]) }
    randomNeighbour9(model, col, row) { return this.randomNeighbour(model, col, row, [0,8]) }

    /** randomMoore for range 1-4 (see randomMoore) */ 
    randomNeumann4(model, col, row) { return this.randomNeighbour(model, col, row, [1,4]) }
    randomNeighbour4(model, col, row) { return this.randomNeighbour(model, col, row, [1,4]) }

    /** randomMoore for range 0-4 (see randomMoore) */ 
    randomNeumann5(model, col, row) { return this.randomNeighbour(model, col, row, [0,4]) }
    randomNeighbour5(model, col, row) { return this.randomNeighbour(model, col, row, [0,4]) }

    
    /** Diffuse continuous states on the grid. 
     * *  @param {string} state The name of the state to diffuse
     *  but can be mixed to make grids interact.
     *  @param {float} rate the rate of diffusion. (<0.25)     
     */
    diffuseStates(state,rate) {
        if(rate > 0.25) {
            throw new Error("Cacatoo: rate for diffusion cannot be greater than 0.25, try multiple diffusion steps instead.")
        }
        let newstate = MakeGrid(this.nc, this.nr, this.grid); 

        for (let i = 0; i < this.nc; i += 1) // every column
        {           
            for (let j = 0; j < this.nr; j += 1) // every row
            {                
                for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                {                    
                    let moore = this.moore[n];
                    let xy = this.getNeighXY(i + moore[0], j + moore[1]);
                    if (typeof xy == "undefined") continue
                    let neigh = this.grid[xy[0]][xy[1]];
                    newstate[i][j][state] += neigh[state] * rate;
                    newstate[xy[0]][xy[1]][state] -= neigh[state] * rate;
                }
            }
        }
        for (let i = 0; i < this.nc; i += 1) // every column
            for (let j = 0; j < this.nr; j += 1) // every row
                for (let n = 1; n <= 4; n++) this.grid[i][j][state] = newstate[i][j][state];
    }

    /** Diffuse continuous states on the grid. 
     * *  @param {string} state The name of the state to diffuse
     *  but can be mixed to make grids interact.
     *  @param {float} rate the rate of diffusion. (<0.25)     
     */
     diffuseStateVector(statevector,rate) {
        if(rate > 0.25) {
            throw new Error("Cacatoo: rate for diffusion cannot be greater than 0.25, try multiple diffusion steps instead.")
        }
        let newstate = MakeGrid(this.nc, this.nr); 

        for (let i = 0; i < this.nc; i += 1) // every column
            for (let j = 0; j < this.nr; j += 1) // every row
            {
                newstate[i][j].toxins = Array(statevector.length).fill(0);
                for (let n = 1; n <= 4; n++)
                    for(let state=0; state < this.grid[i][j][statevector].length; state++)
                        newstate[i][j][statevector][state] = this.grid[i][j][statevector][state];
            }

        for (let i = 0; i < this.nc; i += 1) // every column
        {           
            for (let j = 0; j < this.nr; j += 1) // every row
            {                
                for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                {                    
                    let moore = this.moore[n];
                    let xy = this.getNeighXY(i + moore[0], j + moore[1]);
                    if (typeof xy == "undefined") continue
                    let neigh = this.grid[xy[0]][xy[1]];
                    for(let state=0; state < newstate[i][j][statevector].length; state++)
                    {
                        newstate[i][j][statevector][state] += neigh[statevector][state] * rate;
                        newstate[xy[0]][xy[1]][statevector][state] -= neigh[statevector][state] * rate;
                    }
                }
            }
        }
        for (let i = 0; i < this.nc; i += 1) // every column
            for (let j = 0; j < this.nr; j += 1) // every row
                for (let n = 1; n <= 4; n++)
                    for(let state=0; state < newstate[i][j][statevector].length; state++)
                        this.grid[i][j][statevector][state] = newstate[i][j][statevector][state];
    }

    /** Diffuse ODE states on the grid. Because ODEs are stored by reference inside gridpoint, the 
     *  states of the ODEs have to be first stored (copied) into a 4D array (x,y,ODE,state-vector), 
     *  which is then used to update the grid.
     */
    diffuseODEstates() {
        let newstates_2 = CopyGridODEs(this.nc, this.nr, this.grid);    // Generates a 4D array of [i][j][o][s] (i-coord,j-coord,relevant ode,state-vector)    

        for (let i = 0; i < this.nc; i += 1) // every column
        {
            for (let j = 0; j < this.nr; j += 1) // every row
            {
                for (let o = 0; o < this.grid[i][j].ODEs.length; o++) // every ode
                {
                    for (let s = 0; s < this.grid[i][j].ODEs[o].state.length; s++) // every state
                    {
                        let rate = this.grid[i][j].ODEs[o].diff_rates[s];
                        let sum_in = 0.0;
                        for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                        {
                            let moore = this.moore[n];
                            let xy = this.getNeighXY(i + moore[0], j + moore[1]);
                            if (typeof xy == "undefined") continue
                            let neigh = this.grid[xy[0]][xy[1]];
                            sum_in += neigh.ODEs[o].state[s] * rate;
                            newstates_2[xy[0]][xy[1]][o][s] -= neigh.ODEs[o].state[s] * rate;
                        }
                        newstates_2[i][j][o][s] += sum_in;
                    }
                }
            }
        }

        for (let i = 0; i < this.nc; i += 1) // every column
            for (let j = 0; j < this.nr; j += 1) // every row
                for (let o = 0; o < this.grid[i][j].ODEs.length; o++)
                    for (let s = 0; s < this.grid[i][j].ODEs[o].state.length; s++)
                        this.grid[i][j].ODEs[o].state[s] = newstates_2[i][j][o][s];

    }

    /** Assign each gridpoint a new random position on the grid. This simulated mixing,
     *  but does not guarantee a "well-mixed" system per se (interactions are still)
     *  calculated based on neighbourhoods. 
     */
    perfectMix() {
        let all_gridpoints = [];
        for (let i = 0; i < this.nc; i++)
            for (let j = 0; j < this.nr; j++)
                all_gridpoints.push(this.getGridpoint(i, j));

        all_gridpoints = shuffle(all_gridpoints, this.rng);

        for (let i = 0; i < all_gridpoints.length; i++)
            this.setGridpoint(i % this.nc, Math.floor(i / this.nc), all_gridpoints[i]);
        return "Perfectly mixed the grid"
    }

    /** Apply diffusion algorithm for grid-based models described in Toffoli & Margolus' book "Cellular automata machines"
     *  The idea is to subdivide the grid into 2x2 neighbourhoods, and rotate them (randomly CW or CCW). To avoid particles
     *  simply being stuck in their own 2x2 subspace, different 2x2 subspaces are taken each iteration (CW in even iterations,
     *  CCW in odd iterations)
    */
    MargolusDiffusion() {        
        //   
        //   A  B
        //   D  C
        //   a = backup of A 
        //   rotate cw or ccw randomly
        let even = this.margolus_phase % 2 == 0;
        if ((this.nc % 2 + this.nr % 2) > 0) throw "Do not use margolusDiffusion with an uneven number of cols / rows!"

        for (let i = 0 + even; i < this.nc; i += 2) {
            if(i> this.nc-2) continue
            for (let j = 0 + even; j < this.nr; j += 2) {
                if(j> this.nr-2) continue
                // console.log(i,j)
                let old_A = new Gridpoint(this.grid[i][j]);
                let A = this.getGridpoint(i, j);
                let B = this.getGridpoint(i + 1, j);
                let C = this.getGridpoint(i + 1, j + 1);
                let D = this.getGridpoint(i, j + 1);

                if (this.rng.random() < 0.5)             // CW = clockwise rotation
                {
                    A = D;
                    D = C;
                    C = B;
                    B = old_A;
                }
                else {
                    A = B;                               // CCW = counter clockwise rotation      
                    B = C;
                    C = D;
                    D = old_A;
                }
                this.setGridpoint(i, j, A);
                this.setGridpoint(i + 1, j, B);
                this.setGridpoint(i + 1, j + 1, C);
                this.setGridpoint(i, j + 1, D);
            }
        }
        this.margolus_phase++;
    }

    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_labels Array of strings for the graph legend
     *  @param {Array} graph_values Array of floats to plot (here plotted over time)
     *  @param {Array} cols Array of colours to use for plotting
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
    plotArray(graph_labels, graph_values, cols, title, opts) {
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = parseColours(cols);
            graph_values.unshift(this.time);
            graph_labels.unshift("Time");
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts);
        }
        else {
            if (this.time % this.graph_interval == 0) {
                graph_values.unshift(this.time);
                graph_labels.unshift("Time");
                this.graphs[title].push_data(graph_values);
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update();
            }
        }
    }

    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_values Array of floats to plot (here plotted over time)
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
     plotPoints(graph_values, title, opts) {
        let graph_labels = Array.from({length: graph_values.length}, (v, i) => 'y'+(i+1));
        let cols = Array.from({length: graph_values.length}, (v, i) => 'black');

        let seriesname = 'average';
        let sum = 0;
        let num = 0;
        // Get average of all defined values
        for(let n = 0; n< graph_values.length; n++){
            if(graph_values[n] !== undefined) {
                sum += graph_values[n];
                num++;
            }
        }
        let avg = (sum / num) || 0;
        graph_values.unshift(avg);
        graph_labels.unshift(seriesname);
        cols.unshift("#666666");
        
        if(opts == undefined) opts = {};
        opts.drawPoints = true;
        opts.strokeWidth = 0;
        opts.pointSize = 1;
        
        opts.series = {[seriesname]: {strokeWidth: 3.0, strokeColor:"green", drawPoints: false, pointSize: 0, highlightCircleSize: 3 }};
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = parseColours(cols);
            graph_values.unshift(this.time);
            graph_labels.unshift("Time");
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts);
        }
        else {
            if (this.time % this.graph_interval == 0) {
                graph_values.unshift(this.time);
                graph_labels.unshift("Time");
                this.graphs[title].push_data(graph_values);
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update();
            }
        }
    }


    /** 
     * Adds a dygraph-plot to your DOM (if the DOM is loaded)
     *  @param {Array} graph_labels Array of strings for the graph legend
     *  @param {Array} graph_values Array of 2 floats to plot (first value for x-axis, second value for y-axis)
     *  @param {Array} cols Array of colours to use for plotting
     *  @param {String} title Title of the plot
     *  @param {Object} opts dictionary-style list of opts to pass onto dygraphs
    */
    plotXY(graph_labels, graph_values, cols, title, opts) {
        if (typeof window == 'undefined') return
        if (!(title in this.graphs)) {
            cols = parseColours(cols);
            this.graphs[title] = new Graph(graph_labels, graph_values, cols, title, opts);
        }
        else {
            if (this.time % this.graph_interval == 0) {
                this.graphs[title].push_data(graph_values);
            }
            if (this.time % this.graph_update == 0) {
                this.graphs[title].update();
            }
        }

    }

    /** 
     * Easy function to add a pop-sizes plot (wrapper for plotArrays)
     *  @param {String} property What property to plot (needs to exist in your model, e.g. "species" or "alive")
     *  @param {Array} values Which values are plotted (e.g. [1,3,4,6])     
    */
    plotPopsizes(property, values, opts) {
        if (typeof window == 'undefined') return
        if (this.time % this.graph_interval != 0 && this.graphs[`Population sizes (${this.name})`] !== undefined) return
        // Wrapper for plotXY function, which expects labels, values, colours, and a title for the plot:
        // Labels
        let graph_labels = [];
        for (let val of values) { graph_labels.push(property + '_' + val); }

        // Values
        let popsizes = this.getPopsizes(property, values);
        let graph_values = popsizes;

        // Colours
        let colours = [];

        for (let c of values) {
            if (this.statecolours[property].constructor != Object)
                colours.push(this.statecolours[property]);
            else
                colours.push(this.statecolours[property][c]);
        }
        // Title
        let title = "Population sizes (" + this.name + ")";
        if(opts && opts.title) title = opts.title;
        
        this.plotArray(graph_labels, graph_values, colours, title, opts);



        //this.graph = new Graph(graph_labels,graph_values,colours,"Population sizes ("+this.name+")")                            
    }

    /** 
     * Easy function to add a ODE states (wrapper for plot array)
     *  @param {String} ODE name Which ODE to plot the states for
     *  @param {Array} values Which states are plotted (if undefined, all of them are plotted)
    */
    plotODEstates(odename, values, colours) {
        if (typeof window == 'undefined') return
        if (this.time % this.graph_interval != 0 && this.graphs[`Average ODE states (${this.name})`] !== undefined) return
        // Labels
        let graph_labels = [];
        for (let val of values) { graph_labels.push(odename + '_' + val); }
        // Values
        let ode_states = this.getODEstates(odename, values);
        // Title
        let title = "Average ODE states (" + this.name + ")";
        this.plotArray(graph_labels, ode_states, colours, title);
    }

    drawSlide(canvasname,prefix="grid_") {
        let canvas = this.canvases[canvasname].elem; // Grab the canvas element
        let timestamp = sim.time.toString();
        timestamp = timestamp.padStart(5, "0");
        canvas.toBlob(function(blob) 
        {
            saveAs(blob, prefix+timestamp+".png");
        });
    }

    resetPlots() {
        this.time = 0;
        for (let g in this.graphs) {
            this.graphs[g].reset_plot();
        }
    }
    /** 
     *  Returns an array with the population sizes of different types
     *  @param {String} property Return popsizes for this property (needs to exist in your model, e.g. "species" or "alive")
     *  @param {Array} values Which values are counted and returned (e.g. [1,3,4,6])     
    */
    getPopsizes(property, values) {
        let sum = Array(values.length).fill(0);
        for (let i = 0; i < this.nc; i++) {
            for (let j = 0; j < this.nr; j++) {
                for (let val in values)
                    if (this.grid[i][j][property] == values[val]) sum[val]++;
            }
        }
        return sum;
    }

    /** 
     *  Returns an array with the population sizes of different types
     *  @param {String} property Return popsizes for this property (needs to exist in your model, e.g. "species" or "alive")
     *  @param {Array} values Which values are counted and returned (e.g. [1,3,4,6])     
    */
    getODEstates(odename, values) {
        let sum = Array(values.length).fill(0);
        for (let i = 0; i < this.nc; i++)
            for (let j = 0; j < this.nr; j++)
                for (let val in values)
                    sum[val] += this.grid[i][j][odename].state[val] / (this.nc * this.nr);
        return sum;
    }



    /** 
     *  Attaches an ODE to all GPs in the model. Each gridpoint has it's own ODE.
     *  @param {function} eq Function that describes the ODEs, see examples starting with "ode"
     *  @param {Object} conf dictionary style configuration of your ODEs (initial state, parameters, etc.)
    */
    attachODE(eq, conf) {
        for (let i = 0; i < this.nc; i++) {
            for (let j = 0; j < this.nr; j++) {
                let ode = new ODE(eq, conf.init_states, conf.parameters, conf.diffusion_rates, conf.ode_name, conf.acceptable_error);
                if (typeof this.grid[i][j].ODEs == "undefined") this.grid[i][j].ODEs = [];   // If list doesnt exist yet                
                this.grid[i][j].ODEs.push(ode);
                if (conf.ode_name) this.grid[i][j][conf.ode_name] = ode;
            }
        }
    }

    /** 
     *  Numerically solve the ODEs for each grid point
     *  @param {float} delta_t Step size
     *  @param {bool} opt_pos When enabled, negative values are set to 0 automatically
    */
    solveAllODEs(delta_t = 0.1, opt_pos = false) {
        for (let i = 0; i < this.nc; i++) {
            for (let j = 0; j < this.nr; j++) {
                for (let ode of this.grid[i][j].ODEs) {
                    ode.solveTimestep(delta_t, opt_pos);
                }
            }
        }
    }

    /** 
     *  Print the entire grid to the console. Not always recommended, but useful for debugging
     *  @param {float} property What property is printed
     *  @param {float} fract Subset to be printed (from the top-left)
    */
    printGrid(property, fract) {
        let ncol = this.nc;
        let nrow = this.nr;

        if (fract != undefined) ncol *= fract, nrow *= fract;
        let grid = new Array(nrow);             // Makes a column or <rows> long --> grid[cols]
        for (let i = 0; i < ncol; i++)
            grid[i] = new Array(ncol);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let j = 0; j < nrow; j++)
            grid[i][j] = this.grid[i][j][property];

        console.table(grid);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  The functions below are not methods of grid-model as they are never unique for a particular model. 
////////////////////////////////////////////////////////////////////////////////////////////////////


/** 
 *  Make a grid, or when a template is given, a COPY of a grid. 
 *  @param {int} cols Width of the new grid
 *  @param {int} rows Height of the new grid
 *  @param {2DArray} template Template to be used for copying (if not set, a new empty grid is made)
*/
let MakeGrid = function(cols, rows, template) {
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let j = 0; j < rows; j++) {
            if (template) grid[i][j] = new Gridpoint(template[i][j]);  // Make a deep or shallow copy of the GP 
            else grid[i][j] = new Gridpoint();
        }
    }

    return grid;
};

/** 
 *  Make a back-up of all the ODE states (for synchronous ODE updating)
 *  @param {int} cols Width of the grid
 *  @param {int} rows Height of the grid
 *  @param {2DArray} template Get ODE states from here
*/
let CopyGridODEs = function(cols, rows, template) {
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let j = 0; j < rows; j++) {
            for (let o = 0; o < template[i][j].ODEs.length; o++) // every ode
            {
                grid[i][j] = [];
                let states = [];
                for (let s = 0; s < template[i][j].ODEs[o].state.length; s++) // every state
                    states.push(template[i][j].ODEs[o].state[s]);
                grid[i][j][o] = states;
            }
        }
    }

    return grid;
};

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
        this.label = lab;
        this.gridmodel = gridmodel;
        this.statecolours = gridmodel.statecolours;
        this.property = prop;
        this.height = height;
        this.width = width;
        this.scale = scale;        
        this.continuous = continuous;
        this.bgcolour = 'black';
        this.offset_x = 0;
        this.offset_y = 0;        
        this.phase = 0;

        if (typeof document !== "undefined")                       // In browser, crease a new HTML canvas-element to draw on 
        {
            this.elem = document.createElement("canvas");
            this.titlediv = document.createElement("div");
            this.titlediv.innerHTML = "<font size = 2>" + this.label + "</font>";

            this.canvasdiv = document.createElement("div");
            this.canvasdiv.className = "grid-holder";
            
            
            this.elem.className = "canvas-cacatoo";
            this.elem.width = this.width * this.scale;
            this.elem.height = this.height * this.scale;
            this.canvasdiv.appendChild(this.elem);
            this.canvasdiv.appendChild(this.titlediv);            
            document.getElementById("canvas_holder").appendChild(this.canvasdiv);
            this.ctx = this.elem.getContext("2d");
        }

    }

    

    /**
    *  Draw the state of the Gridmodel (for a specific property) onto the HTML element
    */
     displaygrid() {
        let ctx = this.ctx;
        let scale = this.scale;
        let ncol = this.width;
        let nrow = this.height;
        let prop = this.property;
        
        if(this.spacetime){
            ctx.fillStyle = this.bgcolour;
            ctx.fillRect((this.phase%ncol)*scale, 0, scale, nrow * scale);
        }
        else {
            ctx.clearRect(0, 0, scale * ncol, scale * nrow);        
            ctx.fillStyle = this.bgcolour;
            ctx.fillRect(0, 0, ncol * scale, nrow * scale);            
        }

        var id = ctx.getImageData(0, 0, scale * ncol, scale * nrow);
        var pixels = id.data;

        let start_col = this.offset_x;
        let stop_col = start_col + ncol;
        let start_row = this.offset_y;
        let stop_row = start_row + nrow;

        let statecols = this.statecolours[prop];
        
        for (let i = start_col; i < stop_col; i++)         // i are cols
        {
            for (let j = start_row; j< stop_row; j++)     // j are rows
            {                     
                if (!(prop in this.gridmodel.grid[i][j]))
                    continue                     
                
                let value = this.gridmodel.grid[i][j][prop];
                if(this.continuous && value !== 0 && this.maxval !== undefined && this.minval !== undefined)
                {                  
                    value = Math.min(value+this.minval,this.maxval);
                    let mult = this.num_colours/(this.maxval-this.minval);
                    value = Math.max(Math.floor(value*mult),1);                     
                }                

                if (statecols[value] == undefined)                   // Don't draw the background state                 
                    continue                                    
                
                let idx; 
                if (statecols.constructor == Object) {
                    idx = statecols[value];
                }
                else idx = statecols;

                for (let n = 0; n < scale; n++) {
                    for (let m = 0; m < scale; m++) {
                        let x = (i-this.offset_x) * scale + n + (this.phase%ncol)*scale;
                        let y = (j-this.offset_y) * scale + m;
                        var off = (y * id.width + x) * 4;
                        pixels[off] = idx[0];
                        pixels[off + 1] = idx[1];
                        pixels[off + 2] = idx[2];
                    }
                }


            }
            if(this.spacetime) {
                this.phase = (this.phase+1);
                break
            }
        }
        ctx.putImageData(id, 0, 0);
    }

    /**
    *  Draw the state of the Gridmodel (for a specific property) onto the HTML element
    */
     displaygrid_dots() {
        let ctx = this.ctx;
        let scale = this.scale;
        let ncol = this.width;
        let nrow = this.height;
        let prop = this.property;

        if(this.spacetime){
            ctx.fillStyle = this.bgcolour;
            ctx.fillRect((this.phase%ncol)*scale, 0, scale, nrow * scale);
        }
        else {
            ctx.clearRect(0, 0, scale * ncol, scale * nrow);        
            ctx.fillStyle = this.bgcolour;
            ctx.fillRect(0, 0, ncol * scale, nrow * scale);         
        }        

        let start_col = this.offset_x;
        let stop_col = start_col + ncol;
        let start_row = this.offset_y;
        let stop_row = start_row + nrow;

        let statecols = this.statecolours[prop];
        
        
        for (let i = start_col; i < stop_col; i++)         // i are cols
        {
            for (let j = start_row; j< stop_row; j++)     // j are rows
            {                     
                if (!(prop in this.gridmodel.grid[i][j]))
                    continue                     
                
               

                let value = this.gridmodel.grid[i][j][prop];

                let radius = this.scale_radius*this.radius;
                
                if(isNaN(radius)) radius = this.scale_radius*this.gridmodel.grid[i][j][this.radius];                
                if(isNaN(radius)) radius = this.min_radius;
                radius = Math.max(Math.min(radius,this.max_radius),this.min_radius);

                if(this.continuous && value !== 0 && this.maxval !== undefined && this.minval !== undefined)
                {                                      
                    value = Math.max(value,this.minval) - this.minval;
                    let mult = this.num_colours/(this.maxval-this.minval);
                    value = Math.min(this.num_colours,Math.max(Math.floor(value*mult),1));
                }                

                if (statecols[value] == undefined)                   // Don't draw the background state                 
                    continue
                
                let idx; 
                if (statecols.constructor == Object) {
                    idx = statecols[value];
                }
                else idx = statecols;

                ctx.beginPath();
                ctx.arc((i-this.offset_x) * scale + 0.5*scale, (j-this.offset_y) * scale + 0.5*scale, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgb('+idx[0]+', '+idx[1]+', '+idx[2]+')';
                // ctx.fillStyle = 'rgb(100,100,100)';
                ctx.fill();
                
                if(this.stroke){
                    ctx.lineWidth = this.strokeWidth;                   
                    ctx.strokeStyle = this.strokeStyle;
                    ctx.stroke();     
                }
                           
            }
        }
        // ctx.putImageData(id, 0, 0);
    }

    add_legend(div,property)
    {
        if (typeof document == "undefined") return
        let statecols = this.statecolours[property];
        if(statecols == undefined){
            console.warn(`Cacatoo warning: no colours setup for canvas "${this.label}"`);
            return
        } 
                    
        this.legend = document.createElement("canvas");
        this.legend.className = "legend";
        this.legend.width = this.width*this.scale;
        
        this.legend.height = 40;
        let ctx = this.legend.getContext("2d");
        if(this.maxval!==undefined) {
            let bar_width = this.width*this.scale*0.8;
            let offset = 0.1*this.legend.width;  
            let n_ticks = this.nticks-1;
            
            let tick_increment = (this.maxval-this.minval) / n_ticks;
            let step_size =  (this.legend.width / n_ticks)*0.8;
            
            
            for(let i=0;i<bar_width;i++)
            {
                let colval = Math.ceil(this.num_colours*i/bar_width);
                if(statecols[colval] == undefined) {                    
                    ctx.fillStyle = this.bgcolor;
                }
                else {                    
                    ctx.fillStyle = rgbToHex(statecols[colval]);
                }
                ctx.fillRect(offset+i, 10, 1, 10);                
                ctx.closePath();
                
            }
            for(let i = 0; i<n_ticks+1; i++){
                let tick_position = (i*step_size+offset);
                ctx.strokeStyle = "#FFFFFF";                        
                ctx.beginPath();
                ctx.moveTo(tick_position, 15);
                ctx.lineTo(tick_position, 20);
                ctx.lineWidth=2;
                ctx.stroke();
                ctx.closePath();
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.font = '12px helvetica';     
                let ticklab = (this.minval+i*tick_increment);
                ticklab = ticklab.toFixed(this.decimals);         
                ctx.fillText(ticklab, tick_position, 35);
            }

            ctx.beginPath();
            ctx.rect(offset, 10, bar_width, 10);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
            div.appendChild(this.legend);
        }
        else {                     
            let keys = Object.keys(statecols);
            let total_num_values = keys.length;
            let spacing = 0.8;
            if(total_num_values < 8) spacing = 0.7;
            if(total_num_values < 4) spacing = 0.6;
            
            let bar_width = this.width*this.scale*spacing;   
            let offset = 0.5*(1-spacing)*this.legend.width;
            let step_size = Math.ceil(bar_width / (total_num_values-1));

            if(total_num_values==1){
                step_size=0;
                offset = 0.5*this.legend.width;
            } 
            
            for(let i=0;i<total_num_values;i++)
            {                                       
                let pos = offset+Math.floor(i*step_size);
                ctx.beginPath();                
                ctx.strokeStyle = "#000000";
                if(statecols[keys[i]] == undefined) ctx.fillStyle = this.bgcolor;                
                else ctx.fillStyle = rgbToHex(statecols[keys[i]]);
                ctx.fillRect(pos-4, 10, 10, 10);
                ctx.closePath();
                ctx.font = '12px helvetica';
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.fillText(keys[i], pos, 35);
            }
            div.appendChild(this.legend);
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

// Browser-friendly version of 'fast-random' (https://github.com/borilla/fast-random) by Bram van Dijk for compatibility with browser-based Cacatoo models
if (typeof module !== 'undefined') module.exports = random; 
function random(seed) {
    function _seed(s) {
            if ((seed = (s|0) % 2147483647) <= 0) {
                    seed += 2147483646;
            }
    }

    function _nextInt() {
            return seed = seed * 48271 % 2147483647;
    }

    function _nextFloat() {
            return (_nextInt() - 1) / 2147483646;
    }    

    _seed(seed);

    return {
            seed: _seed,
            nextInt: _nextInt,
            nextFloat: _nextFloat
    };
}

//module.exports = random;

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
        if(config == undefined) config = {};
        this.config = config;                
        this.rng = this.setupRandom(config.seed);
        // this.rng_old = new MersenneTwister(config.seed || 53);        
        this.sleep = config.sleep = config.sleep || 0;
        this.maxtime = config.maxtime = config.maxtime || 1000000;
        this.ncol = config.ncol = config.ncol || 100;
        this.nrow = config.nrow = config.nrow || 100;  
        this.scale = config.scale = config.scale || 2;

        this.graph_interval = config.graph_interval = config.graph_interval || 10;
        this.graph_update = config.graph_update= config.graph_update || 50;
        this.fps = config.fps * 1.4 || 60; // Multiplied by 1.4 to adjust for overhead
        this.fastmode = false;
        if(config.fastmode == true) this.fastmode = true;
        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.gridmodels = [];            // All gridmodels in this simulation
        this.canvases = [];              // Array with refs to all canvases (from all models) from this simulation
        this.graphs = [];                // All graphs
        this.time = 0;
        this.inbrowser = (typeof document !== "undefined");        
        this.fpsmeter = false;
        if(config.fpsmeter == true) this.fpsmeter = true;
        this.fastmode = false;
        if(config.fastmode == true) this.fastmode = true;
        this.printcursor = true;
        if(config.printcursor == false) this.printcursor = false;        
    }
    

    /**
    *  Generate a new GridModel within this simulation.  
    *  @param {string} name The name of your new model, e.g. "gol" for game of life. Cannot contain whitespaces. 
    */
    makeGridmodel(name) {
        if (name.indexOf(' ') >= 0) throw new Error("The name of a gridmodel cannot contain whitespaces.")
        let model = new Gridmodel(name, this.config, this.rng); // ,this.config.show_gridname weggecomment
        this[name] = model;           // this = model["cheater"] = CA-obj
        this.gridmodels.push(model);
    }

    /**
    * Set up the random number generator
    * @param {int} seed Seed for fast-random module
    */
    setupRandom(seed){
        let rng = random(seed);
        rng.genrand_real1 = function () { return (rng.nextInt() - 1) / 2147483645 };         // Generate random number in [0,1] range        
        rng.genrand_real2 = function () { return (rng.nextInt() - 1) / 2147483646 };         // Generate random number in [0,1) range        
        rng.genrand_real3 = function () { return rng.nextInt() / 2147483647 };               // Generate random number in (0,1) range        
        rng.genrand_int = function (min,max) { return min+ rng.nextInt() % (max-min+1) };    // Generate random integer between (and including) min and max    
        rng.random = () => { return rng.genrand_real2() };        
        rng.randomInt = () => { return rng.genrand_int() };                
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
            console.warn("Cacatoo:createDisplay, cannot create display in command-line mode.");
            return
        }
        if(typeof arguments[0] === 'object')
        {
            name = arguments[0].name; 
            property = arguments[0].property;
            customlab = arguments[0].label; 
            height = arguments[0].height; 
            width = arguments[0].width; 
            scale = arguments[0].scale; 
        }
        
        
        if(name==undefined || property == undefined) throw new Error("Cacatoo: can't make a display with out a 'name' and 'property'")        

        let label = customlab; 
        if (customlab == undefined) label = `${name} (${property})`; // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name];        
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if (height == undefined) height = gridmodel.nr;
        if (width == undefined) width = gridmodel.nc;
        if (scale == undefined) scale = gridmodel.scale;

        if(gridmodel.statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`);                        
            gridmodel.statecolours[property] = default_colours(10);
        } 
        
        let cnv = new Canvas(gridmodel, property, label, height, width, scale);
        gridmodel.canvases[label] = cnv;  // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv);  // Add a reference to the canvas to the sim
        const canvas = cnv;        
        cnv.add_legend(cnv.canvasdiv,property);
        cnv.bgcolour = this.config.bgcolour || 'black';
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(canvas, e, scale); }, false);
        cnv.displaygrid();                
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
            console.warn("Cacatoo:createDisplay_discrete, cannot create display in command-line mode.");
            return
        }
        let name = config.model;
        
        let property = config.property;                 

        let label = config.label;
        if (label == undefined) label = `${name} (${property})`; // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name];
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr;        
        let width = config.width || this[name].nc;
        let scale = config.scale || this[name].scale;               
        
        if(name==undefined || property == undefined) throw new Error("Cacatoo: can't make a display with out a 'name' and 'property'")        

        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        if (height == undefined) height = gridmodel.nr;
        if (width == undefined) width = gridmodel.nc;
        if (scale == undefined) scale = gridmodel.scale;

        if(gridmodel.statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`);                        
            gridmodel.statecolours[property] = default_colours(10);
        } 
        
        let cnv = new Canvas(gridmodel, property, label, height, width, scale);
        if(config.drawdots) {
            cnv.displaygrid = cnv.displaygrid_dots;
            cnv.stroke = config.stroke; 
            cnv.strokeStyle = config.strokeStyle;
            cnv.strokeWidth = config.strokeWidth;
            cnv.radius = config.radius || 10;
            cnv.max_radius = config.max_radius || 10;
            cnv.scale_radius = config.scale_radius || 1;
            cnv.min_radius = config.min_radius || 0;
        }
        gridmodel.canvases[label] = cnv;  // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv);  // Add a reference to the canvas to the sim
        const canvas = cnv;        
        cnv.add_legend(cnv.canvasdiv,property);
        cnv.bgcolour = this.config.bgcolour || 'black';
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(canvas, e, scale); }, false);
        cnv.displaygrid(); 
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
            console.warn("Cacatoo:createDisplay_continuous, cannot create display in command-line mode.");
            return
        }
        let name = config.model;
        
        let property = config.property; 
        
        
        let label = config.label;
        if (label == undefined) label = `${name} (${property})`; // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name];
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr;        
        let width = config.width || this[name].nc;
        let scale = config.scale || this[name].scale;               
        let maxval = config.maxval || this.maxval || undefined;   
        let decimals= config.decimals || 0;
        let nticks= config.nticks || 5;
        let minval = config.minval || 0;
        let num_colours = config.num_colours || (maxval-minval) || 64;
        
        if(config.fill == "viridis") this[name].colourViridis(property, num_colours);    
        else if(config.fill == "inferno") this[name].colourViridis(property, num_colours, false, "inferno");    
        else if(config.fill == "inferno_rev") this[name].colourViridis(property, num_colours, true, "inferno");    
        else if(config.fill == "red") this[name].colourGradient(property, num_colours, [0, 0, 0], [255, 0, 0]);
        else if(config.fill == "green") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 255, 0]);
        else if(config.fill == "blue") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255]);
        else if(this[name].statecolours[property]==undefined){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`);
            this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255]);
        } 
        

        let cnv = new Canvas(gridmodel, property, label, height, width, scale, true);

        if(config.drawdots) {
            cnv.displaygrid = cnv.displaygrid_dots;
            cnv.stroke = config.stroke; 
            cnv.strokeStyle = config.strokeStyle;
            cnv.strokeWidth = config.strokeWidth;
            cnv.radius = config.radius || 10;
            cnv.max_radius = config.max_radius || 10;
            cnv.scale_radius = config.scale_radius || 1;
            cnv.min_radius = config.min_radius || 0;
        }

        gridmodel.canvases[label] = cnv;  // Add a reference to the canvas to the gridmodel
        if (maxval !== undefined) cnv.maxval = maxval;
        if (minval !== undefined) cnv.minval = minval;
        if (num_colours !== undefined) cnv.num_colours = num_colours;
        if (decimals !== undefined) cnv.decimals = decimals;
        if (nticks !== undefined) cnv.nticks = nticks;
        
        cnv.add_legend(cnv.canvasdiv,property); 
        cnv.bgcolour = this.config.bgcolour || 'black';
        this.canvases.push(cnv);  // Add a reference to the canvas to the sim
        const canvas = cnv;        
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(cnv, e, scale); }, false);
        cnv.displaygrid();
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
            console.warn("Cacatoo:spaceTimePlot, cannot create display in command-line mode.");
            return
        }
        
        let source_canvas = this[name].canvases[source_canvas_label];
        let property = source_canvas.property;
        let height = source_canvas.height;
        let width = ncolumn;
        let scale = source_canvas.scale;
        

        let cnv = new Canvas(this[name], property, label, height, width, scale);
        
        cnv.spacetime=true;
        cnv.offset_x = col_to_draw;
        cnv.continuous = source_canvas.continuous;
        cnv.minval = source_canvas.minval;
        cnv.maxval = source_canvas.maxval;
        cnv.num_colours = source_canvas.num_colours;
        cnv.ctx.fillRect(0, 0, width*scale , height*scale);

        this[name].canvases[label] = cnv;    // Add a reference to the canvas to the gridmodel
        this.canvases.push(cnv);             // Add a reference to the canvas to the sim

        var newCanvas = document.createElement('canvas');
        var context = newCanvas.getContext('2d');
        newCanvas.width = source_canvas.legend.width;
        newCanvas.height = source_canvas.legend.height;
        context.drawImage(source_canvas.legend, 0, 0);

        cnv.canvasdiv.appendChild(newCanvas);
        cnv.bgcolour = this.config.bgcolour || 'black';
    }


    /**
    * Get the position of the cursor on the canvas
    * @param {canvas} canvas A (constant) canvas object
    * @param {event-handler} event Event handler (mousedown)
    * @param {scale} scale The zoom (scale) of the grid to grab the correct grid point
    */
    getCursorPosition(canvas, event, scale) {
        const rect = canvas.elem.getBoundingClientRect();
        const x = Math.floor(Math.max(0, event.clientX - rect.left) / scale) + canvas.offset_x;
        const y = Math.floor(Math.max(0, event.clientY - rect.top) / scale) + canvas.offset_y;
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
        let coords = this.getCursorPosition(canvas,event,scale);
        let x = coords.x;
        let y = coords.y;
        if( x< 0 || x >= this.ncol || y < 0 || y >= this.nrow) return
        console.log(`You have clicked the grid at position ${x},${y}, which has grid point:`);
        for (let model of this.gridmodels) {
            console.log(model.grid[x][y]);
            console.log(`... in model ${model.name}`);
        }
    }



    /**
    * Update all the grid models one step. Apply optional mixing
    */
    step() {
        for (let i = 0; i < this.gridmodels.length; i++)
            this.gridmodels[i].update();
        this.time++;
    }

    /**
    * Apply global events to all grids in the model. 
    * (only perfectmix currently... :D)
    */
    events() {
        for (let i = 0; i < this.gridmodels.length; i++) {
            if (this.mix) this.gridmodels[i].perfectMix();
        }
    }

    /**
     *  Display all the canvases linked to this simulation
     */
    display() {
        for (let i = 0; i < this.canvases.length; i++)
            this.canvases[i].displaygrid();
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
                meter = new FPSMeter({ position: 'absolute', show: 'ms', left: "auto", top: "45px", right: "25px", graph: 1, history: 20, smoothing: 100});                
                
            } 

            if (this.config.noheader != true) document.title = `Cacatoo - ${this.config.title}`;            
            
            var link = document.querySelector("link[rel~='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); }
            link.href = '../../images/favicon.png';

            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML = `<a target="blank" href="https://bramvandijk88.github.io/cacatoo/"><img class="logos" src=""https://bramvandijk88.github.io/cacatoo/cacatoo/images/elephant_cacatoo_small.png"></a>`;
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += `<a target="blank" href="https://github.com/bramvandijk88/cacatoo"><img class="logos" style="padding-top:32px;" src=""https://bramvandijk88.github.io/cacatoo/cacatoo/images/gh.png"></a></img>`;
            if (this.config.noheader != true && document.getElementById("header") != null) document.getElementById("header").innerHTML = `<div style="height:40px;"><h2>Cacatoo - ${this.config.title}</h2></div><div style="padding-bottom:20px;"><font size=2>${this.config.description}</font size></div>`;
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += "<h2>Cacatoo is a toolbox to explore spatially structured models straight from your webbrowser. Suggestions or issues can be reported <a href=\"https://github.com/bramvandijk88/cacatoo/issues\">here.</a></h2>";
            let simStartTime = performance.now();

            async function animate() {
                
                if (sim.config.fastmode)          // Fast-mode tracks the performance so that frames can be skipped / paused / etc. Has some overhead, so use wisely!
                {
                    
                    if (sim.sleep > 0) await pause(sim.sleep);
                    if(sim.fpsmeter) meter.tickStart();
                    let t = 0;              // Will track cumulative time per step in microseconds 

                    while (t < 16.67 * 60 / sim.fps)          //(t < 16.67) results in 60 fps if possible
                    {
                        let startTime = performance.now();
                        if(!sim.pause==true){
                            sim.step();
                            sim.events();
                        }
                        let endTime = performance.now();
                        t += (endTime - startTime);
                        
                        if (!sim.limitfps) break
                    }
                    sim.display();
                    if(sim.fpsmeter) meter.tick();
                }
                else                    // A slightly more simple setup, but does not allow controls like frame-rate, skipping every nth frame, etc. 
                {
                    if (sim.sleep > 0) await pause(sim.sleep);
                    if(sim.fpsmeter) meter.tickStart();
                    if (!sim.pause == true) {
                        sim.step();
                        sim.events();
                    }
                    sim.display();
                    if(sim.fpsmeter) meter.tick();
                    
                }

                let frame = requestAnimationFrame(animate);
                if (sim.time >= sim.config.maxtime) {
                    let simStopTime = performance.now();
                    console.log("Cacatoo completed after", Math.round(simStopTime - simStartTime) / 1000, "seconds");
                    cancelAnimationFrame(frame);
                }

                if (sim.pause == true) { cancelAnimationFrame(frame); }
            }

            requestAnimationFrame(animate);
        }
        else {
            while (true) {
                sim.step();
                if (sim.time >= sim.config.maxtime) return true;
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
        let p = property || 'val';
        let bg = 0;

        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++)                  // j are rows
                gridmodel.grid[i][j][p] = bg;

        for (let arg = 2; arg < arguments.length; arg += 2)         // Parse remaining 2+ arguments to fill the grid           
            for (let i = 0; i < gridmodel.nc; i++)                        // i are columns
                for (let j = 0; j < gridmodel.nr; j++)                    // j are rows
                {
                    if (this.rng.random() < arguments[arg + 1]) gridmodel.grid[i][j][p] = arguments[arg];                    
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
          if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
          if(freqs.reduce((a, b) => a + b) > 1) throw new Error("populateGrid should not have frequencies that sum up to greater than 1")

          for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
              for (let j = 0; j < gridmodel.nr; j++){                 // j are rows
                  for (const property in individuals[0]) {
                      gridmodel.grid[i][j][property] = 0;    
                  }
                  let random_number = this.rng.random();
                  let sum_freqs = 0;
                  for(let n=0; n<individuals.length; n++)
                  {
                      sum_freqs += freqs[n];
                      if(random_number < sum_freqs) {
                          Object.assign(gridmodel.grid[i][j],individuals[n]);
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
        let p = property || 'val';
        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++) 
                gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr][p] = undefined;
        this.putSpot(gridmodel,property,value,size,x,y);
    }

    /**
    *  putSpot sets values at a certain position with a certain radius. Grid points close to a certain coordinate are set to state value, while
    *  other cells are set to the bg-state of 0. 
    *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
    *  @param {String} property The name of the state to be set 
    *  @param {integer} value The value of the state to be set (optional argument with position 2, 4, 6, ..., n)
    *  @param {float} fraction The chance the grid point is set to this state (optional argument with position 3, 5, 7, ..., n)
    */
     putSpot(gridmodel, property, value, size, x, y) {
        // Draw a circle
        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
            for (let j = 0; j < gridmodel.nr; j++)                           // j are rows
            {
                if ((Math.pow((i - x), 2) + Math.pow((j - y), 2)) < size)
                    gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr][property] = value;
            }
    }

    /**
     *  populateSpot populates a spot with custom individuals. 
     *  @param {@GridModel} grid The gridmodel containing the grid to be modified. 
     *  @param {Array} individuals The properties for individuals 1..n
     *  @param {Array} freqs The initial frequency of individuals 1..n
     */
     populateSpot(gridmodel,individuals, freqs,size, x, y, set_background_state=false)
     {
        let sumfreqs =0;
        if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
        for(let i=0; i<freqs.length; i++) sumfreqs += freqs[i];
         
        // Draw a circle
        for (let i = 0; i < gridmodel.nc; i++)                          // i are columns
        for (let j = 0; j < gridmodel.nr; j++)                           // j are rows
        {
            if(set_background_state) for (const property in individuals[0]) gridmodel.grid[i][j][property] = 0; 

            if ((Math.pow((i - x), 2) + Math.pow((j - y), 2)) < size)
            {
                let cumsumfreq = 0;                
                for(let n=0; n<individuals.length; n++)
                {
                    cumsumfreq += freqs[n];
                    if(this.rng.random() < cumsumfreq) {
                        Object.assign(gridmodel.grid[i % gridmodel.nc][j % gridmodel.nr],individuals[n]);
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
        let button = document.createElement("button");
        button.innerHTML = text;
        button.addEventListener("click", func, true);
        document.getElementById("form_holder").appendChild(button);
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
        let lab = label || parameter;
        if (!this.inbrowser) return
        if (window[parameter] === undefined) { console.warn(`addSlider: parameter ${parameter} not found. No slider made.`); return; }
        let container = document.createElement("div");
        container.classList.add("form-container");

        let slider = document.createElement("input");
        let numeric = document.createElement("input");
        container.innerHTML += "<div style='width:100%;height:20px;font-size:12px;'><b>" + lab + ":</b></div>";

        // Setting slider variables / handler
        slider.type = 'range';
        slider.classList.add("slider");
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = window[parameter];
        slider.oninput = function () {
            let value = parseFloat(slider.value);
            window[parameter] = parseFloat(value);
            numeric.value = value;
        };

        // Setting number variables / handler
        numeric.type = 'number';
        numeric.classList.add("number");
        numeric.min = min;
        numeric.max = max;
        numeric.step = step;
        numeric.value = window[parameter];
        numeric.onchange = function () {
            let value = parseFloat(numeric.value);
            if (value > this.max) value = this.max;
            if (value < this.min) value = this.min;
            window[parameter] = parseFloat(value);
            numeric.value = value;
            slider.value = value;
        };
        container.appendChild(slider);
        container.appendChild(numeric);
        document.getElementById("form_holder").appendChild(container);
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
        let lab = label || func;
        if (!this.inbrowser) return
        if (func === undefined) { console.warn(`addCustomSlider: callback function not defined. No slider made.`); return; }
        let container = document.createElement("div");
        container.classList.add("form-container");

        let slider = document.createElement("input");
        let numeric = document.createElement("input");
        container.innerHTML += "<div style='width:100%;height:20px;font-size:12px;'><b>" + lab + ":</b></div>";

        // Setting slider variables / handler
        slider.type = 'range';
        slider.classList.add("slider");
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = default_value;
        sim;
        slider.oninput = function () {
            let value = parseFloat(slider.value);
            func(value);
            numeric.value = value;
        };

        // Setting number variables / handler
        numeric.type = 'number';
        numeric.classList.add("number");
        numeric.min = min;
        numeric.max = max;
        numeric.step = step;
        numeric.value = default_value;
        numeric.onchange = function () {
            let value = parseFloat(numeric.value);
            if (value > this.max) value = this.max;
            if (value < this.min) value = this.min;
            func(value);
            numeric.value = value;
            slider.value = value;
        };
        container.appendChild(slider);
        container.appendChild(numeric);
        document.getElementById("form_holder").appendChild(container);
    }
    
    /**
     *  addToggle adds a HTML checkbox element to the DOM-environment which allows the user
     *  to flip boolean values
     *  @param {string} parameter The name of the (global!) boolean to link to the checkbox
     */
     addToggle(parameter, label) {
        let lab = label || parameter;
        if (!this.inbrowser) return
        if (window[parameter] === undefined) { console.warn(`addToggle: parameter ${parameter} not found. No toggle made.`); return; }
        let container = document.createElement("div");
        container.classList.add("form-container");

        let checkbox = document.createElement("input");

        



        container.innerHTML += "<div style='width:100%;height:20px;font-size:12px;'><b>" + lab + ":</b></div>";

        // Setting variables / handler
        checkbox.type = 'checkbox';

        checkbox.checked = window[parameter];

        checkbox.oninput = function () {
            window[parameter] = checkbox.checked;
        };

       
        container.appendChild(checkbox);
        document.getElementById("form_holder").appendChild(container);
    }

    /**
     *  Adds some html to an existing DIV in your web page. 
     *  @param {String} div Name of DIV to add to
     *  @param {String} html HTML code to add
     */
    addHTML(div, html) {
        if (!this.inbrowser) return
        let container = document.createElement("div");
        container.innerHTML += html;
        document.getElementById(div).appendChild(container);
    }
    /**
     *  log a message to either the console, or to a HTML div. 
     *  @param {String} msg String to write to log
     *  @param {String} target If defined, write log to HTML div with this name
     */
     log(msg, target, append = true) {
        if (!this.inbrowser) console.log(msg);
        else if (typeof target == "undefined") console.log(msg);
        else {
            if(append) document.getElementById(target).innerHTML += `${msg}<br>`;
            else document.getElementById(target).innerHTML = `${msg}<br>`;
        }
    }

    /**
     *  write a string to either a file, or generate a download request in the browser
     *  @param {String} text String to write
     *  @param {String} filename write to this filename
     */
     write(text, filename){
         
        if (!this.inbrowser) {
            let fs;
            try { fs = require('fs'); }
            catch(e){ console.warn(`[Cacatoo warning] Module 'fs' is not installed. Cannot write to \'${filename}\'. Please run 'npm install fs'`); return }           
            fs.writeFileSync(filename, text);
        }
        else {            
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
             console.warn("Cacatoo warning: sorry, appending to files is not supported in browser mode.");
         }
         else {
            let fs;
            try { fs = require('fs'); }
            catch(e){ console.warn(`[Cacatoo warning] Module 'fs' is not installed. Cannot write to \'${filename}\'. Please run 'npm install fs'`); return }
            fs.appendFileSync(filename, text);
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
                console.log("Sorry, writing grid files currently works in NODEJS mode only.");
            }
            return
        }
        else {
            const fs = require('fs');
            let string = "";
            for(let i =0; i<model.nc;i++){                
                for(let j=0;j<model.nr;j++){
                    let prop = model.grid[i][j][property] ? model.grid[i][j][property] : -1;
                    string += [i,j,prop].join('\t')+'\n';
                }                                       
            }
            fs.appendFileSync(filename, string);            
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
        let imageLoader = document.createElement("input");
        imageLoader.type = "file";
        imageLoader.id = "imageLoader";
        let sim = this;
        imageLoader.style = "display:none";
        imageLoader.name = "imageLoader";
        document.getElementById("form_holder").appendChild(imageLoader);
        let label = document.createElement("label");
        label.setAttribute("for", "imageLoader");
        label.style = "background-color: rgb(217, 234, 245);border-radius: 10px;border: 2px solid rgb(177, 209, 231);padding:7px;font-size:12px;margin:10px;width:128px;";
        label.innerHTML = "<font size=2>Select your own initial state</font>";
        document.getElementById("form_holder").appendChild(label);
        let canvas = document.createElement('canvas');
        canvas.name = "imageCanvas";
        let ctx = canvas.getContext('2d');
        function handleImage(e) {
            let reader = new FileReader();
            let grid_data;

            let grid = e.currentTarget.grid;
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    grid_data = get2DFromCanvas(canvas);

                    for (let i = 0; i < grid.nc; i++) for (let j = 0; j < grid.nr; j++) grid.grid[i][j].alive = 0;
                    for (let i = 0; i < grid_data[0].length; i++)          // i are columns
                        for (let j = 0; j < grid_data.length; j++)             // j are rows
                        {
                            grid.grid[Math.floor(i + grid.nc / 2 - img.width / 2)][Math.floor(j + grid.nr / 2 - img.height / 2)][property] = grid_data[j][i];
                        }
                    sim.display();

                };
                img.src = event.target.result;

            };
            reader.readAsDataURL(e.target.files[0]);
            document.getElementById("imageLoader").value = "";
        }
        imageLoader.addEventListener('change', handleImage, false);
        imageLoader.grid = targetgrid;    // Bind a grid to imageLoader 
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
        let checkpointLoader = document.createElement("input");
        checkpointLoader.type = "file";
        checkpointLoader.id = "checkpointLoader";
        let sim = this;
        checkpointLoader.style = "display:none";
        checkpointLoader.name = "checkpointLoader";
        document.getElementById("form_holder").appendChild(checkpointLoader);
        let label = document.createElement("label");
        label.setAttribute("for", "checkpointLoader");
        label.style = "background-color: rgb(217, 234, 245);border-radius: 10px;border: 2px solid rgb(177, 209, 231);padding:7px;font-size:11px;margin:10px;width:128px;";
        label.innerHTML = "Reload from checkpoint";
        document.getElementById("form_holder").appendChild(label);

        checkpointLoader.addEventListener('change', function()
        {
            let file_to_read = document.getElementById("checkpointLoader").files[0];
            let name = document.getElementById("checkpointLoader").files[0].name;
            let fileread = new FileReader();
            console.log(`Reloading simulation from checkpoint-file \'${name}\'`);
            fileread.onload = function(e) {
              let content = e.target.result;
              let grid_json = JSON.parse(content); // parse json
              console.log(grid_json);  
              let model = sim[target_model];

              model.clearGrid();
              model.grid_from_json(grid_json);   
              sim.display();           
            };
            fileread.readAsText(file_to_read);
        });
        
    }

    /**
     *  initialPattern takes a @GridModel and loads a pattern from a PNG file. Note that this
     *  will only work when Cacatoo is ran on a server due to security issues. If you want to
     *  use this feature locally, there are plugins for most browser to host a simple local
     *  webserver. 
     *  (currently only supports black and white image)
     */
    initialPattern(grid, property, image_path, x, y) {
        let sim = this;
        if (typeof window != undefined) {
            for (let i = 0; i < grid.nc; i++) for (let j = 0; j < grid.nr; j++) grid.grid[i][j][property] = 0;
            let tempcanv = document.createElement("canvas");
            let tempctx = tempcanv.getContext('2d');
            var tempimg = new Image();
            tempimg.onload = function () {
                tempcanv.width = tempimg.width;
                tempcanv.height = tempimg.height;
                tempctx.drawImage(tempimg, 0, 0);
                let grid_data = get2DFromCanvas(tempcanv);
                if (x + tempimg.width >= grid.nc || y + tempimg.height >= grid.nr) throw RangeError("Cannot place pattern outside of the canvas")
                for (let i = 0; i < grid_data[0].length; i++)         // i are columns
                    for (let j = 0; j < grid_data.length; j++)     // j are rows
                    {
                        grid.grid[x + i][y + j][property] = grid_data[j][i];
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
        if (!this.pause) this.start();
    }
        
    /**
     *  colourRamp interpolates between two arrays to get a smooth colour scale. 
     *  @param {array} arr1 Array of R,G,B values to start fromtargetgrid The gridmodel containing the grid to be modified. 
     *  @param {array} arr2 Array of R,B,B values to transition towards
     *  @param {integer} n number of steps taken
     *  @return {dict} A dictionary (i.e. named JS object) of colours
     */
    colourRamp(arr1, arr2, n) {
        let return_dict = {};
        for (let i = 0; i < n; i++) {

            return_dict[i] = [Math.floor(arr1[0] + arr2[0] * (i / n)),
            Math.floor(arr1[1] + arr2[1] * (i / n)),
            Math.floor(arr1[2] + arr2[2] * (i / n))];
        }
        return return_dict
    }
}


/**
* Below are a few global functions that are used by Simulation classes, but not a method of a Simulation instance per se
*/


//Delay for a number of milliseconds
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve, timeoutMsec));

/**
 *  Reconstruct a 2D array based on a canvas 
 *  @param {canvas} canvas HTML canvas element to convert to a 2D grid for Cacatoo
 *  @return {2DArray} Returns a 2D array (i.e. a grid) with the states
 */
function get2DFromCanvas(canvas) {
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');
    let img1 = ctx.getImageData(0, 0, width, height);
    let binary = new Array(img1.data.length);
    let idx = 0;
    for (var i = 0; i < img1.data.length; i += 4) {
        let num = [img1.data[i], img1.data[i + 1], img1.data[i + 2]];
        let state;
        if (JSON.stringify(num) == JSON.stringify([0, 0, 0])) state = 0;
        else if (JSON.stringify(num) == JSON.stringify([255, 255, 255])) state = 1;
        else if (JSON.stringify(num) == JSON.stringify([255, 0, 0])) state = 2;
        else if (JSON.stringify(num) == JSON.stringify([0, 0, 255])) state = 3;
        else throw RangeError("Colour in your pattern does not exist in Cacatoo")
        binary[idx] = state;
        idx++;
    }

    const arr2D = [];
    let rows = 0;
    while (rows < height) {
        arr2D.push(binary.splice(0, width));
        rows++;
    }
    return arr2D
}


    try
    {
        module.exports = Simulation;
    }
    catch(err)
    {
        // do nothing
    }
