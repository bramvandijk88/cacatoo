// This is an example of how you can use Cacatoo in nodejs-mode. Please note that this assumes cacatoo
// was installed via the node package manager (npm), as well as some other packages:
// npm install cacatoo      BASE CACATOO
// npm install fs           WRITING TO FILES
// npm install yargs        READING COMMAND LINE OPTIONS

// usage: node petridish.js --mu 0.00005

//Simulation = require('cacatoo') // Loads the Simulation class from installation, or from local package like below
Simulation = require('../../dist/cacatoo') // Loads the Simulation class from installation, or from local package like below
let yargs = require('yargs')
let cmd_params = yargs(process.argv).argv

let birth_rate = 0.85   
let mutationrate = cmd_params.mu ? cmd_params.mu : 0.00005
let death_rate_growing = 0.3
let mutations_required = 1

let config = {
    maxtime: 6000,    
    ncol: 300,
    nrow: 300,		            // dimensions of the grid to build
    wrap: [true, true],       // Wrap boundary [COLS, ROWS]   
    graph_interval: 10,
    graph_update: 20,
    seed: 3
}

let sim = new Simulation(config)
sim.makeGridmodel("cells");
sim.initialSpot(sim.cells, 'alive', 1, 2, sim.cells.nr / 2, sim.cells.nc / 2)            
sim.initialGrid(sim.cells, 'age', 0)
            
// Defining the local rules ('nextState')
sim.cells.nextState = function (j, y){              
    if (this.grid[j][y].alive == 0) {
        let neighbour = this.randomMoore8(this, j, y)             
        if (neighbour.alive > 0 && sim.rng.genrand_real1() < birth_rate) {
            this.grid[j][y].alive = neighbour.alive
            if (sim.rng.genrand_real1() < mutationrate) this.grid[j][y].alive = (this.grid[j][y].alive + 1) % 19
        }
    }
    else {
        if (this.grid[j][y].age < 10 && this.grid[j][y].alive <= mutations_required && sim.rng.genrand_real1() < death_rate_growing)
            this.grid[j][y].alive = 0
        else
            this.grid[j][y].age++
    }
}

// Defining the update loop 
sim.cells.update = function () {        
    
    // Apply local update rules for every grid point synchronously
    
    this.synchronous()         

    // Write to file / the terminal every once in a while
    if(sim.time%25==0){
        let mutational_frequencies = sim.cells.getPopsizes('alive', [1, 2, 3,4,5])
        sim.log(`Genotype frequencies in petridish at time ${sim.time}:\t${mutational_frequencies}`)        
        if(sim.time==0) sim.write("time\twildtype\tmutant1\tmutant2\tmutant3\tmutant4\n", "output_directory/genotype_freqs.dat") // use sim.write to make a header for the output file
        sim.write_append(sim.time+'\t'+mutational_frequencies.join('\t')+'\n', "output_directory/genotype_freqs.dat")                 // append single line to the file
        if(this.time%100==0) sim.write_grid(sim.cells,'alive', `output_directory/grid_${sim.time}.dat`) // use sim.write to make a header for the output file
    }
    if(sim.time==600) process.exit()
}

sim.start()
