
 
//EXAMPLE FILE Checkpointing (HTML)

//This example illustrates how to use 'checkpoints'. Checkpoints are files written to the disk from 
//which the grid-state can be recovered. This can be useful if you want to continue a certain simulation,
//but vary the parameters.     


if (typeof window == "undefined") 
{  
    Simulation = require('../../dist/cacatoo.js') // Loads the Simulation class for nodejs-mode    
}
//if (typeof window == "undefined") Simulation = require('cacatoo') // ... if you have cacatoo installed via npm install cacatoo


let sim;
// Using var instead of let, so I can access it with sliders
var A2B = 1.0                    // Mutualist species A giving help to reproduce B
var B2A = 1.0                    // Mutualist species B giving help to reproduce A
var B2C = 1.2                    // Mutualist species B giving help to reproduce C ("cheater")
var stay_empty = 1.0               // Constant which scales the probability that nothing happens when competing for empty grid point, iow "stay empty"
var death = 0.2                  // Death rate of individuals
let mdif_interval = 0

/**
* function cacatoo() contains all the user-defined parts of a cacatoo-model. Configuration, update rules, what is displayed or plotted, etc. It's all here.
*/
function cacatoo() {
    /*
        1. SETUP. First, set up a configuration-object. Here we define how large the grid is, how long will it run, what colours will the critters be, etc. 
    */
    let config = {                                                      // Configuration of your model. How large is the grid, how long will it run, what colours will the critters be, etc. 
        title: "Mutualists and cheaters",
        description: "",
        maxtime: 20000,
        ncol: 100,
        nrow: 100,		                                            // dimensions of the grid to build
        wrap: [true, true],                                        // Wrap boundary [COLS, ROWS]
        seed: 56,
        fps: 60,                                                   // Note: FPS can only be set in fastmode
        fastmode: false,
        scale: 2,				                                    // scale of the grid (nxn pixels per grid point)            
        graph_interval: 1,
        graph_update: 1,
        statecolours: {
            'species': {
                0: "black",
                1: "#FFFFFF",                      // Sets up colours of states (here 1,2,3 = A,B,C). Can be a colour name or a hexadecimal colour. 
                2: "red",                          // If your state it not defined, it won't be drawn and you'll see the grid-background colour (default: black)
                3: "#3030ff"
            }            
        }
    }

    /*
        1. SETUP. (continued) Now, let's use that configuration-object to generate a new Cacatoo simulation
    */
    sim = new Simulation(config)                                                // Initialise a new Simulation instance with configuration given above 
            
    sim.makeGridmodel("cheater")                                                // Make a new gridmodel named cheater
    sim.initialGrid(sim.cheater, 'species', 1, 0.33, 2, 0.33, 3, 0.33)          // Place the three 'species' in grid points (33% A, 33% B, 33% C)            

    for (let i = 0; i < sim.cheater.nc; i++) for (let j = 0; j < sim.cheater.nr; j++) 
    {
        sim.cheater.grid[i][j].births = [0,0,0] 
    }
    sim.createDisplay("cheater", "species", "Mutualists and cheater")                               // Display the 'species' property of the cheater grid
    sim.createDisplay_continuous({model:"cheater", property:"cheaterbirths", label:"Cheater birth heatmap", minval:0, maxval:100, num_colours:40, fill: 'viridis'})                               // Display the 'species' property of the cheater grid
    // sim.createDisplay_continuous({model:"cheater", "births", "Number of birth events in grid points for each species type")                               // Display the 'species' property of the cheater grid
    
    /**
    * Define your next-state function here: for each grid point, what determines what that grid point will be like next timestep?
    */
    sim.cheater.nextState = function (i, j)                               // Define the next-state function. This example is two mutualists and a cheater
    {
        // let pA, pB, pC, psum             
        let state = this.grid[i][j].species;
        if (state == 0)                                                   // If there is no species here
        {
            sumA = this.countMoore8(this, i, j, 'species',1);               // Count the number of species 1 (mutualist A)
            sumB = this.countMoore8(this, i, j, 'species',2);               // Count the number of species 2 (mutualist B)
            sumC = this.countMoore8(this, i, j, 'species',3);               // Count the number of species 3 (mutualist C)

            pA = (B2A * sumB) * sumA;                                        // Chance that A wins
            pB = (A2B * sumA) * sumB;                                        // Chance that B wins
            pC = (B2C * sumB) * sumC;                                        // Chance that C wins
            psum = pA + pB + pC + stay_empty;                                   // Total = pA+pB+pC+stay_empty (scales the chance that nothing happens during competition)

            ran = this.rng.random();                                     // Draw a single random number which decides 1 winner from "roulette wheel" (see below)
            
            if (ran < pA / psum)                                           // <-ran->                                     (A wins)
            {
                this.grid[i][j].species = 1                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
                this.grid[i][j].births[0]++
            }
            else if (ran < (pA + pB) / psum)                                 //        <-ran->                              (B wins)
            {
                this.grid[i][j].species = 2
                this.grid[i][j].births[1]++                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            }
            else if (ran < (pA + pB + pC) / psum)                              //               <--ran-->                     (C wins)
            {
                this.grid[i][j].species = 3                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
                this.grid[i][j].births[2]++
                this.grid[i][j].cheaterbirths = 100
            }
            this.grid[i][j].cheaterbirths--
            //                        <-----ran----->      (no winner, spot stays empty for now)
            // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN      
        }

        if (this.rng.random() < death)                                    // Stochastic death (species become 0, which is an empty space for the next step to compete over)
            this.grid[i][j].species = 0
    }

    /**
    * Define your update-function here: stuff that is applied to the entire grid every timestep. E.g. apply the next-state, diffuse stuff, mix individuals, show graphs, etc. 
    */
    sim.cheater.update = function () {
        this.synchronous()                                              // Update all grid points based on the next-state function (defined above)        
        if(this.time == 1) {
            let timestamp = this.time.toString().padStart(6,'0')
            let filename = `examples/03_expert/cheater_${timestamp}.json`
            this.save_grid(filename)        
        }
        if(this.time > 0 && this.time % 100 == 0) sim.toggle_play()
        
        if(this.time == 50) this.load_grid("examples/03_expert/cheater_000001.json")   // When you don't have a reload-button, this is how you reload. For this example, it reloads the grid after 50 timesteps.
        console.log(this.getPopsizes('species',[1,2,3]))
        if (this.time % mdif_interval == 0) this.MargolusDiffusion()         // Every so often mix individuals a bit
        this.updateGraphs()                                             // OPTIONAL: add some graphs (see function below)
    }

    /**
    * OPTIONAL: add some graphs to show how your model progresses. Cacatoo currently supports three graph types, all of which are illustrated in this example
    */
    sim.cheater.updateGraphs = function () {
        // Let's count some stuff every update
        let sumA = 0
        let sumB = 0
        let sumC = 0
        for (let i = 0; i < this.nc; i++)          // i are columns
            for (let j = 0; j < this.nr; j++)      // j are rows
            {
                if (this.grid[i][j].species == 1) sumA++
                else if (this.grid[i][j].species == 2) sumB++
                else if (this.grid[i][j].species == 3) sumC++
            }

        // Update the plots. If the plot do not yet exist, a new plot will be automatically added by cacatoo
        this.plotPopsizes('species', [1, 2, 3])
        this.plotArray(["Ratio A/B", "Ratio B/C"],
            [sumA / sumB, sumB / sumC],
            ["gold", "#FF00AA"],
            "My custom plot (A/B, B/C ratio)")
        this.plotXY(["Ratio A/B", "Ratio B/C"],
            [sumA / sumB, sumB / sumC],
            ["black"],
            "My custom XY plot (X/Y vs Y/Z)", { drawPoints: true, strokeWidth: 1, pointSize: 2, strokePattern: [2, 2] })

        if (this.time % 100 == 0)       // Otherwise, just print some numbers (e.g. popsizes)
        {
            sim.log(`Cheater at time point ${this.time}, has popsizes\t\t${sim.cheater.getPopsizes('species', [1, 2, 3])}`, "output")            
            //if(!sim.inbrowser) sim.write_grid(sim.cheater,'species',`species_at_T${this.time}.dat`,warn=false)    // Example of how to write a grid-property to a file. Currently only works in NODEJS mode (i.e not in browser). 
        }
        
    }

    /**
    * OPTIONAL: add some buttons and sliders so you can play with your model easily
    */
    sim.addButton("pause/continue", function () { sim.toggle_play() })              // Add a button that calls function "display" in "model"
    sim.addButton("mix once", function () { sim.cheater.perfectMix() })            // Add a button that calls function "perfectMix" in "model.cheater"    
    sim.addButton("well-mix", function () { sim.toggle_mix() })                    // Add a button that calls function "perfectMix" in "model.cheater"  
    sim.addCheckpointButton("cheater")
    // sim.addSlider("A2B")
    // sim.addSlider("B2A")
    // sim.addSlider("B2C")
    // sim.addSlider("stay_empty", 0.00, 20.00, 0.01)
    // sim.addSlider("death", 0.00, 1.00, 0.001)

    sim.start()
}

/**
* cheater.js can be included in a browser, but can also run from the command line if the line below is included
*/
if (typeof window == "undefined") cacatoo()