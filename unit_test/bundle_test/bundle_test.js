
// In this "bundle test", most of the functionalities in Cacatoo are called, and it is checked whether any unexpected behaviour occurs. 

if (typeof window == "undefined") Simulation = require('../dist/cacatoo.js') // Loads the Simulation class for nodejs-mode

let sim;

var birth = 1.0                    // Mutualist species A giving help to reproduce B
var death = 0.1                    // Mutualist species B giving help to reproduce A


function cacatoo() {
    let config = {                                                      
        title: "Simulation test",
        description: "Unit test (sort of...) that checks if implemented functions are working as intended",
        maxtime: 1000,
        ncol: 100,
        nrow: 100,		                                           
        wrap: [true, true],                                        
        seed: 56,
        fps: 60,           
        fpsmeter: false,
        sleep: 1,        
        fastmode: false,
        scale: 2,				                                   
        graph_interval: 10,
        graph_update: 50,
        statecolours: { 'discrete_var': { 1: "gold", 2: [255,0,0], 3: "#3030ff"}, // Setup colours with the 3 available options
                        'continuous_var': 'viridis'                              // Setup colour gradient
                      },
        num_colours: 100,
        skipbg_state: true,
        show_gridname: true,
        printcursor: false,
    }

    sim = new Simulation(config)                                              

    sim.makeGridmodel("model")                                                
    sim.initialGrid(sim.model, 'discrete_var', 1, 0.33, 2, 0.33, 3, 0.33)
    sim.initialGrid(sim.model, 'continuous_var', 100, 1.0)
    sim.initialGrid(sim.model, 'continuous_var2', 100, 1.0)

    sim.createDisplay("model", "discrete_var", "Discrete variable")                    
    sim.spaceTimePlot("model", "Discrete variable", "Space-time (discr)", 50, sim.ncol)                                  
    sim.createDisplay("model", "discrete_var", "(zoom in on grid)", 20, 20, 10)            

    sim.createDisplay_continuous({model:"model", property:"continuous_var", label:"Some continuous variable", minval:0, maxval:100}) 
    sim.spaceTimePlot("model", "Some continuous variable", "Space-time (continuous)", 50, sim.ncol)                        
    sim.createDisplay_continuous({model:"model", property:"continuous_var2", label:"Some continuous variable 2", minval:0, maxval:100, num_colours: 20, fill: 'inferno'}) 
    

   
    sim.model.nextState = function (i, j)                               
    {
        let state = this.grid[i][j].discrete_var;
        neigh = this.randomMoore8(this, i, j);               
        sum = this.countMoore8(this, i, j, 'discrete_var',2);         
            
        if (state == 0)                                                 
        {
            
            //conc = this.countMoore8(this, i, j, 'species',3);   
            ran = this.rng.random();                              

            if (this.rng.random() < birth)                        
                this.grid[i][j].discrete_var = neigh.discrete_var 
           
        }

        if (state == 1) 
            this.grid[i][j].continuous_var = 100
        else 
            this.grid[i][j].continuous_var -= sum            


        this.grid[i][j].continuous_var2 -= sum
        if(this.grid[i][j].continuous_var2 < 0)this.grid[i][j].continuous_var2 = 0
        if(this.grid[i][j].continuous_var < 0)this.grid[i][j].continuous_var = 0

        if (this.rng.random() < death)
        {   
            this.grid[i][j].continuous_var2 = 100                         
            this.grid[i][j].discrete_var = 0
        }
    }

    
    sim.model.update = function () {

        this.synchronous()      // Synchronous update update
        this.asynchronous()     // Asynchronous update update

        if(this.time == 2)
        {
        let before = this.getPopsizes('discrete_var', [1, 2, 3])
        this.MargolusDiffusion() 
        let after = this.getPopsizes('discrete_var', [1, 2, 3])        
        if(!arraysMatch(before,after)) throw new Error("Cacatoo:MagolusDiffusion resulted in an unexpected change in the population size. This needs to be resolved.")
        }
        if(this.time == 1)
        {
            before = this.getPopsizes('discrete_var', [1, 2, 3])
            this.perfectMix() 
            after = this.getPopsizes('discrete_var', [1, 2, 3])        
            if(!arraysMatch(before,after)) throw new Error("Cacatoo:MagolusDiffusion resulted in an unexpected change in the population size. This needs to be resolved.")
        }

        if(sim.inbrowser) sim.log(`Time: ${sim.time}`, "output")
        sim.log(`Time: ${sim.time}`)
        this.plotPopsizes('discrete_var', [1, 2, 3],{width:300, height:200})
        let sumcont = 0
        let sumcont2 = 0
        let cont_array = []

        for (let i = 0; i < this.nc; i++)          // i are columns
            for (let j = 0; j < this.nr; j++)      // j are rows
            {
                if(this.rng.random() < 0.01) cont_array.push(this.grid[i][j].continuous_var)
                sumcont += this.grid[i][j].continuous_var 
                sumcont2 += this.grid[i][j].continuous_var2                
            }
        this.plotArray(["Conc 1", "Conc 2"],
            [sumcont, sumcont2],
            ["gold", "#FF5500"],
            "Plot Continuous values", {max_y:1e6,min_y: 0, strokeWidth:2, strokePattern: [10,2], drawPoints:true, pointSize:3, width:300, height:200})
        this.plotPoints(cont_array,"Draw sampled values",{width:300, height:200})       
    }

    sim.addButton("pause/continue", function () { sim.toggle_play() })              // Add a button that calls function "display" in "model"
    sim.addButton("mix once", function () { sim.model.perfectMix() })            // Add a button that calls function "perfectMix" in "model.cheater"    
    sim.addButton("well-mix", function () { sim.toggle_mix() })                    // Add a button that calls function "perfectMix" in "model.cheater"  
    sim.addSlider("birth", 0.00, 1.00, 0.001)
    sim.addSlider("death", 0.00, 1.00, 0.001)    

    sim.start()
}

let arraysMatch = function (arr1, arr2) {
	if (arr1.length !== arr2.length) return false;

	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

if (typeof window == "undefined") cacatoo()

