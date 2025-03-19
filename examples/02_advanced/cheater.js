// Example usage a project that can run in both browser and NODE. 
// It also uses a dummy-class for if you want an OOP-project 


if (typeof window == "undefined") 
{  
    Simulation = require('../../dist/cacatoo.js') // Loads the Simulation class for nodejs-mode    
    Dummy = require('./cheater_classes.js').Dummy
}

let sim;
// Using var instead of let, so I can access it with sliders
var A2B = 1.0                    // Mutualist species A giving help to reproduce B
var B2A = 1.0                    // Mutualist species B giving help to reproduce A
var B2C = 1.2                    // Mutualist species B giving help to reproduce C ("cheater")
var stay_empty = 1.0               // Constant which scales the probability that nothing happens when competing for empty grid point, iow "stay empty"
var death = 0.2                  // Death rate of individuals
let mdif_interval = 0


function cacatoo() {
    

    let config = {                                                      // Configuration of your model. How large is the grid, how long will it run, what colours will the critters be, etc. 
        title: "Mutualists and cheaters",
        description: "",
        maxtime: 50000,
        ncol: 100,
        nrow: 100,		                                            // dimensions of the grid to build
        wrap: [true, true],                                        // Wrap boundary [COLS, ROWS]
        seed: 56,
        scale: 2,				                                    // scale of the grid (nxn pixels per grid point)            
        graph_interval: 10,
        graph_update: 50,
        statecolours: {
            'species': {
                0: "black",
                1: "#FFFFFF",                      // Sets up colours of states (here 1,2,3 = A,B,C). Can be a colour name or a hexadecimal colour. 
                2: "red",                          // If your state it not defined, it won't be drawn and you'll see the grid-background colour (default: black)
                3: "#3030ff"
            }
        }
    }

    let mydummyclass = new Dummy()
    mydummyclass.greet()

    sim = new Simulation(config)                                                // Initialise a new Simulation instance with configuration given above 
            
    sim.makeGridmodel("cheater")                                                // Make a new gridmodel named cheater
    //sim.initialGrid(sim.cheater, 'species', 1, 2, 0.33, 3, 0.33)          // Place the three 'species' in grid points (33% A, 33% B, 33% C)            
    sim.initialGrid({gridmodel: sim.cheater, property: 'species',
                     default: 1, frequencies: [[2,0.33], [3,0.33]]})          // Place the three 'species' in grid points (33% A, 33% B, 33% C)            
    sim.createDisplay("cheater", "species", "Mutualists and cheater")                               // Display the 'species' property of the cheater grid
    sim.createDisplay("cheater", "species", "(zoom in on top-left)", 20, 20, 20)                    // Display the 'species' property of a small bit of the grid (i.e. zoom in)
    sim.spaceTimePlot("cheater", "Mutualists and cheater", "Space-time plot", 5, 300)              // Make a space-time plot based on the canvas "mutualists and cheater" called "Space-time plot". Draw row 10. Width 400. 
    
    /**
    * Define your next-state function here: for each grid point, what determines what that grid point will be like next timestep?
    */
    sim.cheater.nextState = function (x, y)                               // Define the next-state function. This example is two mutualists and a cheater
    {
        // let pA, pB, pC, psum             
        let state = this.grid[x][y].species;
        if (state == 0)                                                   // If there is no species here
        {
            sumA = this.countMoore8(this, x, y, 'species',1);               // Count the number of species 1 (mutualist A)
            sumB = this.countMoore8(this, x, y, 'species',2);               // Count the number of species 2 (mutualist B)
            sumC = this.countMoore8(this, x, y, 'species',3);               // Count the number of species 3 (mutualist C)

            pA = (B2A * sumB) * sumA;                                        // Chance that A wins
            pB = (A2B * sumA) * sumB;                                        // Chance that B wins
            pC = (B2C * sumB) * sumC;                                        // Chance that C wins
            psum = pA + pB + pC + stay_empty;                                   // Total = pA+pB+pC+stay_empty (scales the chance that nothing happens during competition)

            ran = this.rng.random();                                     // Draw a single random number which decides 1 winner from "roulette wheel" (see below)
                        
            if (ran < pA / psum)                                           // <-ran->                                     (A wins)
                this.grid[x][y].species = 1                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            else if (ran < (pA + pB) / psum)                                 //        <-ran->                              (B wins)
                this.grid[x][y].species = 2                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            else if (ran < (pA + pB + pC) / psum)                              //               <--ran-->                     (C wins)
                this.grid[x][y].species = 3                             // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            //                        <-----ran----->      (no winner, spot stays empty for now)
            // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN      
        }

        if (this.rng.random() < death)                                    // Stochastic death (species become 0, which is an empty space for the next step to compete over)
            this.grid[x][y].species = 0
    }

    /**
    * Define your update-function here: stuff that is applied to the entire grid every timestep. E.g. apply the next-state, diffuse stuff, mix individuals, show graphs, etc. 
    */
    sim.cheater.update = function () {
        if(this.time != sim.cheater.time) throw new Error("Huh?")
        this.synchronous()                                              // Update all grid points based on the next-state function (defined above)                
        if(this.time != sim.cheater.time) throw new Error("Huh?")
        if (this.time % mdif_interval == 0) this.MargolusDiffusion()         // Every so often mix individuals a bit
        this.updateGraphs()    
        if(this.time != sim.cheater.time) throw new Error("Huh?")
    }

    /**
    * OPTIONAL: add some graphs to show how your model progresses. Cacatoo currently supports three graph types, all of which are illustrated in this example
    */
    sim.cheater.updateGraphs = function () {
        // Let's count some stuff every update
        let sumA = 0
        let sumB = 0
        let sumC = 0
        for (let x = 0; x < this.nc; x++)          // x are columns
            for (let y = 0; y < this.nr; y++)      // y are rows
            {
                if (this.grid[x][y].species == 1) sumA++
                else if (this.grid[x][y].species == 2) sumB++
                else if (this.grid[x][y].species == 3) sumC++
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
        // if(this.time == 1000) sim.stop() // Forces a manual stop
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
    sim.addSlider("A2B")
    sim.addSlider("B2A")
    sim.addSlider("B2C")
    sim.addSlider("stay_empty", 0.00, 20.00, 0.01)
    sim.addSlider("death", 0.00, 1.00, 0.001)
    sim.addMovieButton(sim.cheater, "Mutualists and cheater")
    sim.start()
}

/**
* cheater.js can be included in a browser, but can also run from the command line if the line below is included
*/
if (typeof window == "undefined") cacatoo()