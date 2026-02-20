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
        let graph_opts = {title: this.title,                
            showRoller: false,                
            width: opts ? (opts.width != undefined ? opts.width : 500) : 500,
            labelsSeparateLines: true,
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
        };                
        for(var opt in opts){
            graph_opts[opt] = opts[opt];
        }
        this.g = new Dygraph(this.elem, this.data, graph_opts);
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
    var result;
    if(hex.length == 7) {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    }
    if(hex.length == 9) {
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)]
    }
    
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
 *  Deep copy function.
 *  @param {Object} aObject Object to be deep copied. This function still won't deep copy every possible object, so when enabling deep copying, make sure you put your debug-hat on!
 */
function copy(aObject) {
    if (!aObject) {
      return aObject;
    }
  
    let v;
    let bObject = Array.isArray(aObject) ? [] : {};
    for (const k in aObject) {
      v = aObject[k];
      bObject[k] = (typeof v === "object") ? copy(v) : v;
    }
  
    return bObject;
  }

/**
 *  Gridmodel is the main type of model in Cacatoo. Most of these models
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
    constructor(name, config={}, rng) {
        this.name = name;
        this.time = 0;
        this.nc = config.ncol || 200;
        this.nr = config.nrow || 200;
        this.grid = MakeGrid(this.nc, this.nr);       // Initialises an (empty) grid
        this.grid_buffer = MakeGrid(this.nc, this.nr);       // Initialises an (empty) grid
        this.wrap = config.wrap || [true, true];
        this.rng = rng;
        this.random = () => { return this.rng.random()};
        this.randomInt = (a,b) => { return this.rng.randomInt(a,b)};                
        this.statecolours = this.setupColours(config.statecolours,config.num_colours); // Makes sure the statecolours in the config dict are parsed (see below)

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
        for(let x in gridjson)
            for(let y in gridjson[x])
            {
                let newgp = new Gridpoint(gridjson[x][y]);
                gridjson[x][y] = newgp;
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
            else if (statedict == 'rainbow') {
                let colours = this.colourGradientArray(num_colours, 0,[251, 169, 73], [250, 228, 66], [139, 212, 72], [42, 168, 242], 
                             [50,100,255]); 
                return_dict[statekey] = colours;                
            }
            else if (statedict == 'pride') {
                let colours = this.colourGradientArray(num_colours, 0,[228, 3, 3], [255, 140, 0], [255, 237, 0], [0, 128, 38], [0,76,255],[115,41,130]); 
                return_dict[statekey] = colours;                
            }
            else if (statedict == 'inferno_rev') {
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
                color_dict[Math.floor(i + arr * segment_len + total)] = [Math.min(r,255), Math.min(g,255), Math.min(b,255)];
                total_added_colours++;
                if(total_added_colours == n) break
            }
            color_dict[n] = arguments[arguments.length-1];
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
    * @param {int} x Position of grid point to update (column)
    * @param {int} y Position of grid point to update (row)
    */
    nextState(x, y) {
        throw 'Nextstate function of \'' + this.name + '\' undefined';
    }

    /** Synchronously apply the nextState function (defined by user) to the entire grid
     *  Synchronous means that all grid points will be updated simultaneously. This is ensured
     *  by making a back-up grid, which will serve as a reference to know the state in the previous
     *  time step. First all grid points are updated based on the back-up. Only then will the 
     *  actual grid be changed. 
    */
    synchronous() {
        let oldstate = MakeGrid(this.nc, this.nr, this.grid);  // Create a copy of the current grid
        let newstate = MakeGrid(this.nc, this.nr);            // Create an empty grid for the next state
    
        for (let x = 0; x < this.nc; x++) {
            for (let y = 0; y < this.nr; y++) {
                this.nextState(x, y);                  // Update this.grid[x][y]
                newstate[x][y] = this.grid[x][y];      // Store new state in newstate
                this.grid[x][y] = oldstate[x][y];      // Restore original state
            }
        }
        
        this.grid = newstate;  // Replace the current grid with the newly computed one
    }
    
   
    
    
    
    

    /** Like the synchronous function above, but can not take a custom user-defined function rather
     *  than the default next-state function. Technically one should be able to refarctor this by making
     *  the default function of synchronous "nextstate". But this works. :)
    */
    apply_sync(func) {
        let oldstate = MakeGrid(this.nc, this.nr, this.grid);   // Old state based on current grid
        let newstate = MakeGrid(this.nc, this.nr);              // New state == empty grid
        for (let x = 0; x < this.nc; x++) {
            for (let y = 0; y < this.nr; y++) {
                func(x, y);                                      // Update this.grid
                newstate[x][y] = this.grid[x][y];                // Set this.grid to newstate
                this.grid[x][y] = oldstate[x][y];                // Reset this.grid to old state
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
            let x = m % this.nc;
            let y = Math.floor(m / this.nc);
            this.nextState(x, y);
        }
        // Don't have to copy the grid here. Just cycle through x,y in random order and apply nextState :)
    }

    /** Analogous to apply_sync(func), but asynchronous */
    apply_async(func) {
        this.set_update_order();
        for (let n = 0; n < this.nc * this.nr; n++) {
            let m = this.upd_order[n];
            let x = m % this.nc;
            let y = Math.floor(m / this.nc);
            func(x, y);
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

    /** Get the gridpoint at coordinates x,y 
     *  Makes sure wrapping is applied if necessary
     *  @param {int} xpos position (column) for the focal gridpoint
     *  @param {int} ypos position (row) for the focal gridpoint
     */
     getGridpoint(xpos, ypos) {
        let x = xpos;
        if (this.wrap[0]) x = (xpos + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = ypos;
        if (this.wrap[1]) y = (ypos + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) return undefined                      // If sampling neighbour outside of the grid, return empty object
        else return this.grid[x][y]
    }

    /** Change the gridpoint at position x,y into gp (typically retrieved with 'getGridpoint')
         *  Makes sure wrapping is applied if necessary
         *  @param {int} x position (column) for the focal gridpoint
         *  @param {int} y position (row) for the focal gridpoint
         *  @param {Gridpoint} @Gridpoint object to set the gp to (result of 'getGridpoint')
    */
    setGridpoint(xpos, ypos, gp) {
        let x = xpos;
        if (this.wrap[0]) x = (xpos + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = ypos;
        if (this.wrap[1]) y = (ypos + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) this.grid[x][y] = undefined;    
        else this.grid[x][y] = gp;
    }

    /** Return a copy of the gridpoint at position x,y
         *  Makes sure wrapping is applied if necessary
         *  @param {int} x position (column) for the focal gridpoint
         *  @param {int} y position (row) for the focal gridpoint
    */
     copyGridpoint(xpos, ypos) {
        let x = xpos;
        if (this.wrap[0]) x = (xpos + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = ypos;
        if (this.wrap[1]) y = (ypos + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) return undefined    
        else {
            return new Gridpoint(this.grid[x][y])
        }
    }

    /** Change the gridpoint at position x,y into gp
         *  Makes sure wrapping is applied if necessary
         *  @param {int} x position (column) for the focal gridpoint
         *  @param {int} y position (row) for the focal gridpoint
         *  @param {Gridpoint} @Gridpoint object to set the gp to
    */
     copyIntoGridpoint(xpos, ypos, gp) {
        let x = xpos;
        if (this.wrap[0]) x = (xpos + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = ypos;
        if (this.wrap[1]) y = (ypos + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
           
        if (x < 0 || y < 0 || x >= this.nc || y >= this.nr) this.grid[x][y] = undefined;    
        else {
            for (var prop in gp)
                this.grid[x][y][prop] = gp[prop];
        }
    }

    /** Get the x,y coordinates of a neighbour in an array. 
     *  Makes sure wrapping is applied if necessary
     */
    getNeighXY(xpos, ypos) {
        let x = xpos;
        if (this.wrap[0]) x = (xpos + this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = ypos;
        if (this.wrap[1]) y = (ypos + this.nr) % this.nr;                         // Wraps neighbours top-to-bottom

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
            let x = model.moore[direction][0];
            let y = model.moore[direction][1];
            return model.getGridpoint(col + x, row + y)
    }

    /** Get array of grid points with val in property (Neu4, Neu5, Moore8, Moore9 depending on range-array)
    *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
    *  but can be mixed to make grids interact.
    *  @param {int} col position (column) for the focal gridpoint
    *  @param {int} row position (row) for the focal gridpoint
    *  @param {Array} range which section of the neighbourhood must be counted? (see this.moore, e.g. 1-8 is Moore8, 0-4 is Neu5,etc)
    *  To get all 8 neighbours, use range [1,8]
    *  To get all neumann neighbours, use range [1,4]
    */
   getAllNeighbours(model,col,row,range) {
        let gps = [];
        for (let n = range[0]; n <= range[1]; n++) {                        
            let x = model.moore[n][0];
            let y = model.moore[n][1];
            let neigh = model.getGridpoint(col + x, row + y);
            gps.push(neigh);
        }
        return gps;
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
            let x = model.moore[n][0];
            let y = model.moore[n][1];
            let neigh = model.getGridpoint(col + x, row + y);
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
        let randomnr = this.rng.genrand_real2() * sum_property;                // Sample a randomnr between 0 and sum_property        
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
            let x = model.moore[n][0];
            let y = model.moore[n][1];
            let gp = model.getGridpoint(col + x, row + y);
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
            let x = model.moore[n][0];
            let y = model.moore[n][1];
            let neigh = model.getGridpoint(col + x, row + y);
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
        let x = this.moore[rand][0];
        let y = this.moore[rand][1];
        let neigh = grid.getGridpoint(col + x, row + y);
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

        for (let x = 0; x < this.nc; x += 1) // every column
        {           
            for (let y = 0; y < this.nr; y += 1) // every row
            {                
                for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                {                    
                    let moore = this.moore[n];
                    let xy = this.getNeighXY(x + moore[0], y + moore[1]);
                    if (typeof xy == "undefined") continue
                    let neigh = this.grid[xy[0]][xy[1]];
                    newstate[x][y][state] += neigh[state] * rate;
                    newstate[xy[0]][xy[1]][state] -= neigh[state] * rate;
                }
            }
        }
        for (let x = 0; x < this.nc; x += 1) // every column
            for (let y = 0; y < this.nr; y += 1) // every row
                this.grid[x][y][state] = newstate[x][y][state];
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

        for (let x = 0; x < this.nc; x += 1) // every column
            for (let y = 0; y < this.nr; y += 1) // every row
            {
                newstate[x][y][statevector] = Array(this.grid[x][y][statevector].length).fill(0);
                for (let n = 1; n <= 4; n++)
                    for(let state of Object.keys(this.grid[x][y][statevector]))
                        newstate[x][y][statevector][state] = this.grid[x][y][statevector][state];
            }
        
        for (let x = 0; x < this.nc; x += 1) // every column
        {           
            for (let y = 0; y < this.nr; y += 1) // every row
            {                
                for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                {                    
                    let moore = this.moore[n];
                    let xy = this.getNeighXY(x + moore[0], y + moore[1]);
                    if (typeof xy == "undefined") continue
                    let neigh = this.grid[xy[0]][xy[1]];
                    for(let state of Object.keys(this.grid[x][y][statevector]))
                    {
                        newstate[x][y][statevector][state] += neigh[statevector][state] * rate;
                        newstate[xy[0]][xy[1]][statevector][state] -= neigh[statevector][state] * rate;
                    }
                }
            }
        }
        
        for (let x = 0; x < this.nc; x += 1) // every column
            for (let y = 0; y < this.nr; y += 1) // every row
                for (let n = 1; n <= 4; n++)
                    for(let state of Object.keys(this.grid[x][y][statevector]))
                        this.grid[x][y][statevector][state] = newstate[x][y][statevector][state];

    }

    /** Diffuse ODE states on the grid. Because ODEs are stored by reference inside gridpoint, the 
     *  states of the ODEs have to be first stored (copied) into a 4D array (x,y,ODE,state-vector), 
     *  which is then used to update the grid.
     */
    diffuseODEstates() {
        let newstates_2 = CopyGridODEs(this.nc, this.nr, this.grid);    // Generates a 4D array of [x][y][o][s] (x-coord,y-coord,relevant ode,state-vector)    

        for (let x = 0; x < this.nc; x += 1) // every column
        {
            for (let y = 0; y < this.nr; y += 1) // every row
            {
                for (let o = 0; o < this.grid[x][y].ODEs.length; o++) // every ode
                {
                    for (let s = 0; s < this.grid[x][y].ODEs[o].state.length; s++) // every state
                    {
                        let rate = this.grid[x][y].ODEs[o].diff_rates[s];
                        let sum_in = 0.0;
                        for (let n = 1; n <= 4; n++)   // Every neighbour (neumann)
                        {
                            let moore = this.moore[n];
                            let xy = this.getNeighXY(x + moore[0], y + moore[1]);
                            if (typeof xy == "undefined") continue
                            let neigh = this.grid[xy[0]][xy[1]];
                            sum_in += neigh.ODEs[o].state[s] * rate;
                            newstates_2[xy[0]][xy[1]][o][s] -= neigh.ODEs[o].state[s] * rate;
                        }
                        newstates_2[x][y][o][s] += sum_in;
                    }
                }
            }
        }

        for (let x = 0; x < this.nc; x += 1) // every column
            for (let y = 0; y < this.nr; y += 1) // every row
                for (let o = 0; o < this.grid[x][y].ODEs.length; o++)
                    for (let s = 0; s < this.grid[x][y].ODEs[o].state.length; s++)
                        this.grid[x][y].ODEs[o].state[s] = newstates_2[x][y][o][s];

    }

    /** Assign each gridpoint a new random position on the grid. This simulated mixing,
     *  but does not guarantee a "well-mixed" system per se (interactions are still local)
     *  calculated based on neighbourhoods. 
     */
    perfectMix() {
        let all_gridpoints = [];
        for (let x = 0; x < this.nc; x++)
            for (let y = 0; y < this.nr; y++)
                all_gridpoints.push(this.getGridpoint(x, y));

        all_gridpoints = shuffle(all_gridpoints, this.rng);

        for (let x = 0; x < all_gridpoints.length; x++)
            this.setGridpoint(x % this.nc, Math.floor(x / this.nc), all_gridpoints[x]);
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
        let x_off = this.wrap[0] ? 1 : 2;
        let y_off = this.wrap[1] ? 1 : 2;
        for (let x = 0 + even; x < this.nc; x += 2) {
            if(x> this.nc-x_off) continue
            for (let y = 0 + even; y < this.nr; y += 2) {
                if(y> this.nr-y_off) continue
                let old_A = new Gridpoint(this.grid[x][y]);
                let A = this.getGridpoint(x, y);
                let B = this.getGridpoint(x + 1, y);
                let C = this.getGridpoint(x + 1, y + 1);
                let D = this.getGridpoint(x, y + 1);
                
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
                this.setGridpoint(x, y, A);
                this.setGridpoint(x + 1, y, B);
                this.setGridpoint(x + 1, y + 1, C);
                this.setGridpoint(x, y + 1, D);
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
        let graph_labels = Array.from({length: graph_values.length}, (v, i) => 'sample'+(i+1));
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
        for (let x = 0; x < this.nc; x++) {
            for (let y = 0; y < this.nr; y++) {
                for (let val in values)
                    if (this.grid[x][y][property] == values[val]) sum[val]++;
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
        for (let x = 0; x < this.nc; x++)
            for (let y = 0; y < this.nr; y++)
                for (let val in values)
                    sum[val] += this.grid[x][y][odename].state[val] / (this.nc * this.nr);
        return sum;
    }



    /** 
     *  Attaches an ODE to all GPs in the model. Each gridpoint has it's own ODE.
     *  @param {function} eq Function that describes the ODEs, see examples starting with "ode"
     *  @param {Object} conf dictionary style configuration of your ODEs (initial state, parameters, etc.)
    */
    attachODE(eq, conf) {
        for (let x = 0; x < this.nc; x++) {
            for (let y = 0; y < this.nr; y++) {
                let ode = new ODE(eq, conf.init_states, conf.parameters, conf.diffusion_rates, conf.ode_name, conf.acceptable_error);
                if (typeof this.grid[x][y].ODEs == "undefined") this.grid[x][y].ODEs = [];   // If list doesnt exist yet                
                this.grid[x][y].ODEs.push(ode);
                if (conf.ode_name) this.grid[x][y][conf.ode_name] = ode;
            }
        }
    }

    /** 
     *  Numerically solve the ODEs for each grid point
     *  @param {float} delta_t Step size
     *  @param {bool} opt_pos When enabled, negative values are set to 0 automatically
    */
    solveAllODEs(delta_t = 0.1, opt_pos = false) {
        for (let x = 0; x < this.nc; x++) {
            for (let y = 0; y < this.nr; y++) {
                for (let ode of this.grid[x][y].ODEs) {
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
        for (let x = 0; x < ncol; x++){
            grid[x] = new Array(ncol);          // Insert a row of <cols> long   --> grid[cols][rows]
            for (let y = 0; y < nrow; y++){
                grid[x][y] = this.grid[x][y][property];
            }
        }
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
    for (let x = 0; x < cols; x++) {
        grid[x] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let y = 0; y < rows; y++) {
            if (template) grid[x][y] = new Gridpoint(template[x][y]);  // Make a deep or shallow copy of the GP 
            else grid[x][y] = new Gridpoint();
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
    for (let x = 0; x < cols; x++) {
        grid[x] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for (let y = 0; y < rows; y++) {
            for (let o = 0; o < template[x][y].ODEs.length; o++) // every ode
            {
                grid[x][y] = [];
                let states = [];
                for (let s = 0; s < template[x][y].ODEs[o].state.length; s++) // every state
                    states.push(template[x][y].ODEs[o].state[s]);
                grid[x][y][o] = states;
            }
        }
    }

    return grid;
};

/**
 *  Quadtrees is a hierarchical data structure to quickly look up boids in flocking models to speed up the simulation
 */

class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;    // Object with x, y coordinates and a width (w) and height (h)
        this.capacity = capacity;    // How many boids fit in this Quadrant until it divides in 4 more quadrants
        this.points = [];            // Points contain the boids (object with x and y position)
        this.divided = false;        // Boolean to check if this Quadrant is futher divided
    }

    // Method to subdivide the current Quadtree into four equal quadrants
    subdivide() {
        let {x,y,w,h} = this.boundary;
        let nw = { x: x-w/4, y: y-h/4, w: w/2, h: h/2 };
        let ne = { x: x+w/4, y: y-h/4, w: w/2, h: h/2 };
        let sw = { x: x-w/4, y: y+h/4, w: w/2, h: h/2 };
        let se = { x: x+w/4, y: y+h/4, w: w/2, h: h/2 };

        this.northwest = new QuadTree(nw, this.capacity);
        this.northeast = new QuadTree(ne, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);

        this.divided = true; // Subdivisions are not divided when spawned, but this one is.
    }

    // Insert a point into the quadtree to query it later (! recursive)
    insert(point) {
        // If this point doesn't belong here, return false
        if (!this.contains(this.boundary, point.position)) {
            return false
        }

        // If the capacity is not yet reached, add the point and return true
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        // Capacity is reached, divide the quadrant
        if (!this.divided) {
            this.subdivide();
        }

        // Try and insert in one of the subquadrants, and return true if one is succesful (here is the recursion)
        if (this.northwest.insert(point) || this.northeast.insert(point) ||
            this.southwest.insert(point) || this.southeast.insert(point)) {
            return true
        }

        return false
    }

    // Test if a point is within a rectangle
    contains(rect, point) {
        return !(point.x < rect.x - rect.w/2 || point.x > rect.x + rect.w/2 ||
                 point.y < rect.y - rect.h/2 || point.y > rect.y + rect.h/2)
    }

    // Query, another recursive function
    query(range, found) {
        // If there are no points yet, make a list of points
        if (!found) found = [];  

        // If it doesn't intersect, return whatever was found so far and move on
        if (!this.intersects(this.boundary, range)) {
            return found
        }

        // Check for all points if it is in this quadtree (could also be in one of the children QTs!)
        for (let p of this.points) {
            if (this.contains(range, p.position)) {
                found.push(p);
            }
        }

        // Test the children QTs too (here is the recursion!)
        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }
        // Done, return everything that was found. 
        return found;
    }

    // Check if two rectangles are intersecting (usually query rectangle vs quadtree boundary)
    intersects(rect1, rect2) {
        return !(rect2.x - rect2.w / 2 > rect1.x + rect1.w / 2 ||
                 rect2.x + rect2.w / 2 < rect1.x - rect1.w / 2 ||
                 rect2.y - rect2.h / 2 > rect1.y + rect1.h / 2 ||
                 rect2.y + rect2.h / 2 < rect1.y - rect1.h / 2);
    }

    // Draw the qt on the provided ctx
    draw(ctx,scale,col) {
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.boundary.x*scale - this.boundary.w*scale / 2, this.boundary.y*scale - this.boundary.h*scale / 2, this.boundary.w*scale, this.boundary.h*scale);

        if (this.divided) {
            this.northwest.draw(ctx,scale);
            this.northeast.draw(ctx,scale);
            this.southwest.draw(ctx,scale);
            this.southeast.draw(ctx,scale);
        }
    }
}

/**
 *  Flockmodel is the second modeltype in Cacatoo, which uses Boids that can interact with a @Gridmodel
 */

class Flockmodel {
    /**
    *  The constructor function for a @Flockmodl object. Takes the same config dictionary as used in @Simulation
    *  @param {string} name The name of your model. This is how it will be listed in @Simulation 's properties
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo GridModel. 
    *  @param {MersenneTwister} rng A random number generator (MersenneTwister object)
    */
    constructor(name, config={}, rng) {
        this.name = name;
        this.config = config;
        this.time = 0;
        this.draw = true;
        this.max_force = config.max_force || 1;
        this.max_speed = config.max_speed || 1;
        this.width =  config.width || config.ncol ||600;
        this.height =  config.height ||config.nrow || 600;
        this.scale = config.scale || 1;
        this.shape = config.shape || 'dot';
        this.click = config.click || 'none';
        this.follow_mouse = config.follow_mouse;
        this.init_velocity = config.init_velocity || 0.1;
        this.rng = rng;
        this.random = () => { return this.rng.random()};
        this.randomInt = (a,b) => { return this.rng.randomInt(a,b)};        
        
        this.wrap = config.wrap || [true, true];
        
        this.wrapreflect = 1;
        if(config.wrapreflect) this.wrapreflect = config.wrapreflect;

        this.graph_update = config.graph_update || 20;
        this.graph_interval = config.graph_interval || 2;
        this.bgcolour = config.bgcolour || undefined;
        this.physics = (config.physics === false) ? false : true;
        
        this.statecolours = {};
        if(config.statecolours) this.statecolours = this.setupColours(config.statecolours,config.num_colours||100); // Makes sure the statecolours in the config dict are parsed (see below)
        if(!config.qt_capacity) config.qt_capacity = 3;
        this.graphs = {};                // Object containing all graphs belonging to this model (HTML usage only)
        this.canvases = {};              // Object containing all Canvases belonging to this model (HTML usage only)

        // Flocking stuff
        let radius_alignment = this.config.alignment ? this.config.alignment.radius : 0;
        let radius_cohesion = this.config.cohesion ? this.config.cohesion.radius : 0;
        let radius_separation = this.config.separation ? this.config.separation.radius : 0;
       
        this.neighbourhood_radius = Math.max(radius_alignment,radius_cohesion,radius_separation);
        this.friction = this.config.friction;
        this.mouse_radius = this.config.mouse_radius || 100;
        this.mousecoords = {x:-1000,y:-1000};
        this.boids = [];
        this.mouseboids = [];
        this.obstacles = [];

        this.populateSpot();
        this.build_quadtree();

    }

    build_quadtree(){
        let boundary = { x: this.width/2, y: this.height/2, w: this.width, h: this.height };
        this.qt = new QuadTree(boundary, this.config.qt_capacity);
        for (let boid of this.boids) {
            this.qt.insert(boid);
        }
    }

    /**
     * Populates the space with individuals in a certain radius from the center
     */
    populateSpot(num,put_x,put_y,s){
        let n = num || this.config.num_boids; 
        let size = s || this.width/2;
        let x = put_x || this.width/2;
        let y = put_y || this.height/2;
        
        for (let i = 0; i < n; i++) {
            // Random direction
            let angle = this.random() * 2 * Math.PI;

            // Unit direction vector
            let ux = Math.cos(angle);
            let uy = Math.sin(angle);

            // Exact initial speed (constant for all boids)
            let speed = this.init_velocity;

            this.boids.push({
                position: {
                    x: x + size - 2 * this.random() * size,
                    y: y + size - 2 * this.random() * size
                },
                velocity: {
                    x: ux * speed,
                    y: uy * speed
                },
                acceleration: { x: 0, y: 0 },
                size: this.config.size
            });
            
        }

        
    }

    copyBoid(boid){
        return copy(boid)
    }
    
    /** TODO
    *  Saves the current flock a JSON object 
    *  @param {string} filename The name of of the JSON file
    */
    save_flock(filename) 
    {      
        
    }

    /**
    *  Reads a JSON file and loads a JSON object onto this flockmodel. Reading a local JSON file will not work in browser.
    *  Gridmodels 'addCheckpointButton' instead, which may be implemented for flocks at a later stage.
    *  @param {string} file Path to the json file
    */
    load_flock(file)
    {
        
    }

    /** Initiate a dictionary with colour arrays [R,G,B] used by Graph and Canvas classes
    *   @param {statecols} object - given object can be in two forms
    *                             | either {state:colour} tuple (e.g. 'alive':'white', see gol.html) 
    *                             | or {state:object} where objects are {val:'colour},
    *                             | e.g.  {'species':{0:"black", 1:"#DDDDDD", 2:"red"}}, see cheater.html 
    */
    setupColours(statecols,num_colours=18) {
        let return_dict = {};
        
        if (statecols == null){           // If the user did not define statecols (yet)
            return return_dict["state"] = default_colours(num_colours)
        }
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
            else if (statedict == 'rainbow') {
                let colours = this.colourGradientArray(num_colours, 0,[251, 169, 73], [250, 228, 66], [139, 212, 72], [42, 168, 242], 
                             [50,100,255]); 
                return_dict[statekey] = colours;                
            }
            else if (statedict == 'pride') {
                let colours = this.colourGradientArray(num_colours, 0,[228, 3, 3], [255, 140, 0], [255, 237, 0], [0, 128, 38], [0,76,255],[115,41,130]); 
                return_dict[statekey] = colours;                
            }
            else if (statedict == 'inferno_rev') {
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

     /** Flocking of individuals, based on X, Y, Z (TODO)
    * @param {Object} i The individual to be updates
    */
    flock(){
        if(this.physics) this.applyPhysics();
        this.updatePositions();
        this.boundariesAndObstacles();
        this.build_quadtree();
    }
    
    calculateAlignment(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 };
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                steering.x += neighbour.velocity.x;
                steering.y += neighbour.velocity.y;
            }
            steering.x /= neighbours.length;
            steering.y /= neighbours.length;
            steering = this.normaliseVector(steering);
            steering.x *= max_speed;
            steering.y *= max_speed;
            steering.x -= boid.velocity.x;
            steering.y -= boid.velocity.y;
        }
        return steering;
    }

    calculateSeparation(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 };
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                let dx = boid.position.x - neighbour.position.x;
                let dy = boid.position.y - neighbour.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.config.separation.radius) {
                    let difference = { x: dx, y: dy };
                    difference = this.normaliseVector(difference);
                    steering.x += difference.x ;
                    steering.y += difference.y ;
                }
            }
            if (steering.x !== 0 || steering.y !== 0) {
                steering.x /= neighbours.length;
                steering.y /= neighbours.length;
                steering = this.normaliseVector(steering);
                steering.x *= max_speed;
                steering.y *= max_speed;
                steering.x -= boid.velocity.x;
                steering.y -= boid.velocity.y;
            }
        }
        return steering;
    }

    calculateCohesion(boid, neighbours, max_speed) {
        let steering = { x: 0, y: 0 };
        if (neighbours.length > 0) {
            let centerOfMass = { x: 0, y: 0 };
            for (let neighbour of neighbours) {
                let dx = neighbour.position.x - boid.position.x;
                let dy = neighbour.position.y - boid.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                centerOfMass.x += boid.position.x + dx;
                centerOfMass.y += boid.position.y + dy;
            }
            centerOfMass.x /= neighbours.length;
            centerOfMass.y /= neighbours.length;
            steering.x = centerOfMass.x - boid.position.x;
            steering.y = centerOfMass.y - boid.position.y;
            steering = this.normaliseVector(steering);
            steering.x *= max_speed;
            steering.y *= max_speed;
            steering.x -= boid.velocity.x;
            steering.y -= boid.velocity.y;
        }
        return steering;
    }

    calculateCollision(boid, neighbours,max_force) {
        let steering = { x: 0, y: 0 };
        
        if (neighbours.length > 0) {
            for (let neighbour of neighbours) {
                if(neighbour == boid) continue
                if(boid.ignore && boid.ignore.includes(neighbour)) continue
                let dx = boid.position.x - neighbour.position.x;
                let dy = boid.position.y - neighbour.position.y;

                // Adjust for wrapping in the x direction
                if (Math.abs(dx) > this.width / 2) {
                    dx = dx - Math.sign(dx) * this.width;
                }

                // Adjust for wrapping in the y direction
                if (Math.abs(dy) > this.height / 2) {
                    dy = dy - Math.sign(dy) * this.height;
                }

                let difference = { x: dx, y: dy };
                difference = this.normaliseVector(difference);
                steering.x += difference.x;
                steering.y += difference.y;
                
            }
            if (steering.x !== 0 || steering.y !== 0) {
                steering.x /= neighbours.length;
                steering.y /= neighbours.length;
                steering = this.normaliseVector(steering);
                steering.x *= max_force;
                steering.y *= max_force;
                steering.x -= boid.velocity.x;
                steering.y -= boid.velocity.y;
            }
        }
        boid.overlapping = neighbours.length>1;       
        return steering;
    }

    followMouse(boid){
        if(this.mousecoords.x == -1000) return
        let dx = boid.position.x - this.mousecoords.x;
        let dy = boid.position.y - this.mousecoords.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 0) { // Ensure we don't divide by zero
            boid.velocity.x += (dx / distance) * this.config.mouseattraction * this.max_force * -1;
            boid.velocity.y += (dy / distance) * this.config.mouseattraction * this.max_force * -1;
        }
    }

    steerTowards(boid,x,y,strength){
        let dx = boid.position.x - x;
        let dy = boid.position.y - y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 0) { // Ensure we don't divide by zero
            boid.velocity.x += (dx / distance) * strength * this.max_force * -1;
            boid.velocity.y += (dy / distance) * strength * this.max_force * -1;
        }
    }

    dist(obj1,obj2){
        let dx = obj1.x - obj2.x;
        let dy = obj1.y - obj2.y;
        return(Math.sqrt(dx*dx + dy*dy))
    }

    updatePositions(){
        for(let i = 0; i<this.boids.length; i++){
            let boid = this.boids[i];
            let max_speed = this.max_speed;
            let max_force = this.max_force;
            let brownian = this.config.brownian ?? 0.0;
            let friction = this.friction;
            if(boid.locked) continue
            
            if(boid.max_speed !== undefined) max_speed = boid.max_speed;
            if(boid.max_force !== undefined) max_force = boid.max_force;
            
            // Limit the force applied to the boid
            let accLength = Math.sqrt(boid.acceleration.x * boid.acceleration.x + boid.acceleration.y * boid.acceleration.y);
            if (accLength > max_force) {
                boid.acceleration.x = (boid.acceleration.x / accLength) * max_force;
                boid.acceleration.y = (boid.acceleration.y / accLength) * max_force;
            }

            // Update velocity
            boid.velocity.x += boid.acceleration.x;
            boid.velocity.y += boid.acceleration.y; 
            
            // Limit speed
            let speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y);
            if (speed > max_speed) {
                boid.velocity.x = (boid.velocity.x / speed) * max_speed;
                boid.velocity.y = (boid.velocity.y / speed) * max_speed;
            }
            speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y);

            // Update position
            boid.position.x += boid.velocity.x;
            boid.position.y += boid.velocity.y;

            
            // Apply friction (linear, so no drag)
            boid.velocity.x *= (1-friction);
            boid.velocity.y *= (1-friction);
            
            // Brownian motion
            boid.velocity.x+=brownian*(2*this.rng.random()-1);
            boid.velocity.y+=brownian*(2*this.rng.random()-1);

            

            // Reset acceleration
            boid.acceleration.x = 0;
            boid.acceleration.y = 0;
        
        }
    }

    boundariesAndObstacles() {
    for (let boid of this.boids) {

        // Check obstacles first
        for (let obs of this.obstacles) {
            this.checkCollisionWithObstacle(boid, obs);
        }

        const r = boid.size / 2;
        const force = this.max_force;
        // left wall
        if (!this.wrap[0] && boid.position.x < r) {
        const pen = r - boid.position.x;
        boid.acceleration.x += pen*force;
        }

        // right wall
        if (!this.wrap[0] && boid.position.x > this.width - r) {
        const pen = boid.position.x - (this.width - r);
        boid.acceleration.x -= pen*force;
        }

        // top wall
        if (!this.wrap[1] && boid.position.y < r) {
        const pen = r - boid.position.y;
        boid.acceleration.y += pen*force;
        }

        // bottom wall
        if (!this.wrap[1] && boid.position.y > this.height - r) {
        const pen = boid.position.y - (this.height - r);
        boid.acceleration.y -= pen*force;
        }

        //----------------------------------------------------------------------
        // Wrap-around logic unchanged
        //----------------------------------------------------------------------
        if (this.wrap[0]) {
            if (boid.position.x < 0) boid.position.x += this.width;
            if (boid.position.x >= this.width) boid.position.x -= this.width;
        }

        if (this.wrap[1]) {
            if (boid.position.y < 0) boid.position.y += this.height;
            if (boid.position.y >= this.height) boid.position.y -= this.height;
        }
    }
}

    // Forces like attraction, collisions, and gravity are applied here. Friction is done at the updating of position
    applyPhysics() { 
        for (let i = 0; i < this.boids.length; i++) {
            let boid = this.boids[i];
            let gravity = this.config.gravity ?? 0;
            let collision_force = this.config.collision_force ?? 0;
            let max_speed = this.max_speed;
            let max_force = this.max_force;
            if(boid.locked) continue
            
            if(boid.max_force !== undefined) max_force = boid.max_force;
            if(boid.max_speed !== undefined) max_speed = boid.max_speed;
            if(boid.gravity !== undefined) gravity = boid.gravity;
            if(boid.collision_force !== undefined) collision_force = boid.collision_force;
            
            let neighbours = this.getIndividualsInRange(boid.position, this.neighbourhood_radius);
            let alignment = this.config.alignment ? this.calculateAlignment(boid, neighbours,max_speed) : {x:0,y:0};
            let alignmentstrength = this.config.alignment ? this.config.alignment.strength : 0;
            let separation = this.config.separation ? this.calculateSeparation(boid, neighbours,max_speed) : {x:0,y:0};
            let separationstrength = this.config.separation ? this.config.separation.strength : 0;
            let cohesion = this.config.cohesion ? this.calculateCohesion(boid, neighbours,max_speed) : {x:0,y:0};
            let cohesionstrength = this.config.cohesion ? this.config.cohesion.strength : 0;

            if(boid.alignmentstrength !== undefined) alignmentstrength = boid.alignmentstrength;
            if(boid.cohesionstrength !== undefined) cohesionstrength = boid.cohesionstrength;
            if(boid.separationstrength !== undefined) separationstrength = boid.separationstrength;
            if(boid.brownian !== undefined) brownian = boid.brownian;

            let collision = {x:0,y:0};
            if(collision_force > 0){
                let overlapping = this.getIndividualsInRange(boid.position, boid.size);
                collision = this.calculateCollision(boid, overlapping, max_force);
            } 
            
            // Add acceleration to the boid
            boid.acceleration.x += alignment.x * alignmentstrength + 
                                separation.x * separationstrength + 
                                cohesion.x * cohesionstrength +
                                collision.x * collision_force; 
            boid.acceleration.y += alignment.y * alignmentstrength + 
                                separation.y * separationstrength + 
                                cohesion.y * cohesionstrength +
                                collision.y * collision_force +
                                gravity;
            
            if(this.config.mouseattraction){
                 this.followMouse(boid);
            }
            
        }
    }

   /* The above code is a multi-line comment in JavaScript. It is not executing any code but is used
   for providing explanations or notes within the code. */
   inBounds(boid, rect){
        if(!rect) rect = {x:0,y:0,w:this.width,h:this.height};
        let r = boid.size/2;
        return(boid.position.x+r > rect.x && boid.position.y+r > rect.y &&
               boid.position.x-r < rect.x+rect.w && boid.position.y-r < rect.y+rect.h)
   }

   checkCollisionWithObstacle(boid, obs) {
    if (obs.type === "rectangle") {

        const r = boid.size / 2;

        const left   = boid.position.x - r;
        const right  = boid.position.x + r;
        const top    = boid.position.y - r;
        const bottom = boid.position.y + r;

        if (right > obs.x && left < obs.x + obs.w &&
            bottom > obs.y && top < obs.y + obs.h) {

            // Compute center of boid and closest point on rectangle
            const cx = boid.position.x;
            const cy = boid.position.y;

            const closestX = Math.max(obs.x, Math.min(cx, obs.x + obs.w));
            const closestY = Math.max(obs.y, Math.min(cy, obs.y + obs.h));

            // Penetration vector
            const dx = cx - closestX;
            const dy = cy - closestY;

            const dist = Math.hypot(dx, dy);
            const minDist = r;

            // Only resolve if penetrating
            if (dist < minDist) {

                // Normal vector
                const nx = dx / (dist || 1);
                const ny = dy / (dist || 1);

                const penetration = minDist - dist;

                // 1. Push boid out (position correction)
                boid.position.x += nx * penetration;
                boid.position.y += ny * penetration;

                // 2. Remove velocity along collision normal
                const vn = boid.velocity.x * nx + boid.velocity.y * ny;

                if (vn < 0) { 
                    // cancel inward motion
                    boid.velocity.x -= vn * nx * 1.0;  // 1 = inelastic; <1 = soft
                    boid.velocity.y -= vn * ny * 1.0;
                }

                // 3. Damping so the boid settles
                boid.velocity.x *= 0.8;   // tweakable
                boid.velocity.y *= 0.8;
            }
        }
    }
    else if (obs.type === "circle") {

    const r = boid.size / 2;
    const dx = boid.position.x - obs.x;
    const dy = boid.position.y - obs.y;
    const dist = Math.hypot(dx, dy);

    const minDist = obs.r + r;

    if (dist < minDist) {

        // Normalized outward direction
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // 1. Soft push-out (position correction)
        const penetration = minDist - dist;
        boid.position.x += nx * penetration * 0.5;  // gentle correction
        boid.position.y += ny * penetration * 0.5;

        // 2. Apply a soft repulsive force (like your original code)
        const force = obs.force ?? 1.0;
        boid.acceleration.x += nx * force;
        boid.acceleration.y += ny * force;

        // 3. Light damping only when CLOSE to surface
        //    (prevents infinite tiny jitters)
        if (penetration > 0.1) {
            boid.velocity.x *= 0.9;
            boid.velocity.y *= 0.9;
        }
    }
}

}



    lengthVector(vector) {
        return(Math.sqrt(vector.x * vector.x + vector.y * vector.y))
    }
    scaleVector(vector,scale){
        return {x:vector.x*scale,y:vector.y*scale}
    }
    normaliseVector(vector) {
        let length = this.lengthVector(vector);
        if (length > 0) return { x: vector.x / length, y: vector.y / length }
        else return { x: 0, y: 0 };
    }
    limitVector = function (vector,length){  
        let x = vector.x;
        let y = vector.y;
        let magnitude = Math.sqrt(x*x + y*y);
  
        if (magnitude > length) {
            // Calculate the scaling factor
              const scalingFactor = length / magnitude;
  
               // Scale the vector components
              const scaledX = x * scalingFactor;
              const scaledY = y * scalingFactor;
  
              // Return the scaled vector as an object
              return { x: scaledX, y: scaledY };
        }
        return { x:x, y:y }
      }

    // Angle in degrees
    rotateVector(vec, ang)
    {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return {x: vec.x*cos - vec.y*sin, y: vec.x*sin + vec.y*cos}
    }

    handleMouseBoids(){}

    repelBoids(force=30){
        for (let boid of this.mouseboids) {
            let dx = boid.position.x - this.mousecoords.x;
            let dy = boid.position.y - this.mousecoords.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance > 0) { // Ensure we don't divide by zero
                    let strength = (this.mouse_radius - distance) / this.mouse_radius;
                    boid.velocity.x += (dx / distance) * strength * this.max_force * force;
                    boid.velocity.y += (dy / distance) * strength * this.max_force * force;
            }
        }
        this.mouseboids = [];
    }
    pullBoids(){
        this.repelBoids(-30);
    }

    killBoids(){
        let mouseboids = this.mouseboids;
        this.boids = this.boids.filter( function( el ) {
            return mouseboids.indexOf( el ) < 0;
          } );
    }


    
    /** Apart from flocking itself, any updates for the individuals are done here.
     * By default, nextState is empty. It should be defined by the user (see examples)
    */
    update() {
        
    }

    /** If called for the first time, make an update order (list of ints), otherwise just shuffle it. */
    set_update_order() {
        if (typeof this.upd_order === 'undefined')  // "Static" variable, only create this array once and reuse it
        {
            this.upd_order = [];
            for (let n = 0; n < this.individuals.length; n++) {
                this.upd_order.push(n);
            }
        }
        shuffle(this.upd_order, this.rng);         // Shuffle the update order
    }

    // Returns the grid point corresponding to the boid's position. Returns 'null' if the boid is out of bounds
    getBoidGridpoint(i,gridmodel){
        let x = Math.floor(i.position.x);
        let y = Math.floor(i.position.y);
        
        if(x >= 0 && x < gridmodel.nc && y >= 0 && y < gridmodel.nr) {
            gridmodel.grid[x][y].x = x;
            gridmodel.grid[x][y].y = y;
            return(gridmodel.grid[x][y])
        }
        else {
            return undefined
        }
    }
    getGridpoint = this.getBoidGridpoint

    // TODO UITLEG
    getNearbyGridpoints(boid,gridmodel,radius){
        let gps = [];
        let ix = Math.floor(boid.position.x);
        let iy = Math.floor(boid.position.y);
        radius = Math.floor(0.5*radius);
        for (let x = ix-radius; x < ix+radius; x++)                         
        for (let y = iy-radius; y < iy+radius; y++)                         
        {
            if(!this.wrap[0])
                if(x < 0 || x > this.width-1) continue
            if(!this.wrap[1])
                if(y < 0 || y > this.height-1) continue
            if ((Math.pow((boid.position.x - x), 2) + Math.pow((boid.position.y - y), 2)) < radius*radius){
                gps.push(gridmodel.grid[(x + gridmodel.nc) % gridmodel.nc][(y + gridmodel.nr) % gridmodel.nr]);
            }
        }
        return gps
    }

    getIndividualsInRange(position,radius){
        
        let qt = this.qt;
        let width = this.width;
        let height = this.height;
        let neighbours = [];     // Collect all found neighbours here
        const offsets = [       // Fetch in 9 possible ways for wrapping around the grid
            { x: 0, y: 0 },         
            { x: width, y: 0 },
            { x: -width, y: 0 },
            { x: 0, y: height },
            { x: 0, y: -height },
            { x: width, y: height },
            { x: width, y: -height },
            { x: -width, y: height },
            { x: -width, y: -height }
        ];				

        // Fetch all neighbours for each range
        for (const offset of offsets) {
            let range = { x:position.x+offset.x, y:position.y+offset.y, w:radius*2, h:radius*2 };
            neighbours.push(...qt.query(range));
        }
        
        // Filter neighbours to only include those within the circular radius (a bit quicker than slicing in for loop, i noticed)
        return neighbours.filter(neighbour => {
            let dx = neighbour.position.x - position.x;
            let dy = neighbour.position.y - position.y;
            // Adjust for wrapping in the x direction
            if (Math.abs(dx) > width/2) {
                dx = dx - Math.sign(dx) * width;
            }
        
            // Adjust for wrapping in the y direction
            if (Math.abs(dy) > height/2) {
                dy = dy - Math.sign(dy) * height;
            }
        
            return (dx*dx + dy*dy) <= (radius*radius);
        }); 
    }

    /** From a list of individuals, e.g. this.individuals, sample one weighted by a property. This is analogous
     *  to spinning a "roulette wheel". Also see a hard-coded versino of this in the "cheater" example
     *  @param {Array} individuals Array of individuals to sample from (e.g. living individuals in neighbourhood)
     *  @param {string} property The property used to weigh gps (e.g. fitness)
     *  @param {float} non Scales the probability of not returning any gp. 
     */
    rouletteWheel(individuals, property, non = 0.0) {
        let sum_property = non;
        for (let i = 0; i < individuals.length; i++) sum_property += individuals[i][property];       // Now we have the sum of weight + a constant (non)
        let randomnr = this.rng.genrand_real1() * sum_property;                // Sample a randomnr between 0 and sum_property        
        let cumsum = 0.0;                                                    // This will keep track of the cumulative sum of weights
        for (let i = 0; i < individuals.length; i++) {
            cumsum += individuals[i][property];
            if (randomnr < cumsum) return individuals[i]
        }
        return
    }
    
    placeObstacle(config){
        let force = config.force == undefined ? 1 : config.force;
        if(config.w) this.obstacles.push({type:'rectangle',x:config.x,y:config.y,w:config.w,h:config.h,fill:config.fill,force:force});
        if(config.r) this.obstacles.push({type:'circle',x:config.x,y:config.y,r:config.r,fill:config.fill,force:force});
    }
    /** Assign each individual a new random position in space. This simulated mixing,
     *  but does not guarantee a "well-mixed" system per se (interactions are still local)
     *  calculated based on neighbourhoods. 
     */
    perfectMix(){
        for(let boid of this.boids){
            boid.position.x = this.rng.genrand_real1() * this.width;
            boid.position.y = this.rng.genrand_real1() * this.height;
        }
        //return "Perfectly mixed the individuals"
    }

    shuffleBoids(){
        shuffle(this.boids, this.rng);
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
        let graph_labels = Array.from({length: graph_values.length}, (v, i) => 'sample'+(i+1));
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
}

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
        this.label = lab;
        this.model = model;
        this.statecolours = model.statecolours;
        this.property = prop;
        this.height = height;
        this.width = width;
        this.scale = scale;        
        this.continuous = continuous;
        this.bgcolour = 'black';
        this.offset_x = 0;
        this.offset_y = 0;        
        this.phase = 0;
        this.addToDisplay = addToDisplay;
        
        if (typeof document !== "undefined")                       // In browser, crease a new HTML canvas-element to draw on 
        {
            this.elem = document.createElement("canvas");
            this.titlediv = document.createElement("div");
            if(this.label) this.titlediv.innerHTML = "<p style='height:10'><font size = 3>" + this.label + "</font></p>";

            this.canvasdiv = document.createElement("div");
            this.canvasdiv.className = "grid-holder";
            
            this.elem.className = "canvas-cacatoo";
            this.elem.width = this.width * this.scale;
            this.elem.height = this.height * this.scale;
            if(!addToDisplay){
                this.canvasdiv.appendChild(this.elem);
                this.canvasdiv.appendChild(this.titlediv);            
                document.getElementById("canvas_holder").appendChild(this.canvasdiv);
            }
            this.ctx = this.elem.getContext("2d", { willReadFrequently: true });
            this.display = this.displaygrid;
        }

        this.underlay = function(){};
        this.overlay = function(){};

    }

    

    /**
    *  Draw the state of the model (for a specific property) onto the HTML element
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
        this.underlay();

        var id = ctx.getImageData(0, 0, scale * ncol, scale * nrow);
        var pixels = id.data;

        let start_col = this.offset_x;
        let stop_col = start_col + ncol;
        let start_row = this.offset_y;
        let stop_row = start_row + nrow;

        let statecols = this.statecolours[prop];
        
        for (let x = start_col; x < stop_col; x++)         // x are cols
        {
            for (let y = start_row; y< stop_row; y++)     // y are rows
            {                     
                if (!(prop in this.model.grid[x][y]))
                    continue                     
                
                let value = this.model.grid[x][y][prop];
                

                if(this.continuous && this.maxval !== undefined && this.minval !== undefined)
                {                  
                    value = Math.max(this.minval,Math.min(this.maxval,value));
                    value = Math.ceil((value - this.minval)/(this.maxval-this.minval)*this.num_colours);                    
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
                        let xpos = (x-this.offset_x) * scale + n + (this.phase%ncol)*scale;
                        let ypos = (y-this.offset_y) * scale + m;
                        var off = (ypos * id.width + xpos) * 4;
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
        this.overlay();
    }

    /**
    *  Draw the state of the model (for a specific property) onto the HTML element
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
        this.underlay();

        let start_col = this.offset_x;
        let stop_col = start_col + ncol;
        let start_row = this.offset_y;
        let stop_row = start_row + nrow;

        let statecols = this.statecolours[prop];
        
        
        for (let x = start_col; x < stop_col; x++)         // x are cols
        {
            for (let y = start_row; y< stop_row; y++)     // y are rows
            {                     
                if (!(prop in this.model.grid[x][y]))
                    continue                     
                
               

                let value = this.model.grid[x][y][prop];

                let radius = this.scale_radius*this.radius;
                
                if(isNaN(radius)) radius = this.scale_radius*this.model.grid[x][y][this.radius];                
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
                ctx.arc((x-this.offset_x) * scale + 0.5*scale, (y-this.offset_y) * scale + 0.5*scale, radius, 0, 2 * Math.PI, false);
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
        this.overlay();
    }

    /**
    *  Draw the state of the flockmodel onto the HTML element
    */
    displayflock() {
        let ctx = this.ctx; 
        if(this.model.draw == false) return
        if(this.addToDisplay) this.ctx = this.addToDisplay.ctx;
        
        let scale = this.scale;
        let ncol = this.width;
        let nrow = this.height;
        let prop = this.property;

        if(!this.addToDisplay) {
            ctx.clearRect(0, 0, scale * ncol, scale * nrow);   
            ctx.fillStyle = this.bgcolour;
            ctx.fillRect(0, 0, ncol * scale, nrow * scale);         
        }
        this.underlay();
        
        if(this.model.config.qt_colour) this.model.qt.draw(ctx, this.scale, this.model.config.qt_colour);

        for (let boid of this.model.boids){  // Plot all individuals
            
            if(boid.invisible) continue
            if(!boid.fill) boid.fill = 'black';
            
            if(this.model.statecolours[prop]){
                let val = boid[prop];
                if(this.maxval !== undefined){
                    let cols = this.model.statecolours[prop];
                    val = Math.max(val,this.minval) - this.minval;
                    let mult = this.num_colours/(this.maxval-this.minval);
                    val = Math.min(this.num_colours,Math.max(Math.floor(val*mult),1));
                    boid.fill = rgbToHex(cols[val]);
                }
                else {
                    boid.fill = rgbToHex(this.model.statecolours[prop][val]);
                }
            }
            if(boid.col == undefined) boid.col = this.strokeStyle;
            if(boid.lwd == undefined) boid.lwd = this.strokeWidth;
            this.drawBoid(boid,ctx);        
        }
        
        if(this.model.config.draw_mouse_radius){
            ctx.beginPath();
            ctx.strokeStyle = this.model.config.draw_mouse_colour || '#FFFFFF';
            ctx.arc(this.model.mousecoords.x*this.scale, this.model.mousecoords.y*this.scale,this.model.config.mouse_radius*this.scale, 0, Math.PI*2);
            ctx.stroke();
            ctx.closePath();
        }
        for(let obs of this.model.obstacles){
            if(obs.type=='rectangle'){
                ctx.fillStyle = obs.fill || '#00000033';
                ctx.fillRect(obs.x*this.scale, obs.y*this.scale,obs.w*this.scale,obs.h*this.scale);
            }
            else if(obs.type=='circle'){
                ctx.beginPath();
                ctx.fillStyle = obs.fill || '#00000033';
                ctx.lineStyle = '#FFFFFF';
                ctx.arc(obs.x*this.scale,obs.y*this.scale,obs.r*this.scale,0,Math.PI*2);
                ctx.fill();
                ctx.closePath();
            }
        }
        
        this.draw_qt();

        this.overlay();

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
        ctx.fillStyle = boid.fill;
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();
        if(boid.col){
            ctx.strokeStyle = boid.col;
            ctx.lineWidth = boid.lwd;
            ctx.stroke();
        } 
        ctx.closePath();
    }
    
    // Draw a rectangle at the position of the boid
    drawBoidRect(boid,ctx){
        ctx.fillStyle = boid.fill;
        ctx.fillRect(boid.position.x*this.scale,boid.position.y*this.scale,boid.size,boid.size);
        if(boid.col){
            ctx.strokeStyle = boid.col;
            ctx.lineWidth = boid.stroke;
            ctx.strokeRect(boid.position.x*this.scale,boid.position.y*this.scale,boid.size,boid.size);
        } 
    }
    
    // Draw an arrow pointing in the direction of the velocity vector
    drawBoidArrow(boid,ctx, length=1, width=0.3){
        ctx.save();
        ctx.translate(boid.position.x*this.scale, boid.position.y*this.scale);
        let angle = Math.atan2(boid.velocity.y*this.scale,boid.velocity.x*this.scale);
        ctx.rotate(angle);
        ctx.fillStyle = boid.fill;
        ctx.beginPath();
        ctx.moveTo(length*boid.size,0);
        ctx.lineTo(0, width*boid.size); // Left wing */
        ctx.lineTo(0, -width*boid.size);  // Right wing
        ctx.lineTo(length*boid.size,0);  // Back
        ctx.fill();
        if(boid.col){
            ctx.strokeStyle = boid.col;
            ctx.lineWidth = boid.stroke;
            ctx.stroke();
        }
        ctx.restore();     
    }

    drawBoidRod(boid, ctx) {
        ctx.fillStyle = boid.fill;
        let scale = this.scale;
        ctx.lineWidth = boid.size * scale;
        
        // Normalised velocity
        const vector = this.model.normaliseVector(boid.velocity);

        // Front circle
        const frontx = (boid.position.x + 2 * vector.x) * scale;
        const fronty = (boid.position.y + 2 * vector.y) * scale;
        ctx.beginPath();
        ctx.arc(frontx, fronty, 0.5 * boid.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Back circle
        const backx = (boid.position.x - 2 * vector.x) * scale;
        const backy = (boid.position.y - 2 * vector.y) * scale;
        ctx.beginPath();
        ctx.arc(backx, backy, 0.5 * boid.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Connecting rod
        ctx.beginPath();
        ctx.strokeStyle = boid.fill;
        ctx.moveTo(frontx, fronty);
        ctx.lineTo(backx, backy);
        ctx.stroke();

        if (boid.flagella) {
            const size = boid.size * scale;

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
                // 3 flagella, evenly spaced around body, rotated by boid direction
                const base = Math.atan2(boid.velocity.y, boid.velocity.x);

                // 3 offsets around the circle
                const offsets = [
                    0,
                    (2 * Math.PI) / 3,
                    (4 * Math.PI) / 3
                ];

                const r = 0.15 * boid.size * scale;
                const cx = boid.position.x * scale;
                const cy = boid.position.y * scale;

                offsets.forEach((off, i) => {
                    const ang = base + off;  // rotate with boid direction
                    const x = cx + Math.cos(ang) * r;
                    const y = cy + Math.sin(ang) * r;
                    this.drawFlagellum(ctx, x, y, ang, size, i);
                });
            }
        }
    }

    drawFlagellum(ctx, x, y, angle, size, index) {
        const time = this.model.time * 1;     // wave speed
        const length = 2 * size;                // flagellum length
        const segments = 12;                     // smoothness
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
        this.drawBoidArrow(boid,ctx,0.4,1);
    }

    // Draw a circle at the position of the boid
    drawBoidBunny(boid,ctx){ 
        ctx.fillStyle = boid.fill;

        // Head
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Ears
        ctx.beginPath();
        ctx.ellipse((boid.position.x+0.2*boid.size)*this.scale,
                (boid.position.y-0.5*boid.size)*this.scale,
                0.2*this.scale*boid.size,
                0.5*this.scale*boid.size,
                0,
                0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.ellipse((boid.position.x-0.2*boid.size)*this.scale,
                (boid.position.y-0.5*boid.size)*this.scale,
                0.2*this.scale*boid.size,
                0.5*this.scale*boid.size,
                0,
                0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Eyes
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc((boid.position.x-0.25*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();  
        ctx.closePath();

        ctx.beginPath();
        ctx.arc((boid.position.x+0.25*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();  

        ctx.closePath();

    }

    // Draw a circle at the position of the boid
    drawBoidBear(boid,ctx){ 
        ctx.fillStyle = boid.fill;

        // Head
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale,boid.position.y*this.scale,0.5*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Ears
        ctx.beginPath();
        ctx.arc((boid.position.x+0.4*boid.size)*this.scale,
                (boid.position.y-0.4*boid.size)*this.scale,
                0.25*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc((boid.position.x-0.4*boid.size)*this.scale,
                (boid.position.y-0.4*boid.size)*this.scale,
                0.25*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();

        // Eyes
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc((boid.position.x-0.15*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();  
        ctx.closePath();

        ctx.beginPath();
        ctx.arc((boid.position.x+0.15*boid.size)*this.scale,
                (boid.position.y-0.1)*this.scale,
                0.1*boid.size*this.scale,0,Math.PI*2);
        ctx.fill();  

        ctx.closePath();

    }

    // Draw a line from the boids position to the velocity vector. Indicates speed. 
    drawBoidLine(boid,ctx){
        ctx.beginPath();
        ctx.strokeStyle = boid.col || boid.fill;
        ctx.lineWidth = boid.stroke;
        
        ctx.moveTo(boid.position.x*this.scale, boid.position.y*this.scale);
            
        ctx.lineTo(boid.position.x*this.scale+boid.velocity.x*boid.size,
                    boid.position.y*this.scale+boid.velocity.y*boid.size);
        ctx.strokeStyle = boid.fill;
        ctx.stroke();
        ctx.closePath();
    }

    // Draw three points along the velocity vector + 2 antanae. Sort of an ant thingy. 
    drawBoidAnt(boid,ctx){
        ctx.fillStyle = boid.fill;
        
        let vector = this.model.normaliseVector({x: boid.velocity.x, y: boid.velocity.y});

        // First body part
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale-vector.x*boid.size*1.5,
                 boid.position.y*this.scale-vector.y*boid.size*1.5,boid.size*1.2,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
        
        // Second body part
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale,
                boid.position.y*this.scale,
                boid.size/1.3,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Third body part
        ctx.beginPath();
        ctx.arc(boid.position.x*this.scale+vector.x*boid.size*1.3,
             boid.position.y*this.scale+vector.y*boid.size*1.3,
              boid.size/1.1,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();

        // Food
        if(boid.food){
            ctx.beginPath();
            ctx.fillStyle = boid.food;
            
            ctx.arc(boid.position.x*this.scale+vector.x*boid.size*3.5,
                boid.position.y*this.scale+vector.y*boid.size*3.5,
                boid.size*1.2,0,Math.PI*2);
            ctx.fill();
            ctx.closePath();
        }
        
        let dir;
        
        ctx.beginPath();
        // First antenna
        dir = this.model.rotateVector(vector,30);
        ctx.moveTo(boid.position.x*this.scale+vector.x*boid.size*1,
            boid.position.y*this.scale+vector.y*boid.size*1);
        ctx.lineTo(boid.position.x*this.scale+vector.x*boid.size*1.8+dir.x*boid.size*1.3,
                    boid.position.y*this.scale+vector.y*boid.size*1.8+dir.y*boid.size*1.3);
        ctx.strokeStyle = boid.fill;
        ctx.lineWidth = boid.size/2;
        

        // // Second antenna
        
        dir = this.model.rotateVector(vector,-30);
        ctx.moveTo(boid.position.x*this.scale+vector.x*boid.size*1,
            boid.position.y*this.scale+vector.y*boid.size*1);
        ctx.lineTo(boid.position.x*this.scale+vector.x*boid.size*1.8+dir.x*boid.size*1.3,
                    boid.position.y*this.scale+vector.y*boid.size*1.8+dir.y*boid.size*1.3);
        ctx.strokeStyle = boid.fill;
        ctx.lineWidth = boid.size/2;
        ctx.stroke();
        
        if(boid.col){
            ctx.strokeStyle = boid.col;
            ctx.lineWidth = boid.stroke;
            ctx.stroke();
        } 
        ctx.closePath();
        
        
    }


    // Draw an image at the position of the boid. Requires boid.png to be set. Optional is boid.pngangle to
    // let the png adjust direction according to the velocity vector
    drawBoidPng(boid,ctx){
        if(boid.pngangle !==undefined){
            ctx.save();
            ctx.translate(boid.position.x*this.scale-boid.size*this.scale*0.5, 
                         boid.position.y*this.scale-boid.size*this.scale*0.5);
            let angle = Math.atan2(boid.velocity.y*this.scale,boid.velocity.x*this.scale+boid.pngangle);
            ctx.rotate(angle);
            if(boid.img == undefined) boid.img = new Image();
            boid.img.src = boid.png;
            if(!boid.png) console.warn("Boid does not have a PNG associated with it");
            ctx.drawImage(base_image,0,0,boid.size*this.scale,boid.size*this.scale);
            ctx.restore();
        }
        else {
            if(boid.img == undefined) boid.img = new Image();
            boid.img.src = boid.png;
            if(!boid.png) console.warn("Boid does not have a PNG associated with it");
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
        let statecols = this.statecolours[property];
        if(statecols == undefined){
            console.warn(`Cacatoo warning: no colours setup for canvas "${this.label}"`);
            return
        }
                    
        this.legend = document.createElement("canvas");
        this.legend.className = "legend";
        this.legend.width = this.width*this.scale*0.6;
        
        this.legend.height = 50;
        let ctx = this.legend.getContext("2d");

        ctx.textAlign = "center";
        ctx.font = '14px helvetica';     
        ctx.fillText(lab, this.legend.width/2, 16);

        if(this.maxval!==undefined) {
            let bar_width = this.width*this.scale*0.48;
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
                ctx.fillRect(offset+i, 20, 1, 10);
                ctx.closePath();
                
            }
            for(let i = 0; i<n_ticks+1; i++){
                let tick_position = (i*step_size+offset);
                ctx.strokeStyle = "#FFFFFF";                        
                ctx.beginPath();
                ctx.moveTo(tick_position, 25);
                ctx.lineTo(tick_position, 30);
                ctx.lineWidth=2;
                ctx.stroke();
                ctx.closePath();
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.font = '12px helvetica';     
                let ticklab = (this.minval+i*tick_increment);
                ticklab = ticklab.toFixed(this.decimals);         
                ctx.fillText(ticklab, tick_position, 45);
            }

            ctx.beginPath();
            ctx.rect(offset, 20, bar_width, 10);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
            div.appendChild(this.legend);
        }
        else {                    
             
            let keys = Object.keys(statecols);
            
            let total_num_values = keys.length;
            let spacing = 0.9;
            // if(total_num_values < 8) spacing = 0.7
            // if(total_num_values < 4) spacing = 0.8
            
            let bar_width = this.width*this.scale*spacing;   
            
            let step_size = Math.round(bar_width / (total_num_values+1));
            let offset = this.legend.width*0.5 - step_size*(total_num_values-1)/2;
           

            for(let i=0;i<total_num_values;i++)
            {                                    
                let pos = offset+Math.floor(i*step_size);
                ctx.beginPath();                
                ctx.strokeStyle = "#000000";
                if(statecols[keys[i]] == undefined) ctx.fillStyle = this.bgcolor;                
                else ctx.fillStyle = rgbToHex(statecols[keys[i]]);
                if(this.radius){
                    ctx.beginPath();
                    ctx.arc(pos,10,5,0,Math.PI*2);
                    ctx.fill();
                    ctx.closePath();
                }
                else {
                    ctx.fillRect(pos-4, 10, 10, 10);
                }
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
    if(arr.length==3) return "#" + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2])
    if(arr.length==4) return "#" + componentToHex(arr[0]) + componentToHex(arr[1]) + componentToHex(arr[2]) + componentToHex(arr[3])
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
        this.skip = config.skip || 0;
        this.graph_interval = config.graph_interval = config.graph_interval || 10;
        this.graph_update = config.graph_update= config.graph_update || 50;
        this.fps = config.fps * 1.4 || 60; // Multiplied by 1.4 to adjust for overhead
        this.mousecoords = {x:-1000, y:-1000};

        // Three arrays for all the grids ('CAs'), canvases ('displays'), and graphs 
        this.gridmodels = [];            // All gridmodels in this simulation
        this.flockmodels = [];            // All gridmodels in this simulation
        this.canvases = [];              // Array with refs to all canvases (from all models) from this simulation
        this.graphs = [];                // All graphs
        this.time = 0;
        this.inbrowser = (typeof document !== "undefined");        
        this.fpsmeter = false;
        if(config.fpsmeter == true) this.fpsmeter = true;
        
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
    *  Generate a new GridModel within this simulation.  
    *  @param {string} name The name of your new model, e.g. "gol" for game of life. Cannot contain whitespaces. 
    */
    makeFlockmodel(name, cfg) {
        let cfg_combined = {...this.config,...cfg};
        if (name.indexOf(' ') >= 0) throw new Error("The name of a gridmodel cannot contain whitespaces.")
        let model = new Flockmodel(name, cfg_combined, this.rng); // ,this.config.show_gridname weggecomment
        this[name] = model;           // this = model["cheater"] = CA-obj
        this.flockmodels.push(model);
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
        
        rng.genrand_real1 = function () { return (rng.nextInt() - 1) / 2147483645 };         // Generate random number in [0,1] range        
        rng.genrand_real2 = function () { return (rng.nextInt() - 1) / 2147483646 };         // Generate random number in [0,1) range        
        rng.genrand_real3 = function () { return rng.nextInt() / 2147483647 };               // Generate random number in (0,1) range        
        rng.genrand_int = function (min,max) { return min+ rng.nextInt() % (max-min+1) };    // Generate random integer between (and including) min and max    
                
        for(let i = 0; i < 1000; i++) rng.genrand_real2();        
        rng.random = () => { return rng.genrand_real2() };        
        rng.randomInt = () => { return rng.genrand_int() };     
        
        rng.randomGaus = (mean=0, stdev=1) => { // Standard gaussian sample
            const u = 1 - sim.rng.random(); 
            const v = sim.rng.random();
            const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
            return z * stdev + mean;
        };           
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
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas; }, false);
        cnv.displaygrid();                
    }       
    createGridDisplay = this.createDisplay

    /**
    * Create a display for a flockmodel, showing the boids
    * @param {string} name The name of an existing gridmodel to display
    * @param {Object} config All the options for the flocking behaviour etc.
    */
    createFlockDisplay(name, config = {}) {
        if(! this.inbrowser) {
            console.warn("Cacatoo:createFlockDisplay, cannot create display in command-line mode.");
            return
        }

        if(name==undefined) throw new Error("Cacatoo: can't make a display with out a 'name'")        

        let flockmodel = this[name];        
        if (flockmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)

        let property = config.property; 
        let addToDisplay = config.addToDisplay;
        
        
        let label = config.label || "";
        let legendlabel = config.legendlabel;
        let height = sim.height || flockmodel.height;
        let width = config.width || sim.width || flockmodel.width;
        let scale = config.scale || this[name].scale;               
        let maxval = config.maxval || this.maxval || undefined;   
        let decimals= config.decimals || 0;
        let nticks= config.nticks || 5;
        let minval = config.minval || 0;
        let num_colours = config.num_colours || 100;

        if(config.fill == "viridis") this[name].colourViridis(property, num_colours);    
        else if(config.fill == "inferno") this[name].colourViridis(property, num_colours, false, "inferno");    
        else if(config.fill == "rainbow") this[name].statecolours[property] = this[name].colourGradientArray(num_colours, 0,[251, 169, 73], [250, 228, 66], [139, 212, 72], [42, 168, 242],[50,100,255]);
        else if(config.fill == "pride") this[name].statecolours[property] = this[name].colourGradientArray(num_colours, 0, [228, 3, 3], [255, 140, 0], [255, 237, 0], [0, 128, 38], [0,76,255],[115,41,130]);
        else if(config.fill == "inferno_rev") this[name].colourViridis(property, num_colours, true, "inferno");    
        else if(config.fill == "red") this[name].colourGradient(property, num_colours, [0, 0, 0], [255, 0, 0]);
        else if(config.fill == "green") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 255, 0]);
        else if(config.fill == "blue") this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255]);
        else if(this[name].statecolours[property]==undefined && property){
            console.log(`Cacatoo: no fill colour supplied for property ${property}. Using default and hoping for the best.`);
            this[name].colourGradient(property, num_colours, [0, 0, 0], [0, 0, 255]);
        }
        
        
        let cnv = new Canvas(flockmodel, property, label, height, width,scale,false,addToDisplay);
        if (maxval !== undefined) cnv.maxval = maxval;
        if (minval !== undefined) cnv.minval = minval;
        if (num_colours !== undefined) cnv.num_colours = num_colours;
        if (decimals !== undefined) cnv.decimals = decimals;
        if (nticks !== undefined) cnv.nticks = nticks;

        cnv.strokeStyle = config.strokeStyle;
        cnv.strokeWidth = config.strokeWidth;
        
        if(config.legend!==false){
            if(addToDisplay) cnv.add_legend(addToDisplay.canvasdiv,property,legendlabel);
            else cnv.add_legend(cnv.canvasdiv,property,legendlabel );
        }

        // Set the shape of the boid
        let shape = flockmodel.config.shape || 'dot';
        cnv.drawBoid = cnv.drawBoidArrow;
        if(shape == 'bird') cnv.drawBoid = cnv.drawBoidBird;
        else if(shape == 'arrow') cnv.drawBoid = cnv.drawBoidArrow;
        else if(shape == 'rect') cnv.drawBoid = cnv.drawBoidRect;
        else if(shape == 'dot') cnv.drawBoid = cnv.drawBoidPoint;
        else if(shape == 'ant') cnv.drawBoid = cnv.drawBoidAnt;
        else if(shape == 'bear') cnv.drawBoid = cnv.drawBoidBear;
        else if(shape == 'bunny') cnv.drawBoid = cnv.drawBoidBunny;
        else if(shape == 'rod') cnv.drawBoid = cnv.drawBoidRod;
        else if(shape == 'line') cnv.drawBoid = cnv.drawBoidLine;
        else if(shape == 'png') cnv.drawBoid = cnv.drawBoidPng;
        
        // Replace function that handles the left mousebutton
        let click = flockmodel.config.click || 'none';
        if(click == 'repel') flockmodel.handleMouseBoids = flockmodel.repelBoids;
        else if(click == 'pull') flockmodel.handleMouseBoids = flockmodel.pullBoids;
        else if(click == 'kill') flockmodel.handleMouseBoids = flockmodel.killBoids;
       
        flockmodel.canvases[label] = cnv;  // Add a reference to the canvas to the flockmodel
        this.canvases.push(cnv);  // Add a reference to the canvas to the sim
        const canvas = addToDisplay || cnv;

        flockmodel.mouseDown = false;
        flockmodel.mouseClick = false;
        canvas.elem.addEventListener('mousemove', (e) => { 
            let mouse = this.getCursorPosition(canvas,e,1,false); 
            if(mouse.x == this.mousecoords.x && mouse.y == this.mousecoords.y) return this.mousecoords
            this.mousecoords = {x:mouse.x/this.scale, y:mouse.y/this.scale};            
            flockmodel.mousecoords = this.mousecoords;
        }); 
        canvas.elem.addEventListener('touchmove', (e) => { 
            let mouse = this.getCursorPosition(canvas,e.touches[0],1,false); 
            if(mouse.x == this.mousecoords.x && mouse.y == this.mousecoords.y) return this.mousecoords
            this.mousecoords = {x:mouse.x/this.scale, y:mouse.y/this.scale};            
            flockmodel.mousecoords = this.mousecoords;
            e.preventDefault();
        }); 
        
        canvas.elem.addEventListener('mousedown', (e) => { flockmodel.mouseDown = true;});
        canvas.elem.addEventListener('touchstart', (e) => { flockmodel.mouseDown = true;});

        canvas.elem.addEventListener('mouseup', (e) => { flockmodel.mouseDown = false; });
        canvas.elem.addEventListener('touchend', (e) => { flockmodel.mouseDown = false; flockmodel.mousecoords = {x:-1000,y:-1000};});
        canvas.elem.addEventListener('mouseout', (e) => { flockmodel.mousecoords = {x:-1000,y:-1000};});
        cnv.bgcolour = this.config.bgcolour || 'black';
        cnv.display = cnv.displayflock;                
        cnv.display();
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
        let legend = true;
        if(config.legend == false) legend = false;

        let label = config.label;
        if (label == undefined) label = `${name} (${property})`; // <ID>_NAME_(PROPERTY)
        let gridmodel = this[name];
        if (gridmodel == undefined) throw new Error(`There is no GridModel with the name ${name}`)
        
        let height = config.height || this[name].nr;        
        let width = config.width || this[name].nc;
        let scale = config.scale || this[name].scale;          
        let legendlabel = config.legendlabel;
    
        
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
            cnv.display = cnv.displaygrid_dots;
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
        if(legend) cnv.add_legend(cnv.canvasdiv,property, legendlabel);
        cnv.bgcolour = this.config.bgcolour || 'black';
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(canvas, e, scale); }, false);
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas; }, false);
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
        let legendlabel = config.legendlabel;
        let legend = true;
        if(config.legend == false) legend = false;

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
        let num_colours = config.num_colours || 100;
        
        if(config.fill == "viridis") this[name].colourViridis(property, num_colours);    
        else if(config.fill == "inferno") this[name].colourViridis(property, num_colours, false, "inferno");    
        else if(config.fill == "rainbow") this[name].statecolours[property] = this[name].colourGradientArray(num_colours, 0,[251, 169, 73], [250, 228, 66], [139, 212, 72], [42, 168, 242],[50,100,255]);
        else if(config.fill == "pride")  this[name].statecolours[property] = this[name].colourGradientArray(num_colours, 0, [228, 3, 3], [255, 140, 0], [255, 237, 0], [0, 128, 38], [0,76,255],[115,41,130]);
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
            cnv.display = cnv.displaygrid_dots;
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
        
        if(legend!==false) cnv.add_legend(cnv.canvasdiv,property,legendlabel);
        cnv.bgcolour = this.config.bgcolour || 'black';
        this.canvases.push(cnv);  // Add a reference to the canvas to the sim
        const canvas = cnv;        
        canvas.elem.addEventListener('mousedown', (e) => { this.printCursorPosition(cnv, e, scale); }, false);
        canvas.elem.addEventListener('mousedown', (e) => { this.active_canvas = canvas; }, false);
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
        cnv.elem.addEventListener('mousedown', (e) => { sim.active_canvas = cnv; }, false);
    }


    /**
    * Get the position of the cursor on the canvas
    * @param {canvas} canvas A (constant) canvas object
    * @param {event-handler} event Event handler (mousedown)
    * @param {scale} scale The zoom (scale) of the grid to grab the correct grid point
    */
    getCursorPosition(canvas, event, scale, floor=true) {
        const rect = canvas.elem.getBoundingClientRect();
        let x = Math.max(0, event.clientX - rect.left) / scale + canvas.offset_x;
        let y = Math.max(0, event.clientY - rect.top) / scale + canvas.offset_y;
        if(floor){
            x = Math.floor(x);
            y = Math.floor(y);
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
        let coords = this.getCursorPosition(canvas,event,scale);
        let x = coords.x;
        let y = coords.y;
        if( x< 0 || x >= this.ncol || y < 0 || y >= this.nrow) return
        console.log(`You have clicked the grid at position ${x},${y}, which has:`);
        for (let model of this.gridmodels) {
            console.log("grid point:", model.grid[x][y]);
        }
        for (let model of this.flockmodels) {
            console.log("boids:", model.mouseboids);
        }
    }



    /**
    * Update all the grid models one step. Apply optional mixing
    */
    step() {
        for (let i = 0; i < this.gridmodels.length; i++){
            this.gridmodels[i].update();
            this.gridmodels[i].time++;
        }

        for (let i = 0; i < this.flockmodels.length; i++){
            let model = this.flockmodels[i];
            model.flock();
            model.update();
            model.time++;
            let mouse = model.mousecoords;
            if(model.mouse_radius) model.mouseboids = model.getIndividualsInRange(mouse,model.mouse_radius);
            if(model.mouseDown)model.handleMouseBoids();
        }

        for (let i = 0; i < this.canvases.length; i++)
            if(this.canvases[i].recording == true)
                this.captureFrame(this.canvases[i]);
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
        for (let i = 0; i < this.canvases.length; i++){
            this.canvases[i].display();
            if(this.canvases[i].recording == true){
                this.captureFrame(this.canvases[i]);
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

            if (this.config.noheader != true) {
                document.title = `Cacatoo - ${this.config.title}`;            
                var link = document.querySelector("link[rel~='icon']");
                if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); }
                link.href = '../../images/favicon.png';
            }

            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML = `<a target="blank" href="https://bramvandijk88.github.io/cacatoo/"><img class="logos" src=""https://bramvandijk88.github.io/cacatoo/cacatoo/images/elephant_cacatoo_small.png"></a>`;
            if (document.getElementById("footer") != null) document.getElementById("footer").innerHTML += `<a target="blank" href="https://github.com/bramvandijk88/cacatoo"><img class="logos" style="padding-top:32px;" src=""https://bramvandijk88.github.io/cacatoo/cacatoo/images/gh.png"></a></img>`;
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

            }

            requestAnimationFrame(animate);
        }
        else {
            while (true) {
                sim.step();
                if (sim.time > sim.config.maxtime || sim.exit ) {
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
        this.exit = true;
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
        let gridmodel = undefined; 
        if (obj instanceof Gridmodel) // user passed a gridmodel object
            gridmodel = obj; 
        else
            gridmodel = obj.gridmodel;
        if(typeof gridmodel === 'string' || gridmodel instanceof String) // user passed a string
            gridmodel = this[gridmodel];
        // Next, put the default values in the grid
        let p = property || obj.property || 'val';
        if(obj.default != undefined) defaultvalue = obj.default;
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++)                  // y are rows
                gridmodel.grid[x][y][p] = defaultvalue;

        let frequencies = obj.frequencies || [];

        for (let arg = 3; arg < arguments.length; arg += 2) {
            let value = arguments[arg];
            let fract = arguments[arg + 1];
            frequencies.push([value,fract]);
        }
        
        for (let x = 0; x < gridmodel.nc; x++)                        // x are columns
            for (let y = 0; y < gridmodel.nr; y++){                    // y are rows
                let rand = this.rng.random();
                let fract = 0;
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
          if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
          if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
          if(freqs.reduce((a, b) => a + b) > 1) throw new Error("populateGrid should not have frequencies that sum up to greater than 1")
          for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
              for (let y = 0; y < gridmodel.nr; y++){                 // y are rows
                  for (const property in individuals[0]) {
                      gridmodel.grid[x][y][property] = 0;    
                  }
                  let random_number = this.rng.random();
                  let sum_freqs = 0;
                  for(let n=0; n<individuals.length; n++)
                  {
                      sum_freqs += freqs[n];
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
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
        let p = property || 'val';
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++) 
                if(background_state) gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr][p] = background_state;
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
   putSpot(gridmodel, property, value, size, putx, puty) {
         if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
        // Draw a circle
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
            for (let y = 0; y < gridmodel.nr; y++)                           // y are rows
            {
                if ((Math.pow((x - putx), 2) + Math.pow((y - puty), 2)) < size)
                    gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr][property] = value;
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
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
        let sumfreqs =0;
        if(individuals.length != freqs.length) throw new Error("populateGrid should have as many individuals as frequencies")
        for(let i=0; i<freqs.length; i++) sumfreqs += freqs[i];
        
        // Draw a circle
        for (let x = 0; x < gridmodel.nc; x++)                          // x are columns
        for (let y = 0; y < gridmodel.nr; y++)                           // y are rows
        {
            

            if ((Math.pow((x - putx), 2) + Math.pow((y - puty), 2)) < size)
            {
                let cumsumfreq = 0;
                let rand = this.rng.random();                
                for(let n=0; n<individuals.length; n++)
                {
                    cumsumfreq += freqs[n];
                    if(rand < cumsumfreq) {
                        Object.assign(gridmodel.grid[x % gridmodel.nc][y % gridmodel.nr],individuals[n]);
                        break
                    }
                }
            }
            else if(background_state) Object.assign(gridmodel.grid[x][y], background_state);
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
        button.id = text;
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
        //let parent = sim
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
        
        div = document.getElementById(div);
        let time = sim.time+1;
        let timestamp = time.toString();
        timestamp = timestamp.padStart(6, "0");

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
            canvas.recording = true;        
            
            canvas.elem.style.outline = '4px solid red';       
            sim.capturer = new CCapture( { format: 'webm', 
                                       quality: 100, 
                                       name: `${canvas.label}_starttime_${sim.time}`,
                                       framerate: fps,                                       
                                       display: false } );
            sim.capturer.start();            
            console.log("Started recording video.");
        }
    }
    captureFrame(canvas){
        if(canvas.recording){            
            sim.capturer.capture(canvas.elem);
        }
        
    }
    stopRecording(canvas){
        if(canvas.recording){
            canvas.recording = false;            
            canvas.elem.style.outline = '0px';       
            sim.capturer.stop();
            sim.capturer.save();            
            console.log("Video saved");
        }
    }
    makeMovie(canvas, fps=60){
        if(this.sleep > 0) throw new Error("Cacatoo not combine makeMovie with sleep. Instead, set sleep to 0 and set the framerate of the movie: makeMovie(canvas, fps).")     
        if(!sim.recording){ 
            sim.startRecording(canvas,fps);
            sim.recording=true;
        }
        else {
            sim.stopRecording(canvas);
            sim.recording=false;
        }
    }
        
    /**
     *  addToggle adds a HTML checkbox element to the DOM-environment which allows the user
     *  to flip boolean values
     *  @param {string} parameter The name of the (global!) boolean to link to the checkbox
     */
     addToggle(parameter, label, func) {
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
            if(func) func();
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
    *  Add a statedrawing posibility to this canvas
    *  @param {Gridmodel} gridmodel The gridmodel to which this canvas belongs
    *  @param {string} property the property that should be shown on the canvas
    *  @param {} value_to_place set @property to this value
    *  @param {int} brushsize radius of the brush
    *  @param {int} brushflow amounts of substeps taken (1 by default)
    */
    addStatebrush(gridmodel, property_to_change, value_to_place, brushsize, brushflow, canvas)
    {
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
        this.mouseDown = false;
        this.coords_previous = [];
        this.coords = [];
        let thissim = this;
        
        // var intervalfunc
        this.place_value = value_to_place;
        this.place_size = brushsize; 
        this.property_to_change = property_to_change;
        this.brushflow = brushflow || 1;
        
        if(!canvas){
            let canvs = gridmodel.canvases;
            canvas = canvs[Object.keys(canvs)[0]];
        }
        else {
            canvas = gridmodel.canvases[canvas];
        }

        // For mouse:
        canvas.elem.addEventListener('mousemove', (e) => { 
            thissim.coords_previous = thissim.coords;
            thissim.coords = sim.getCursorPosition(canvas,e,sim.config.scale); 
        });
        
        canvas.elem.addEventListener('mousedown', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow;     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x;
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))));
                    let dify = thissim.coords.y - thissim.coords_previous.y;
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))));
                    for(let q=0; q<steps; q++)
                    {
                        thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, seqx[q], seqy[q]);                    
                    }
                }
                else {
                    thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, thissim.coords.x, thissim.coords.y);                    
                }                
                canvas.displaygrid();
            }
            }, 10);
        });
        canvas.elem.addEventListener('mousedown', (e) => { thissim.mouseDown = true; });
        canvas.elem.addEventListener('mouseup', (e) => { thissim.mouseDown = false; });


        // For touch screens
        canvas.elem.addEventListener('touchmove', (e) => { 
            thissim.coords_previous = thissim.coords;
            thissim.coords = sim.getCursorPosition(canvas,e.touches[0],sim.config.scale); 
            e.preventDefault();
        });
        
        canvas.elem.addEventListener('touchstart', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow;     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x;
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))));
                    let dify = thissim.coords.y - thissim.coords_previous.y;
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))));
                    for(let q=0; q<steps; q++)
                    {
                        thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, seqx[q], seqy[q]);                    
                    }
                }
                else {
                    thissim.putSpot(gridmodel, thissim.property_to_change, thissim.place_value, thissim.place_size, thissim.coords.x, thissim.coords.y);                    
                }                
                canvas.displaygrid();
            }
            }, 10);
        });
        canvas.elem.addEventListener('touchstart', (e) => { thissim.mouseDown = true; });
        canvas.elem.addEventListener('touchend', (e) => { thissim.mouseDown = false; });
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
        if(typeof gridmodel === 'string' || gridmodel instanceof String) gridmodel = this[gridmodel];
        this.mouseDown = false;
        this.coords_previous = [];
        this.coords = [];
        let thissim = this;
        
        // var intervalfunc
           
        this.place_size = brushsize; 
        
        this.brushflow = brushflow || 1;
        if(!canvas){
            let canvs = gridmodel.canvases;
            canvas = canvs[Object.keys(canvs)[0]];
        }
        else {
            canvas = gridmodel.canvases[canvas];
        }
        
        canvas.elem.addEventListener('mousemove', (e) => { 
            thissim.coords_previous = thissim.coords;
            thissim.coords = sim.getCursorPosition(canvas,e,sim.config.scale); 
        });
        
        canvas.elem.addEventListener('mousedown', (e) => {    
            thissim.intervalfunc = setInterval(function() {
                
            if(thissim.mouseDown){
                
                let steps = thissim.brushflow;     

                if(steps > 1){                    
                    let difx = thissim.coords.x - thissim.coords_previous.x;
                    let seqx = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.x + (i * difx/(steps-1))));
                    let dify = thissim.coords.y - thissim.coords_previous.y;
                    let seqy = Array.from({ length: steps}, (_, i) => Math.round(thissim.coords_previous.y + (i * dify/(steps-1))));
                    for(let q=0; q<steps; q++)
                    {
                        thissim.populateSpot(gridmodel, [obj], [1], thissim.place_size, seqx[q], seqy[q]);                    
                    }
                }
                else {
                    thissim.populateSpot(gridmodel, [obj], [1], thissim.place_size, thissim.coords.x, thissim.coords.y);                    
                }                
                canvas.displaygrid();
            }
            }, 10);
        });
        canvas.elem.addEventListener('mousedown', (e) => { thissim.mouseDown = true; });
        canvas.elem.addEventListener('mouseup', (e) => { thissim.mouseDown = false; });
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
            for(let x =0; x<model.nc;x++){                
                for(let y=0;y<model.nr;y++){
                    let prop = model.grid[x][y][property] ? model.grid[x][y][property] : -1;
                    string += [x,y,prop].join('\t')+'\n';
                }                                       
            }
            fs.appendFileSync(filename, string);            
        }
    }
    

    /**
     * addMovieButton adds a standard button to record a video 
     * @param {@Model} model (@Gridmodel of @Flockmodel) containing the canvas to be recorded. 
     * @param {String} property The name of the display (canvas) to be recorded
     * 
    */
    addMovieButton(model,canvasname,fps=60){
        const simu = this;
        this.addButton("Record", function() {
            simu.makeMovie(model.canvases[canvasname],fps);        
        });
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
        label.style = "background-color: rgb(239, 218, 245);border-radius: 10px;border: 2px solid rgb(188, 141, 201);padding:7px;font-size:10px;margin:10px;width:128px;";
        label.innerHTML = "Select your own initial state";
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

                    for (let x = 0; x < grid.nc; x++) for (let y = 0; y < grid.nr; y++) grid.grid[x][y].alive = 0;
                    for (let x = 0; x < grid_data[0].length; x++)          // x are columns
                        for (let y = 0; y < grid_data.length; y++)             // y are rows
                        {
                            grid.grid[Math.floor(x + grid.nc / 2 - img.width / 2)][Math.floor(y + grid.nr / 2 - img.height / 2)][property] = grid_data[y][x];
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
     * Loads a PNG image and converts its pixel values to grid states, supporting both exact and range-based mappings.
     * If no state matches the mapping, the grid state remains unchanged.
     * @param {string} imageSource - The source of the image (local file path or URL).
     * @param {Object|Array} stateMapping - Either an object for exact pixel value mappings or an array for range-based mappings.
     * @param {string} gridName - The name of the grid in the simulation.
     * @param {string} stateName - The name of the state in the grid.
     * @param {Function} callback - A callback function to execute after the image is loaded and processed.
     */
    loadPNGToGrid(imageSource, stateMapping, gridName, stateName) {
        // Create an image object
        const img = new Image();
        img.crossOrigin = "Anonymous"; // For CORS if loading from a URL
        img.onload = function() {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;

            // Draw the image on the canvas
            ctx.drawImage(this, 0, 0);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Initialize the grid with the correct dimensions
            if(sim.ncol != canvas.width || sim.nrow != canvas.height){
            throw new Error("Cacatoo: dimensions of the image have to match the grid size!")
            }
            

            // Loop through each pixel and set the grid state based on the stateMapping
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4; // RGBA index
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const a = imageData[i + 3];
                    const pixelKey = `${r},${g},${b},${a}`;

                    // Determine the grid state based on the type of stateMapping
                    let matchedState = undefined; // Default to undefined (no change)

                    if (Array.isArray(stateMapping)) {
                        // Range-based mapping
                        for (const mapping of stateMapping) {
                            if (
                                r >= mapping.rMin && r <= mapping.rMax &&
                                g >= mapping.gMin && g <= mapping.gMax &&
                                b >= mapping.bMin && b <= mapping.bMax &&
                                a >= mapping.aMin && a <= mapping.aMax
                            ) {
                                matchedState = mapping.state;
                                break;
                            }
                        }
                    } else {
                        // Exact mapping
                        if (stateMapping[pixelKey] !== undefined) {
                            matchedState = stateMapping[pixelKey];
                        }
                    }

                    // Only update the grid state if a match is found
                    if (matchedState !== undefined) {
                        sim[gridName].grid[x][y] = { [stateName]: matchedState };
                    }
                }
            }

            // Update the display
            sim.display();
        };

        // Handle local files (for local use)
        if (imageSource instanceof File) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageSource);
        } else {
            // Load from URL
            img.src = imageSource;
        }
    };

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
        label.style = "background-color: rgb(239, 218, 245);border-radius: 10px;border: 2px solid rgb(188, 141, 201);padding:7px;font-size:10px;margin:10px;width:128px;";
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
