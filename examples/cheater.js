
if(typeof window == "undefined") Simulation = require('../dist/cacatoo.js') // Loads the Simulation class for nodejs-mode

let sim;
// Using var instead of let, so I can access it with sliders
var A2B =1.0                    // Mutualist species A giving help to reproduce B
var B2A =1.0                    // Mutualist species B giving help to reproduce A
var B2C =0.8                    // Mutualist species B giving help to reproduce C ("cheater")
var p_nothing=1.0               // Probability that nothing happens when competing for empty grid point
var death=0.2                   // Death rate of individuals
let mdif_interval=2


function setup()
{    
    
    let config = {
            title: "Mutualists and cheaters",
            description: "",
            maxtime: 100000,
            ncol : 150,            
            nrow : 150,		                                        // dimensions of the grid to build
            seed : 56,  
            fps : 60,                                                // Note: FPS can only be set in fastmode
            fastmode: true,                                                        
            throttlefps : false,                                     // Note: FPS throttling only useful at low targetfps OR when display() is the time-limiting step  
            wrap : [true, true],                                    // Wrap boundary [COLS, ROWS]
            scale : 2,				                                // scale of the grid (nxn pixels per grid point)            
            statecolours: {'species':{1:"#DDDDDD",                // Sets up colours of states (here 1,2,3 = A,B,C). Can be a colour name or a hexadecimal colour. 
                                      2:"red",                    // If your state it not defined, it won't be drawn and you'll see the grid-background colour (default: black)
                                      3:"blue"},
                           'alive':{1:"#CCCCCC"}}                 
    }

    
    sim = new Simulation(config)                                            // Initialise a new Simulation instance with configuration given above 
    
    sim.makeGridModel("cheater")                                            // Make a new gridmodel named cheater
    sim.initialGrid(sim.cheater,'species',1,0.33,2,0.33,3,0.33)             // Place the three 'species' in grid points (33% a, 33% b, 33% c)            

    sim.createDisplay("cheater","species")                                  // Display the 'species' property of the cheater grid
    sim.createDisplay("cheater","alive")                                    // Display the 'alive' property of the cheater grid
    sim.createDisplay("cheater","species",20,20,15)                         // Display the 'species' property of a small bit of the grid
    
    sim.cheater.nextState = function(i,j)                                 // Define the next-state function. This example is two mutualists and a cheater
    {         
        // let pA, pB, pC, psum              
        let state = this.grid[i][j].species;
        
        if (state==0)                               // If there is no species here
        {
            // Count the number of species 1 (mutualist x), 2 (mutualist y), and 3 (cheater z)
            sumA= this.countMoore8(this,i,j,1,'species');  
            sumB= this.countMoore8(this,i,j,2,'species');
            sumC= this.countMoore8(this,i,j,3,'species');

            pA= (B2A*sumB)*sumA;                // Chance that A wins
            pB= (A2B*sumA)*sumB;                // Chance that B wins
            pC= (B2C*sumB)*sumC;                // Chance that C wins
            psum=pA+pB+pC+p_nothing;            // Total = pA+pB+pC+p_nothing (scales the chance that nothing happens during competition)

            ran= this.rng.random();             // Draw a single random number which decides 1 winner from "roulette wheel" (see below)
                                                            
            if (ran< pA/psum)                   // <-ran->                                     (A wins)
                this.grid[i][j].species = 1     // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            else if (ran< (pA+pB)/psum)         //        <-ran->                              (B wins)
                this.grid[i][j].species = 2     // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
            else if (ran< (pA+pB+pC)/psum)      //               <--ran-->                     (C wins)
                this.grid[i][j].species = 3     // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN
                                                //                        <-----ran----->      (no winner)
                                                // AAAAAAABBBBBBBCCCCCCCCCNNNNNNNNNNNNNNN      
        }
        else
        {
            if (this.rng.random()<death)
                this.grid[i][j].species = 0
        }
        this.grid[i][j].alive = state > 0 ? 1: 0    // If state is greater than 0, than set alive to 1
    }


    sim.cheater.update = function()
    {
        this.synchronous()
        this.plotPopsizes('species',[1,2,3]) 
        if(this.time%mdif_interval==1) this.MargolusDiffusion()
        let sumA = 0
        let sumB = 0
        let sumC = 0
        for(let i=0;i<this.nc;i++)          // i are columns
            for(let j=0;j<this.nr;j++)      // j are rows
            {     
                if(this.grid[i][j].species==1)  sumA++
                else if(this.grid[i][j].species==2)  sumB++
                else if(this.grid[i][j].species==3)  sumC++
            }
        
        this.plotArray(["Ratio A/B", "Ratio B/C"], 
                        [sumA/sumB,sumB/sumC],
                        ["gold","#FF00AA"],
                        "My custom plot (X/Y, Y/Z ratio)")
        

        this.plotXY(["Ratio A/B", "Ratio B/C"], 
            [sumA/sumB,sumB/sumC],
            ["black"],
            "My custom XY plot (X/Y vs Y/Z)", {drawPoints: true, strokeWidth:1, pointSize:2, strokePattern: [2,2]})        
        if (this.time%100==0)       // Otherwise, just print some numbers (e.g. popsizes)
        {
            console.log(`Cheater at time point ${this.time}, has popsizes\t\t${ sim.cheater.getPopsizes('species',[1,2,3]) }`)    
        }
    }  

    
    
    sim.addButton("pause/continue",function() { sim.toggle_play()})            // Add a button that calls function "display" in "model"
    sim.addButton("mix grid",function() { sim.cheater.perfectMix()})           // Add a button that calls function "perfectMix" in "model.cheater"    
    sim.addButton("well-mix",function() { sim.toggle_mix()})                   // Add a button that calls function "perfectMix" in "model.cheater"  
    sim.addSlider("A2B")
    sim.addSlider("B2A")
    sim.addSlider("B2C")
    sim.addSlider("p_nothing")
    sim.addSlider("death", 0.00, 1.00, 0.001)

    sim.start()
}

// For when cheater.js is ran from the command line
if(typeof window == "undefined")
{   

    setup()
}