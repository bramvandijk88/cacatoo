import Gridpoint from "./gridpoint.js"
import Graph from './graph.js'
import ODE from "./ode.js"
import MersenneTwister from "../lib/mersenne.js"

/**
 *  GridModel is the main (currently only) type of model in Cacatoo. Most of these models
 *  will look and feel like CAs, but GridModels can also contain ODEs with diffusion, making
 *  them more like PDEs. 
 */

class GridModel
{
    /**
    *  The constructor function for a @GridModel object. Takes the same config dictionary as used in @Simulation
    *  @param {string} name The name of your model. This is how it will be listed in @Simulation 's properties
    *  @param {dictionary} config A dictionary (object) with all the necessary settings to setup a Cacatoo GridModel. 
    *  @param {MersenneTwister} rng A random number generator (MersenneTwister object)
    */
    constructor(name, config, rng)
    {
        this.name = name
        this.time = 0        
        this.grid = MakeGrid(config.ncol,config.nrow)       // Initialises an (empty) grid
        this.nc = config.ncol || 200
        this.nr = config.nrow || 200
        this.wrap = config.wrap || [true, true]
        this.rng = rng
        this.statecolours = this.setupColours(config.statecolours) // Makes sure the statecolours in the config dict are parsed (see below)
        this.scale = config.scale || 1

        this.graph_update = config.graph_update || 20
        this.graph_interval = config.graph_interval || 2
        
        this.margolus_phase = 0
        // Store a simple array to get neighbours from the N, E, S, W, NW, NE, SW, SE (analogous to Cash2.1)
        this.moore = [[0,0],         // SELF   _____________
             [0,-1],        // NORTH           | 5 | 1 | 6 |
             [1,0],         // EAST            | 4 | 0 | 2 |
             [0,1],         // SOUTH           | 7 | 3 | 8 |
             [-1,0],        // WEST            _____________
             [-1,-1],       // NW
             [1,-1],        // NE
             [-1,1],        // SW
             [1,1]          // SE
            ]

        this.graphs = {}                // Object containing all graphs belonging to this model (HTML usage only)
        this.canvases = {}              // Object containing all Canvases belonging to this model (HTML usage only)
    }
    
    /** Initiate a dictionary with colour arrays [R,G,B] used by Graph and Canvas classes
	*   @param {statecols} object - given object can be in two forms
    *                             | either {state:colour} tuple (e.g. 'alive':'white', see gol.html) 
    *                             | or {state:object} where objects are {val:'colour},
    *                             | e.g.  {'species':{0:"black", 1:"#DDDDDD", 2:"red"}}, see cheater.html 
    */
    setupColours(statecols)
    {
        let return_dict = {}
        if(statecols == null)           // If the user did not define statecols (yet)
            return return_dict
        let colours = dict_reverse(statecols) || {'val':1}        
        
        
        for(const [statekey,statedict] of Object.entries(colours))
        {
            if(statedict == 'default')
            {
                return_dict[statekey]  = default_colours                                 // Defined below
            }
            else if(typeof statedict ===  'string' || statedict instanceof String)       // For if 
            {
                return_dict[statekey] = stringToRGB(statedict)
            }
            else
            {
                let c = {}
                for(const [key,val] of Object.entries(statedict))
                {
                    let hex = stringToRGB(val)                
                    c[key] = hex
                }
                return_dict[statekey] = c
            }                                    
        }       
        return return_dict
    }

    
    /** Initiate a gradient of colours for a property. 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * For example usage, see colourViridis below
    */ 
    colourGradient(property,n)
    {
        let n_arrays = arguments.length-2
        if(n_arrays <= 1) throw new Error ("colourGradient needs at least 2 arrays")
        
        let segment_len = n/(n_arrays-1)

        let color_dict = this.statecolours[property]
        let total = 0
        if(typeof color_dict != 'undefined')
            total = Object.keys(this.statecolours[property]).length
        else 
            color_dict = {}

        for(let arr=0;arr<n_arrays-1;arr++)
        {   
            let arr1 = arguments[2+arr]
            let arr2 = arguments[2+arr+1]
            /// HIER BEN IK MEE BEZIG!!!
            for(let i=0;i<segment_len;i++)
            {            
                let r,g,b
                if(arr2[0]>arr1[0]) r = Math.floor(arr1[0] + (arr2[0]-arr1[0])*(i/(segment_len-1)))                
                else r = Math.floor(arr1[0] - (arr1[0]-arr2[0])*(i/(segment_len-1)))
                if(arr2[1]>arr1[1]) g = Math.floor(arr1[1] + (arr2[1]-arr1[1])*(i/(segment_len-1)))                
                else g = Math.floor(arr1[0] - (arr1[1]-arr2[1])*(i/(segment_len-1)))
                if(arr2[2]>arr1[2]) b = Math.floor(arr1[2] + (arr2[2]-arr1[2])*(i/(segment_len-1)))                
                else b = Math.floor(arr1[2] - (arr1[2]-arr2[2])*(i/(segment_len-1)))
                
                color_dict[i+arr*segment_len+total] = [ r, g, b ]
            }
            // total += segment_len
        }

        this.statecolours[property] = color_dict
    }
    
    /** Initiate a gradient of colours for a property, using the Viridis colour scheme (purpleblue-ish to green to yellow) 
    * @param {string} property The name of the property to which the colour is assigned
    * @param {int} n How many colours the gradient consists off
    * @param {bool} rev Reverse the viridis colour gradient
    */ 
     colourViridis(property,n,rev=false)
     {
         if(!rev) this.colourGradient(property,n,[68,1,84],[59,82,139],[33,144,140],[93,201,99],[253,231,37])         // Viridis
         else this.colourGradient(property,n,[253,231,37],[93,201,99],[33,144,140],[59,82,139],[68,1,84])             // Viridis
     }

    /** Print the entire grid to the console */
    printgrid()
    {
        console.table(this.grid);
    }

    /** The most important function in GridModel: how to determine the next state of a gridpoint?
     * By default, nextState is empty. It should be defined by the user (see examples)
    * @param {int} i Position of grid point to update (column)
    * @param {int} j Position of grid point to update (row)
    */ 
    nextState(i,j){
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
        let oldstate = MakeGrid(this.nc,this.nr,this.grid);     // Old state based on current grid
        let newstate = MakeGrid(this.nc,this.nr);               // New state == empty grid
        
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                this.nextState(i,j)                             // Update this.grid
                newstate[i][j] = this.grid[i][j]                // Set this.grid to newstate
                this.grid[i][j] = oldstate[i][j]                // Reset this.grid to old state
            }
        }
        this.grid = newstate;
        this.time++
    }
    
    /** Like the synchronous function above, but can not take a custom user-defined function rather
     *  than the default next-state function. Technically one should be able to refarctor this by making
     *  the default function of synchronous "nextstate". But this works. :)
    */ 
    apply_sync(func)
    {
        let oldstate = MakeGrid(this.nc,this.nr,this.grid);     // Old state based on current grid
        let newstate = MakeGrid(this.nc,this.nr);               // New state == empty grid
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                func(i,j)                           // Update this.grid
                newstate[i][j] = this.grid[i][j]                // Set this.grid to newstate
                this.grid[i][j] = oldstate[i][j]                // Reset this.grid to old state
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
    asynchronous()
    {
        this.set_update_order()
        for (let n = 0; n < this.nc*this.nr; n++) 
        {               
            let m = this.upd_order[n]
            let i = m%this.nc 
            let j = Math.floor(m/this.nc)      
            this.nextState(i,j)
        }
        this.time++
        // Don't have to copy the grid here. Just cycle through i,j in random order and apply nextState :)
    }

    /** Analogous to apply_sync(func), but asynchronous */
    apply_async(func)
    {
        this.set_update_order()
        for (let n = 0; n < this.nc*this.nr; n++) 
        {            
            let m = this.upd_order[n]
            let i = m%this.nc 
            let j = Math.floor(m/this.nc)            
            func(i,j)
        }
    }

    /** If called for the first time, make an update order (list of ints), otherwise just shuffle it. */
    set_update_order()
    {
        if (typeof this.upd_order === 'undefined')  // "Static" variable, only create this array once and reuse it
        {
            this.upd_order = []
            for (let n = 0; n < this.nc*this.nr; n++) 
            {
                this.upd_order.push(n)
            }            
        }
        shuffle(this.upd_order,this.rng)            // Shuffle the update order
    }

    /** The update is, like nextState, user-defined (hence, empty by default).
     *  It should contains all functions that one wants to apply every time step
     *  (e.g. grid manipulations and printing statistics) 
     *  For example, and update function could look like:
     *  this.synchronous()         // Update all cells  
     *  this.MargolusDiffusion()   // Apply Toffoli Margolus diffusion algorithm
     *  this.plotPopsizes('species',[1,2,3]) // Plot the population sizes
        */          
    update()
    {
        throw 'Update function of \'' + this.name + '\' undefined';
    }

    /** Count the number of grid points in the Moore (9) neighbourhood which have
     *  a certain value (val) for a certain property. 
     *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
     *  but can be mixed to make grids interact.
     *  @param {int} col position (column) for the focal gridpoint
     *  @param {int} row position (row) for the focal gridpoint
     *  @param {int} val what value should the GP have to be counted
     *  @param {string} property the property that is counted
     * 
     *  For example, if one wants to count all the "cheater" surrounding a gridpoint in cheater.js,
     *  one needs to look for value '3' in the property 'species':
     *  this.countMoore9(this,10,10,3,'species');  
     */ 
    countMoore9(grid,col,row,val,property)
    {    
        let count = 0;
        
        for(let v=-1;v<2;v++)   // Check +/-1 vertically 
        {
            for(let h=-1;h<2;h++) // Check +/-1 horizontally 
            {       
                let x = col+h
                if(grid.wrap[0]) x = (col+h+grid.nc) % grid.nc; // Wraps neighbours left-to-right
                let y = row+v
                if(grid.wrap[1]) y = (row+v+grid.nr) % grid.nr; // Wraps neighbours top-to-bottom
                if(x<0||y<0||x>=grid.nc||y>=grid.nr) continue
                
                let nval = grid.grid[x][y][property]                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }

    /** Count the number of grid points in the Moore (8) neighbourhood which have
     *  a certain value (val) for a certain property. 
     *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
     *  but can be mixed to make grids interact.
     *  @param {int} col position (column) for the focal gridpoint
     *  @param {int} row position (row) for the focal gridpoint
     *  @param {int} val what value should the GP have to be counted
     *  @param {string} property the property that is counted
     * 
     *  For example, if one wants to count all the "cheater" surrounding a gridpoint in cheater.js,
     *  one needs to look for value '3' in the property 'species':
     *  this.countMoore8(this,10,10,3,'species');  
     */ 
    countMoore8(grid,col,row,val,property)
    {
        let count = this.countMoore9(grid,col,row,val,property)
        let minus_this = grid.grid[col][row][property] == val
        if(minus_this) count--
        return count
    }

    /** Return a random neighbour from the Moore (8) neighbourhood
     *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
     *  but can be mixed to make grids interact.
     *  @param {int} col position (column) for the focal gridpoint
     *  @param {int} row position (row) for the focal gridpoint
     */ 
    randomMoore8(grid,col,row)
    {
        let rand = this.rng.genrand_int(1,8)  
        let i = this.moore[rand][0]
        let j = this.moore[rand][1]
        let neigh = grid.getGridpoint(col+i,row+j)
        while(neigh == undefined) neigh = this.randomMoore8(grid,col,row); 
        return neigh
    }

    /** Return a random neighbour from the Moore (9) neighbourhood (self inclusive)
     *  @param {GridModel} grid The gridmodel used to check neighbours. Usually the gridmodel itself (i.e., this), 
     *  but can be mixed to make grids interact.
     *  @param {int} col position (column) for the focal gridpoint
     *  @param {int} row position (row) for the focal gridpoint
     */ 
    randomMoore9(grid,col,row)
    {
        let rand = model.rng.genrand_int(0,8)        
        let i = moore[rand][0]
        let j = moore[rand][1]
        let neigh = grid.getGridpoint(col+i,row+j)
        while(neigh == undefined) neigh = this.randomMoore8(grid,col,row)
        return neigh
    }



    /** Get the gridpoint at coordinates i,j 
     *  Makes sure wrapping is applied if necessary
     *  @param {int} i position (column) for the focal gridpoint
     *  @param {int} j position (row) for the focal gridpoint
     */ 
    getGridpoint(i,j)
    {
        let x = i
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) return undefined                      // If sampling neighbour outside of the grid, return empty object
        else return this.grid[x][y]
    }

    /** Change the gridpoint at position i,j into gp
         *  Makes sure wrapping is applied if necessary
         *  @param {int} i position (column) for the focal gridpoint
         *  @param {int} j position (row) for the focal gridpoint
         *  @param {Gridpoint} @Gridpoint object to set the gp to
    */ 
    setGridpoint(i,j,gp)
    {
        let x = i
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) this.grid[x][y] = undefined    // TODO!!!!!!!! Return border-state instead!
        else this.grid[x][y] = gp
    }

    /** Get the x,y coordinates of a neighbour in an array. 
     *  Makes sure wrapping is applied if necessary
     */ 
    getNeighXY(i,j)
    {
        let x = i
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) return undefined                      // If sampling neighbour outside of the grid, return empty object
        else return [x,y]
    }

    /** Diffuse ODE states on the grid. Because ODEs are stored by reference inside gridpoint, the 
     *  states of the ODEs have to be first stored (copied) into a 4D array (x,y,ODE,state-vector), 
     *  which is then used to update the grid.
     */ 
    diffuseOdeStates()
    {                
        let newstates_2 = CopyGridODEs(this.nc,this.nr,this.grid)    // Generates a 4D array of [i][j][o][s] (i-coord,j-coord,relevant ode,state-vector)    

        for(let i=0;i<this.nc;i+=1) // every column
        {    
            for(let j=0;j<this.nr;j+=1) // every row
            {
                for(let o=0;o<this.grid[i][j].ODEs.length;o++) // every ode
                {
                    for(let s=0;s<this.grid[i][j].ODEs[o].state.length;s++) // every state
                    {                        
                        let rate = this.grid[i][j].ODEs[o].diff_rates[s]
                        let sum_in = 0.0                       
                        for(let n=1;n<=4;n++)   // Every neighbour (neumann)
                        {
                            let moore = this.moore[n]                                                        
                            let xy = this.getNeighXY(i+moore[0],j+moore[1])
                            if(typeof xy=="undefined") continue                            
                            let neigh = this.grid[xy[0]][xy[1]]                            
                            sum_in += neigh.ODEs[o].state[s]*rate 
                            // sum_in += 0.1
                            newstates_2[xy[0]][xy[1]][o][s] -= neigh.ODEs[o].state[s]*rate
                        }
                        newstates_2[i][j][o][s] += sum_in
                    }
                }               
            }
        }

        for(let i=0;i<this.nc;i+=1) // every column
            for(let j=0;j<this.nr;j+=1) // every row
                for(let o=0;o<this.grid[i][j].ODEs.length;o++)
                    for(let s=0;s<this.grid[i][j].ODEs[o].state.length;s++)
                        this.grid[i][j].ODEs[o].state[s] = newstates_2[i][j][o][s]
        
    }

    /** Assign each gridpoint a new random position on the grid. This simulated mixing,
     *  but does not guarantee a "well-mixed" system per se (interactions are still)
     *  calculated based on neighbourhoods. 
     */ 
    perfectMix()
    {
        let all_gridpoints = [];
        for(let i=0;i<this.nc;i++)
            for(let j=0;j<this.nr;j++)
                all_gridpoints.push(this.getGridpoint(i,j))
                
        all_gridpoints = shuffle(all_gridpoints, this.rng)    
                
        for(let i=0;i<all_gridpoints.length;i++)                
            this.setGridpoint(i%this.nc,Math.floor(i/this.nc),all_gridpoints[i])
        return "Perfectly mixed the grid"
    }
     /** Apply diffusion algorithm for grid-based models described in Toffoli & Margolus' book "Cellular automata machines"
      *  The idea is to subdivide the grid into 2x2 neighbourhoods, and rotate them (randomly CW or CCW). To avoid particles
      *  simply being stuck in their own 2x2 subspace, different 2x2 subspaces are taken each iteration (CW in even iterations,
      *  CCW in odd iterations)
     */ 
    MargolusDiffusion()
    {
        if(!this.wrap[0] || !this.wrap[1]) 
        {
            console.log("Current implementation of Margolus diffusion requires wrapped boundaries.")
            throw new Error("Current implementation of Margolus diffusion requires wrapped boundaries.")
        }
        //   
        //   A  B
        //   D  C
        //   a = backup of A 
        //   rotate cw or ccw randomly
        let even = this.margolus_phase%2==0
        if((this.nc%2 + this.nr%2) > 0) throw "Do not use margolusDiffusion with an uneven number of cols / rows!"

        for(let i=0+even;i<this.nc;i+=2)
        {    
            for(let j=0+even;j<this.nr;j+=2)
            {
                // console.log(i,j)
                let old_A = new Gridpoint(this.grid[i][j]);
                let A = this.getGridpoint(i,j)
                let B = this.getGridpoint(i+1,j)
                let C = this.getGridpoint(i+1,j+1)
                let D = this.getGridpoint(i,j+1)
                
                if(this.rng.random() < 0.5)             // CW = clockwise rotation
                {
                    A = D                           
                    D = C 
                    C = B
                    B = old_A
                }
                else
                {
                    A = B                               // CCW = counter clockwise rotation      
                    B = C
                    C = D
                    D = old_A
                }
                this.setGridpoint(i,j,A)
                this.setGridpoint(i+1,j,B)
                this.setGridpoint(i+1,j+1,C)
                this.setGridpoint(i,j+1,D)                
            }
        }        
        this.margolus_phase++
    }

 
    
    plotArray(graph_labels,graph_values,cols,title,opts)
    {        
        if(typeof window == 'undefined') return
        if(!(title in this.graphs))
        {     
            cols = parseColours(cols)            
            graph_values.unshift(this.time)
            graph_labels.unshift("Time")                            
            this.graphs[title] = new Graph(graph_labels,graph_values,cols,title,opts)
        }
        else 
        {
            if(this.time%this.graph_interval==0)
            {  
                graph_values.unshift(this.time)
                graph_labels.unshift("Time")
                this.graphs[title].push_data(graph_values)     
            }
            if(this.time%this.graph_update==0)
            {
                this.graphs[title].update()
            }
        }        
    }

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

    plotPopsizes(property,values)
    {
        if(typeof window == 'undefined') return
        if(this.time%this.graph_interval!=0 && this.graphs[`Population sizes (${this.name})`] !== undefined) return
        // Wrapper for plotXY function, which expects labels, values, colours, and a title for the plot:
        // Labels
        let graph_labels = []
        for (let val of values) { graph_labels.push(property+'_'+val) }     

        // Values
        let popsizes = this.getPopsizes(property,values)
        //popsizes.unshift(this.time)
        let graph_values = popsizes

        // Colours
        let colours = []
        
        for(let c of values)
        {
            //console.log(this.statecolours[property][c])
            if(this.statecolours[property].constructor != Object)
                colours.push(this.statecolours[property])
            else                        
                colours.push(this.statecolours[property][c])
        }  
        // Title
        let title = "Population sizes ("+this.name+")"

        this.plotArray(graph_labels, graph_values, colours, title)
        
                  
                     
        //this.graph = new Graph(graph_labels,graph_values,colours,"Population sizes ("+this.name+")")                            
    }

    getPopsizes(property,values)
    {        
        let sum = Array(values.length).fill(0)
        for(let i = 0; i< this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                for(let val in values)
                    if(this.grid[i][j][property] == values[val]) sum[val]++                    
            }
        }
        return sum;
    }

    
    
    attachODE(eq,conf)
    {        
        for(let i=0; i<this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                let ode = new ODE(eq,conf.init_states,conf.parameters,conf.diffusion_rates,conf.ode_name)                
                if (typeof this.grid[i][j].ODEs == "undefined") this.grid[i][j].ODEs = []   // If list doesnt exist yet                
                this.grid[i][j].ODEs.push(ode)
                if(conf.ode_name) this.grid[i][j][conf.ode_name] = ode
            }
        }
    }

    solve_all_odes(delta_t=0.1, opt_pos=false)
    {
        for(let i=0; i<this.nc; i++)
        {            
            for(let j=0;j<this.nr;j++)
            {
                for(let ode of this.grid[i][j].ODEs)
                {                    
                    ode.solve_timestep(delta_t,opt_pos)
                }
            }
        }
    }
    

    printGrid(value, fract)
    {
        let ncol = this.nc
        let nrow = this.nr
        
        if(fract != undefined) ncol*=fract, nrow*=fract
        //console.log(fract)
        let grid = new Array(nrow);             // Makes a column or <rows> long --> grid[cols]
        for(let i = 0; i< ncol; i++)
        {
            grid[i] = new Array(ncol);          // Insert a row of <cols> long   --> grid[cols][rows]
            for(let j=0;j<nrow;j++)
            {
                grid[i][j] = this.grid[i][j][value]
            }
        }
        console.table(grid)
    }
}

export default GridModel



function MakeGrid(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let i = 0; i< cols; i++)
    {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let j=0;j<rows;j++)
        {
            if(template) grid[i][j] = new Gridpoint(template[i][j]);  // Make a deep or shallow copy of the GP 
            else grid[i][j] = new Gridpoint();
        }
    }
    
    return grid;
}

function CopyGridODEs(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let i = 0; i< cols; i++)
    {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let j=0;j<rows;j++)
        {            
            for(let o=0;o<template[i][j].ODEs.length;o++) // every ode
            {
                grid[i][j] = []
                let states = []
                for(let s=0;s<template[i][j].ODEs[o].state.length;s++) // every state
                    states.push(template[i][j].ODEs[o].state[s])
                grid[i][j][o] = states;
            }     
        }
    }
    
    return grid;
}

function dict_reverse(obj) {
    let new_obj= {}
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function(i) { 
        new_obj[i] = obj[i];
    })
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
                   'grey':      [125,125,125]}
    let c = colours[string]
    if(c==undefined) throw new Error(`Cacatoo has no colour with name '${string}'`)
    return c
}

function parseColours(cols)
{
    let return_cols = []
    for(let c of cols)
    {
        if(typeof c ===  'string' || c instanceof String) 
        {
            return_cols.push(stringToRGB(c))
        }
        else
        {
            return_cols.push(c)
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
                  12:[125,125,125]}     //grey

                  

