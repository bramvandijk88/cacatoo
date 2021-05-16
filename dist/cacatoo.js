'use strict';

class Gridpoint 
{    
   constructor(template) 
    {        
        // This class only contains a copy-constructor, meaning that a new gridpoint will be made based on the passed template gridpoint
        // If no template is given, the object is empty (for initialisation, this is true)
        for (var prop in template) {
            this[prop] = template[prop];
        }
    }
}

class Canvas
{
    constructor(cols,rows,scale)
    {        
        this.height = rows;
        this.width = cols;
        this.scale = scale;

        if( typeof document !== "undefined" ){              // In browser, crease a new HTML canvas-element to draw on 
            this.elem = document.createElement("canvas");
            this.elem.className="grid-holder";
            this.elem.width = this.width*this.scale;
            this.elem.height = this.height*this.scale;   
            // document.body.appendChild(this.elem)         
            document.getElementById("canvas_holder").appendChild(this.elem);
            this.ctx = this.elem.getContext("2d");
	    	this.ctx.lineWidth = 1;
            this.ctx.fillStyle = "#AAAAAA";
            this.ctx.fillRect(0, 0, cols*scale, rows*scale);
            this.ctx.strokeRect(0, 0, cols*scale, rows*scale);
        } 
        else 
        {                                            // In nodejs, use canvas package, FIXING THIS LATER, FIRST STUDENT BROWSER-VERSION
			//const {createCanvas} = require("canvas")
			//this.elem = createCanvas( this.width*this.scale, this.height*this.scale)
            //this.fs = require("fs")
            console.log("WARNING: No canvas available in NodeJS-mode (yet)");
		}
		
    }
}

class Graph
{
    constructor(labels,values,colours,title,opts)
    {

        if(typeof window == undefined) throw "Using dygraphs with cashJS only works in browser-mode"                
        this.labels = labels;
        this.data = [values];
        this.title = title;
        this.num_dps = this.labels.length; // number of data points for this graphs        
        this.elem = document.createElement("div");
        this.elem.className="graph-holder";
        this.colours = [];       
        
        for(let v in colours)
        {
             if(v=="Time") continue    
             else if(colours[v][0]+colours[v][1]+colours[v][2] == 765) this.colours.push("#dddddd");       
             else this.colours.push(rgbToHex(colours[v][0],colours[v][1],colours[v][2]));        
        }
        
        document.body.appendChild(this.elem);         
        document.getElementById("graph_holder").appendChild(this.elem);
        this.g = new Dygraph(this.elem, this.data,
        {
            title: this.title,
            showRoller: false,
            ylabel: this.labels.length == 2 ? this.labels[1]: "",
            width: 600,
            height: 300,
            xlabel: this.labels[0],    
            drawPoints: opts && opts.drawPoints || false,
            pointSize: opts ? (opts.pointSize ? opts.pointSize : 0): 0,
            strokePattern: opts ? (opts.strokePattern ? opts.strokePattern : null) : null,
            dateWindow: [0,100],
            axisLabelFontSize: 10,    
            valueRange: [0.000, ],
            strokeWidth: opts ? opts.strokeWidth : 3,
            colors: this.colours,
            labels: this.labels            
        });
    }

    push_data(data_array)
    {
        this.data.push(data_array);
    }

    update(){
        let max_x = 0;
        let min_x = 999999999999;
        for(let i of this.data) 
        {
            if(i[0]>max_x) max_x = i[0];
            if(i[0]<min_x) min_x = i[0];
        }
        this.g.updateOptions( 
            {'file': this.data,
             dateWindow: [min_x,max_x]
        });
        
    }
}

function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
//if(r+g+b==765) return "#cccccc"
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// function hexToRgb(hex) {
// var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
// return result ? {
//     r: parseInt(result[1], 16),
//     g: parseInt(result[2], 16),
//     b: parseInt(result[3], 16)
// } : null;
// }

class ODE 
{    
   constructor(eq,state_vector,pars) 
    {        
        this.eq = eq;
        this.state = state_vector;
        this.pars = pars;
        this.solver = new Solver(state_vector.length);
    }

    solve_timestep(delta_t=0.1)
    {
        let newstate = this.solver.solve(
                     this.eq(...this.pars),      // function to solve and its pars (... unlists the array as a list of args)
                     0,                          // Initial x value
                     this.state,                  // Initial y value(s)
                     delta_t                           // Final x value            
                     ).y;
        this.state = newstate;
    }

    print_state()
    {
        console.log(this.state);
    }
        
}

// Class definition
class CA
{
    // Constructor
    constructor(name, config, rng)
    {
        // Make empty grid      
        this.name = name;
        this.time = 0;
        this.grid = MakeGrid(config.ncol,config.nrow);                 // Grid        
        this.nc = config.ncol || 200;
        this.nr = config.nrow || 200;
        this.wrap = config.wrap || [true, true]; 
        this.rng = rng;
        this.statecolours = this.setupColours(config.statecolours);
        this.scale = config.scale || 1;
        this.canvas = new Canvas(this.nc,this.nr,this.scale);  
        this.graphs = {};
    }

    displaygrid()
    {           
        let ctx = this.canvas.ctx;
        let scale = this.canvas.scale;
        let ncol = this.nc;
        let nrow = this.nr;

        ctx.clearRect(0,0,scale*ncol,scale*nrow);

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        

        for(let i=0;i<ncol;i++)         // i are cols
        {
            for(let j=0;j<nrow;j++)     // j are rows
            {               
                for(let prop in this.statecolours)
                {   
                    let state = this.statecolours[prop];                            
                                     
                    if (!(prop in this.grid[i][j])) continue
                    
                    let value = this.grid[i][j][prop];
                    
                    if(value == 0)
                        continue // Don't draw the background state
                    let idx = state;
                    if (state.constructor == Object) {
                        idx = state[value];
                    }
                    
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = idx[0];
                            pixels[off + 1] = idx[1];
                            pixels[off + 2] = idx[2];
                            //pixels[off + 3] = 255; // Last is always 255
                        }
                    }
                }

            }
        }
        ctx.putImageData(id, 0, 0);
    }
    
    /** Initiate a dictionary with colour arrays [R,G,B] used by Graph and Canvas classes
	*   @param {statecols} object - given object can be in two forms
    *                             | either {state:colour} tuple (e.g. 'alive':'white', see gol.html) 
    *                             | or {state:object} where objects are {val:'colour},
    *                             | e.g.  {'species':{0:"black", 1:"#DDDDDD", 2:"red"}}, see cheater.html 
    */
    setupColours(statecols)
    {        
       
        let return_dict = {};
        if(statecols == null)           // If the user did not define statecols (yet)
            return return_dict
        let colours = dict_reverse(statecols) || {'val':1};        
        
        
        for(const [statekey,statedict] of Object.entries(colours))
        {
            if(statedict == 'default')
            {
                return_dict[statekey]  = default_colours;                                 // Defined below
            }
            else if(typeof statedict ===  'string' || statedict instanceof String)       // For if 
            {
                return_dict[statekey] = stringToRGB(statedict);
            }
            else
            {
                let c = {};
                for(const [key,val] of Object.entries(statedict))
                {
                    let hex = stringToRGB(val);                
                    c[key] = hex;
                }
                return_dict[statekey] = c;
            }                                    
        }       
        return return_dict
    }

    colourRamp(property,arr1, arr2, n)
    {
        let return_dict = {};
        return_dict[property] = {};
        for(let i=0;i<n;i++)
        {
            
            return_dict[property][i] = [Math.floor(arr1[0]+arr2[0]*(i/n)), 
                                        Math.floor(arr1[1]+arr2[1]*(i/n)), 
                                        Math.floor(arr1[2]+arr2[2]*(i/n))];
        }
        this.statecolours = return_dict;
    }
    

    printgrid()
    {
        console.table(this.grid);
    }


    nextState(i,j){
        throw 'Nextstate function of \'' + this.name + '\' undefined';
    }

    synchronous()                                               // Do one step (synchronous) of this CA
    {
        let oldstate = MakeGrid(this.nc,this.nr,this.grid);     // Old state based on current grid
        let newstate = MakeGrid(this.nc,this.nr);               // New state == empty grid
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                this.nextState(i,j);                             // Update this.grid
                newstate[i][j] = this.grid[i][j];                // Set this.grid to newstate
                this.grid[i][j] = oldstate[i][j];                // Reset this.grid to old state
            }
        }
        this.grid = newstate;      
        this.time++;          
    }   

    asynchronous()
    {
        this.set_update_order();
        for (let n = 0; n < this.nc*this.nr; n++) 
        {            
            let m = this.upd_order[n];
            let i = m%this.nc; 
            let j = Math.floor(m/this.nr);            
            this.nextState(i,j);
        }
        // Don't have to copy the grid here. Just cycle through i,j in random order and apply nextState :)
    }

    set_update_order()
    {
        if (typeof this.upd_order === 'undefined')  // "Static" variable, only create this array once and reuse it
        {
            this.upd_order = [];
            for (let n = 0; n < this.nc*this.nr; n++) 
            {
                this.upd_order.push(n);
            }            
        }
        shuffle(this.upd_order,this.rng);            // Shuffle the update order
    }

    update()
    {
        throw 'Update function of \'' + this.name + '\' undefined';
    }

    countMoore9(ca,col,row,val,property)
    {    
        let count = 0;
        
        for(let v=-1;v<2;v++)   // Check +/-1 vertically 
        {
            for(let h=-1;h<2;h++) // Check +/-1 horizontally 
            {       
                let x = col+h;
                if(ca.wrap[0]) x = (col+h+ca.nc) % ca.nc; // Wraps neighbours left-to-right
                let y = row+v;
                if(ca.wrap[1]) y = (row+v+ca.nr) % ca.nr; // Wraps neighbours top-to-bottom
                if(x<0||y<0||x>=ca.nc||y>=ca.nr) continue
                
                let nval = ca.grid[x][y][property];                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }
    countMoore8(ca,col,row,val,property)
    {
        let count = this.countMoore9(ca,col,row,val,property);
        let minus_this = ca.grid[col][row][property] == val;
        if(minus_this) count--;
        return count
    }
    
    randMoore8(ca,col,row)
    {
        
    }

    getGridpoint(i,j)
    {
        let x = i;
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) return undefined               // TODO!!!!!!! Return border-state instead!
        else return this.grid[x][y]
    }

    setGridpoint(i,j,neigh)
    {
        let x = i;
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j;
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) this.grid[x][y] = undefined;    // TODO!!!!!!!! Return border-state instead!
        else this.grid[x][y] = neigh;
    }

    
    MargolusDiffusion()
    {
        if(!this.wrap[0] || !this.wrap[1]) 
        {
            console.log("Current implementation of Margolus diffusion requires wrapped boundaries.");
            throw new Error("Current implementation of Margolus diffusion requires wrapped boundaries.")
        }
        //   
        //   A  B
        //   D  C
        //   a = backup of A 
        //   rotate cw or ccw randomly
        let even = this.time%2==0;
        if((this.nc%2 + this.nr%2) > 0) throw "Do not use margolusDiffusion with an uneven number of cols / rows!"

        for(let i=0+even;i<this.nc;i+=2)
        {    
            for(let j=0+even;j<this.nr;j+=2)
            {
                // console.log(i,j)
                let old_A = new Gridpoint(this.grid[i][j]);
                let A = this.getGridpoint(i,j);
                let B = this.getGridpoint(i+1,j);
                let C = this.getGridpoint(i+1,j+1);
                let D = this.getGridpoint(i,j+1);
                
                if(this.rng.random() < 0.5)
                {
                    A = D;                           // cw
                    D = C; 
                    C = B;
                    B = old_A;
                }
                else
                {
                    A = B;
                    B = C;
                    C = D;
                    D = old_A;
                }
                this.setGridpoint(i,j,A);
                this.setGridpoint(i+1,j,B);
                this.setGridpoint(i+1,j+1,C);
                this.setGridpoint(i,j+1,D);                
            }
        }        
    }

    perfectMix()
    {
        let all_gridpoints = [];
        for(let i=0;i<this.nc;i++)
            for(let j=0;j<this.nr;j++)
                all_gridpoints.push(this.getGridpoint(i,j));
                
        all_gridpoints = shuffle(all_gridpoints, this.rng);    
                
        for(let i=0;i<all_gridpoints.length;i++)                
            this.setGridpoint(i%this.nc,Math.floor(i/this.nc),all_gridpoints[i]);                                
        return "Perfectly mixed the grid"
    }
    
    plotArray(graph_labels,graph_values,cols,title)
    {        
        
        if(!(title in this.graphs))
        {     
            cols = parseColours(cols);            
            graph_values.unshift(this.time);
            graph_labels.unshift("Time");                            
            this.graphs[title] = new Graph(graph_labels,graph_values,cols,title);
        }
        else 
        {
            if(this.time%5==0)
            {  
                graph_values.unshift(this.time);
                graph_labels.unshift("Time");
                this.graphs[title].push_data(graph_values);     
            }
            if(this.time%20==0)
            {
                this.graphs[title].update();
            }
        }
        
    }

    plotXY(graph_labels,graph_values,cols,title,opts)
    {
        if(!(title in this.graphs))
        {
            cols = parseColours(cols);                            
            this.graphs[title] = new Graph(graph_labels,graph_values,cols,title,opts);                        
        }
        else 
        {
            if(this.time%5==0)
            {  
                this.graphs[title].push_data(graph_values);     
            }
            if(this.time%20==0)
            {
                this.graphs[title].update();
            }
        }
        
    }

    plotPopsizes(property,values)
    {
        // Wrapper for plotXY function, which expects labels, values, colours, and a title for the plot:
        // Labels
        let graph_labels = [];
        for (let val of values) { graph_labels.push(property+'_'+val); }     

        // Values
        let popsizes = this.getPopsizes(property,values);
        //popsizes.unshift(this.time)
        let graph_values = popsizes;

        // Colours
        let colours = [];
        
        for(let c of values)
        {
            //console.log(this.statecolours[property][c])
            if(this.statecolours[property].constructor != Object)
                colours.push(this.statecolours[property]);
            else                        
                colours.push(this.statecolours[property][c]);
        }  
        // Title
        let title = "Population sizes ("+this.name+")";

        this.plotArray(graph_labels, graph_values, colours, title);
        
                  
                     
        //this.graph = new Graph(graph_labels,graph_values,colours,"Population sizes ("+this.name+")")                            
    }

    getPopsizes(property,values)
    {        
        let sum = Array(values.length).fill(0);
        for(let i = 0; i< this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                for(let val in values)
                    if(this.getGridpoint(i,j)[property] == values[val]) sum[val]++;
            }
        }
        return sum;
    }
    
    attachODE(eq,state_vector,pars,odename)
    {
        for(let i = 0; i< this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                let ode = new ODE(eq,state_vector,pars);
                
                if (typeof this.grid[i][j].ODEs == "undefined") this.grid[i][j].ODEs = [];   // If list doesnt exist yet                
                this.grid[i][j].ODEs.push(ode);
                if(odename) this.grid[i][j][odename] = ode;
            }
        }
    }

    solve_odes(delta_t=0.1)
    {
        for(let i = 0; i< this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                for(let ode of this.grid[i][j].ODEs)
                {                    
                    ode.solve_timestep(delta_t);
                }
            }
        }
    }

    printGrid(value, fract)
    {
        let ncol = this.nc;
        let nrow = this.nr;
        
        if(fract != undefined) ncol*=fract, nrow*=fract;
        //console.log(fract)
        let grid = new Array(nrow);             // Makes a column or <rows> long --> grid[cols]
        for(let i = 0; i< ncol; i++)
        {
            grid[i] = new Array(ncol);          // Insert a row of <cols> long   --> grid[cols][rows]
            for(let j=0;j<nrow;j++)
            {
                grid[i][j] = this.grid[i][j][value];
            }
        }
        console.table(grid);
    }
}



function MakeGrid(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let i = 0; i< cols; i++)
    {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let j=0;j<rows;j++)
        {
            if(template) grid[i][j] = new Gridpoint(template[i][j]); // Make real copy constructor for this, not just val!!
            else grid[i][j] = new Gridpoint();
        }
    }
    
    return grid;
}



// for(let i = 0; i < 100; i++)
// {
//     let f = 1-(i/100)
//     colours.push([f*255,f*255,255,255]) // Blue to white gradient
// }

function dict_reverse(obj) {
    let new_obj= {};
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function(i) { 
        new_obj[i] = obj[i];
    });
    return new_obj;
}

function shuffle(array,rng) {
    let i = array.length;
    while (i--) {
      const ri = Math.floor(rng.random() * (i + 1));
      [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
  }

function stringToRGB(val)
{
    if(val[0] != '#') return nameToRGB(val)
    else return hexToRGB(val)
}
function hexToRGB(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)]
}

function nameToRGB(string)
{
    let colours = {'black':      [0,0,0],          
                   'white':      [255,255,255],    
                   'red':        [255,0,0],             
                   'blue':       [0,0,255],              
                   'green':      [0,255,0],              
                   'darkgrey':   [40,40,40],           
                   'lightgrey':  [180,180,180],       
                   'violet':     [148, 0, 211],          
                   'turquoise':  [64, 224, 208],      
                   'orange':     [255, 165, 0],           
                   'gold':       [240,200,0],             
                   'nearwhite':  [200,200,200],
                   'grey':      [125,125,125]};
    let c = colours[string];
    if(c==undefined) throw new Error(`Cacatoo has no colour with name '${string}'`)
    return c
}

function parseColours(cols)
{
    let return_cols = [];
    for(let c of cols)
    {
        if(typeof c ===  'string' || c instanceof String) 
        {
            return_cols.push(stringToRGB(c));
        }
        else
        {
            return_cols.push(c);
        }
    }
    return return_cols
}


let default_colours = {
                  0:[0,0,0],            // black
                  1:[255,255,255],      // white
                  2:[255,0,0],          // red
                  3:[0,0,255],          // blue
                  4:[0,255,0],          //green      
                  5:[40,40,40],         //darkgrey    
                  6:[180,180,180],      //lightgrey   
                  7:[148, 0, 211],      //violet      
                  8:[64, 224, 208],     //turquoise   
                  9:[255, 165, 0],      //orange       
                  10:[240,200,0],       //gold       
                  11:[200,200,200],     //nearwhite
                  12:[125,125,125]};     //grey

class Model
{
    constructor(config)
    {                  
        this.config = config;
        this.rng = new MersenneTwister(config.seed || 53);
        this.sleep = config.sleep || 0;
        this.fps = config.fps || 60; 
        this.limitfps = true;
        if(config.limitfps==false) this.limitfps = false;                                       // Turbo allows multiple updates of the CA before the screen refreshes. It is faster, but it can be confusing if you see two or more changes happening at once. 
        this.CAs = [];
        this.time=0;
    }

    makeGrid(name)
    {
        let ca = new CA(name,this.config,this.rng);
        this[name] = ca;
        this.CAs.push(ca);
    }

    step()
    {        
        for(let ca of this.CAs)
            ca.update();
    }
    
    stop()
    {
        model.pause=true;
    }

    display()
    {
        for(let ca of this.CAs)
            ca.displaygrid();
    }

    start()
    {        
        let model = this;    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        if(typeof window != 'undefined')
        {
            let meter = new FPSMeter({show:'fps',left:"auto", top:"80px",right:"30px",graph:1,history:20});

            document.title = `Cacatoo - ${this.config.title}`;
            document.getElementById("header").innerHTML = `<h2>Cacatoo - ${this.config.title}</h2><font size=3>${this.config.description}</font size>`;
            document.getElementById("footer").innerHTML = "<h2>Cacatoo (<u>ca</u>sh-like <u>c</u>ellular <u>a</u>utomaton <u>too</u>lkit) is currently <a href=\"https://github.com/bramvandijk88/cacatoo\">under development</a>. Feedback <a href=\"https://www.bramvandijk.org/contact/\">very welcome.</a></h2>";
            let simStartTime = performance.now();
      
            async function animate()
            {   
                if(model.config.fastmode)          // Fast-mode tracks the performance so that frames can be skipped / paused / etc. Has some overhead, so use wisely!
                {
                    if(model.sleep>0) await pause(model.sleep);                                
                    
                    let t = 0;              // Will track cumulative time per step in microseconds 

                    while(t<16.67*60/model.fps)          //(t < 16.67) results in 60 fps if possible
                    {
                        let startTime = performance.now();
                        model.step();
                        let endTime = performance.now();            
                        t += (endTime - startTime);                    
                        model.time++;    
                        if(!model.limitfps) break        
                    }      
                    model.display();
                    meter.tick();                   
                }
                else                    // A slightly more simple setup, but does not allow controls like frame-rate, skipping every nth frame, etc. 
                {
                    meter.tickStart();
                    model.step();                                    
                    model.display();
                    meter.tick();
                    model.time++;  
                }
                
                let frame = requestAnimationFrame(animate);        
                if(model.time>=model.config.maxtime)
                { 
                    let simStopTime = performance.now();
                    console.log("Cacatoo completed after",Math.round(simStopTime-simStartTime)/1000,"seconds");
                    cancelAnimationFrame(frame);                
                }
                if(model.pause==true) { model.pause=false;cancelAnimationFrame(frame); }
                
            }
            
            requestAnimationFrame(animate);
        }
        else
        {
            while(true)
            {
                model.step();   
                model.time++;
            }
        }
    }

    initialGrid(ca,property,def_state)
    {
        let p = property || 'val';
        let bg = def_state;
        
        for(let i=0;i<ca.nc;i++)                          // i are columns
                for(let j=0;j<ca.nr;j++)                  // j are rows
                    ca.grid[i][j][p] = bg;
        
        for (let arg=3; arg<arguments.length; arg+=2)       // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<ca.nc;i++)                        // i are columns
                for(let j=0;j<ca.nr;j++)                    // j are rows
                    if(this.rng.random() < arguments[arg+1]) ca.grid[i][j][p] = arguments[arg];                    
    }

    initialPattern(ca,property,image_path, x, y)
    {
        if(typeof window != undefined)
        {
            for(let i=0;i<ca.nc;i++) for(let j=0;j<ca.nr;j++) ca.grid[i][j][property] = 0;                        
            let tempcanv = document.createElement("canvas");
            let tempctx = tempcanv.getContext('2d');
            var tempimg = new Image();                        
            tempimg.onload = function() 
            {                               
                tempcanv.width = tempimg.width;
                tempcanv.height = tempimg.height;
                tempctx.drawImage(tempimg,0,0);
                let grid_data = get2DFromCanvas(tempcanv);                                                        
                if(x+tempimg.width >= ca.nc || y+tempimg.height >= ca.nr) throw RangeError("Cannot place pattern outside of the canvas")                
                for(let i=0;i<grid_data[0].length;i++)         // i are columns
                for(let j=0;j<grid_data.length;j++)     // j are rows
                {                       
                    ca.grid[x+i][y+j][property] = grid_data[j][i];
                }                
                ca.displaygrid();              
            };                
            
            tempimg.src=image_path;   
            tempimg.crossOrigin="anonymous";
            
        }
        else
        {
            console.error("initialPattern currently only supported in browser-mode");
        }
        
    }
    
    addPatternButton(targetca, property)
    {        
        let imageLoader = document.createElement("input"); 
        imageLoader.type  = "file";       
        imageLoader.id = "imageLoader";
        imageLoader.style="display:none";
        imageLoader.name="imageLoader";
        document.getElementById("form_holder").appendChild(imageLoader);
        let label = document.createElement("label");
        label.setAttribute("for","imageLoader");
        label.style="background-color: rgb(171, 228, 230); border-radius: 10px; border:1px solid grey;padding:5px;width:200px;";
        label.innerHTML="Select your own initial state";
        document.getElementById("form_holder").appendChild(label);
        let canvas = document.createElement('canvas');
        canvas.name="imageCanvas";
        let ctx = canvas.getContext('2d');
        function handleImage(e)
        {
            let reader = new FileReader();
            let grid_data;
            
            let ca = e.currentTarget.ca; 
            reader.onload = function(event)
            {
                var img = new Image();        
                img.onload = function()
                {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img,0,0);
                    
                    grid_data = get2DFromCanvas(canvas);
                    
                    for(let i=0;i<ca.nc;i++) for(let j=0;j<ca.nr;j++) ca.grid[i][j].alive = 0;
                    for(let i=0;i<grid_data[0].length;i++)          // i are columns
                    for(let j=0;j<grid_data.length;j++)             // j are rows
                    {                                     
                        ca.grid[Math.floor(i+ca.nc/2-img.width/2)][Math.floor(j+ca.nr/2-img.height/2)][property] = grid_data[j][i];
                    }
                     
                    
                };
                img.src = event.target.result;
            };              
            reader.readAsDataURL(e.target.files[0]);
            document.getElementById("imageLoader").value = "";
    }

    imageLoader.addEventListener('change', handleImage, false);
    imageLoader.ca = targetca;    // Bind a ca to imageLoader 
    imageLoader.property = property;
    }    
}

/**
* Delay for a number of milliseconds
*/
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve,timeoutMsec));

function get2DFromCanvas(canvas)
{
    let width = canvas.width;
    let height = canvas.height;
    let ctx = canvas.getContext('2d');    
    let img1 = ctx.getImageData(0, 0, width, height); 
    let binary = new Array(img1.data.length);
    let idx = 0;
    for (var i = 0; i < img1.data.length; i+=4) 
    {            
        let num = [img1.data[i],img1.data[i+1],img1.data[i+2]];
        let state; 
        // console.log(num)
        if(JSON.stringify(num) == JSON.stringify([0,0,0])) state = 0;
        else if(JSON.stringify(num) == JSON.stringify([255,255,255])) state = 1;
        else if(JSON.stringify(num) == JSON.stringify([255,0,0])) state = 2;
        else if(JSON.stringify(num) == JSON.stringify([0,0,255])) state = 3;
        else throw RangeError("Colour in your pattern does not exist in cash")
        binary[idx] = state;
        idx++;
    }

    const arr2D = [];
    let rows = 0;
    while(rows < height) 
    {
        arr2D.push(binary.splice(0,width));
        rows++;
    }
    return arr2D
}

module.exports = Model;
