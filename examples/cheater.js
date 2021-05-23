
if(typeof window == "undefined") Simulation = require('../dist/cacatoo.js') // Loads the Simulation class for nodejs-mode

let sim;
var X2Y =1.0                    // Using var instead of let, so I can access it with sliders
var Y2X =1.0                    // Using var instead of let, so I can access it with sliders
var Y2Z =1.2                    // Using var instead of let, so I can access it with sliders
var NON=1.0                     // Using var instead of let, so I can access it with sliders
var death=0.2                   // Using var instead of let, so I can access it with sliders
let mdif_interval=5
let px, py, pz, psum

function setup()
{    
    
    let config = {
            title: "<span style=\"padding:5px;border-radius: 8px 0px 8px 0px;background:#dddddd;color:red\">Mutualists</span> and <span style=\"color: blue\">Cheaters</span>",
            description: "",
            maxtime: 100000,
            ncol : 200,            
            nrow : 200,		                                        // dimensions of the grid to build
            seed : 56,  
            fps : 60,                                                // Note: FPS can only be set in fastmode
            fastmode: true,                                                        
            throttlefps : false,                                     // Note: FPS throttling only useful at low targetfps OR when display() is the time-limiting step  
            wrap : [true, true],                                    // Wrap boundary [COLS, ROWS]
            scale : 2,				                                // scale of the grid (nxn pixels per grid point)
            statecolours: {'species':{1:"#DDDDDD",                  // If your state it not defined, it won't be drawn and you'll see the grid-background colour (default: black)
                                      2:"red",
                                      3:"blue"},
                           'alive':{1:"#CCCCCC"}}                 // Sets up colours of states. Here, die species state gets 4 colours. Can be a colour name or a hexadecimal colour. 
    }

    
    sim = new Simulation(config)                                          // Initialise a new Simulation instance with configuration given above 
    
    sim.makeGridModel("cheater")                                               // Make a new grid named cheater
    sim.initialGrid(sim.cheater,'species',1,0.33,2,0.33,3,0.33)         // Place 'species' in grid points (one third 1, one third 2, one third 3)            

    sim.displayGrid("cheater","species")                                  // Display the 'species' property of the cheater grid
    sim.displayGrid("cheater","alive")                                    // Display the 'alive' property of the cheater grid
    sim.displayGrid("cheater","species",20,20,20)                         // Display the 'species' property of a small bit of the grid
    

    sim.cheater.nextState = function(i,j)                                 // Define the next-state function. This example is two mutualists and a cheater
    {           
        let state = this.grid[i][j].species;
        
        if (state==0)                               // If there is no species here
        {
            // Count the number of species 1 (mutualist x), 2 (mutualist y), and 3 (cheater z)
            sumx= this.countMoore8(this,i,j,1,'species');  
            sumy= this.countMoore8(this,i,j,2,'species');
            sumz= this.countMoore8(this,i,j,3,'species');

            px= (Y2X*sumy)*sumx;
            py= (X2Y*sumx)*sumy;
            pz= (Y2Z*sumy)*sumz;
            psum=px+py+pz+NON;
            ran= this.rng.random();         // TODO REPLACE MATH.RANDOM WITH MERSENNE TWISTER


            //console.log(sumx, sumy, sumz)

            if (ran< px/psum)
                this.grid[i][j].species = 1
            else if (ran< (px+py)/psum)            
                this.grid[i][j].species = 2
            else if (ran< (px+py+pz)/psum)
                this.grid[i][j].species = 3
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
        this.plotPopsizes('species',[0,1,2,3]) 
        if(this.time%2==1) this.MargolusDiffusion()
        let sumX = 0
        let sumY = 0
        let sumZ = 0
        for(let i=0;i<this.nc;i++)          // i are columns
            for(let j=0;j<this.nr;j++)      // j are rows
            {     
                if(this.grid[i][j].species==1)  sumX++
                else if(this.grid[i][j].species==2)  sumY++
                else if(this.grid[i][j].species==3)  sumZ++
            }

        if(typeof window != 'undefined') 
        {
            this.plotArray(["Ratio X/Y", "Ratio Y/Z"], 
                            [sumX/sumY,sumY/sumZ],
                            ["gold","#FF00AA"],
                            "My custom plot (X/Y, Y/Z ratio)")
            

            this.plotXY(["Ratio X/Y", "Ratio Y/Z"], 
                [sumX/sumY,sumY/sumZ],
                ["black"],
                "My custom XY plot (X/Y vs Y/Z)", {drawPoints: true, strokeWidth:1, pointSize:2, strokePattern: [2,2]})
        }
        else if (this.time%10==0)
        {
            console.log(`Cheater at time point ${this.time}, has popsizes\t\t${ sim.cheater.getPopsizes('species',[0,1,2,3]) }`)    
        }
    }  

    
    
    sim.addButton("pause/continue",function() { sim.toggle_play()})            // Add a button that calls function "display" in "model"
    sim.addButton("mix grid",function() { sim.cheater.perfectMix()})           // Add a button that calls function "perfectMix" in "model.cheater"    
    sim.addButton("well-mix",function() { sim.toggle_mix()})                   // Add a button that calls function "perfectMix" in "model.cheater"  
    sim.addSlider("X2Y")
    sim.addSlider("Y2X")
    sim.addSlider("Y2Z")
    sim.addSlider("NON")
    sim.addSlider("death", 0.00, 1.00, 0.001)

    sim.start()
}

// For when cheater.js is ran from the command line
if(typeof window == "undefined")
{   

    setup()
}