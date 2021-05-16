
   /* 
   Instead of running Cacatoo in the browser, one can run it from the command line 
   to get a lot more speed and have easier ways to write to files. Here's a simple
   example. 
   
   Most of this is the same code as the browser-based version, but it uses 'require'
   to load the cacatoo module. 
   */


let Model = require('./dist/cacatoo.js')
fs = require('fs')
// ## NPM INSTALL CANVAS?!

console.log("Starting GoL in NODE mode")

//let model;

let config = {
        title: "Game of Life",
        maxtime: 100000,
        fastmode: true,             // Slightly faster display (especially for simpler models like GoL), but you can't change the framerate. 
        ncol : 200,            
        nrow : 200,		            // dimensions of the grid to build
        wrap : [true, true],        // Wrap boundary [COLS, ROWS]   
        scale : 3,				    // scale of the grid (nxn pixels per CA cell)
        statecolours: {'alive':1}   // The background state '0' is never drawn
}


let model = new Model(config)

model.makeGrid("gol");    
//model.initialPattern(model.gol, 'alive', 'patterns/glider.png', 10, 10)
model.initialGrid(model.gol,'alive',0,1,0.5)        

model.gol.nextState = function(i,j)       // Define the next-state function. This example is game of life
{   
    // Count living neighbours
    let neighbours = model.gol.countMoore8(this,i,j,1,'alive')              // In the Moore8 neighbourhood of this CA count # of 1's for the 'alive' property        
    // Get own state
    let state = this.grid[i][j].alive;            
    // Apply the three rules of GoL
    if(state == 0 && neighbours == 3)
    {
        this.grid[i][j].alive = 1;
    }
    else if(state == 1 && (neighbours < 2 || neighbours > 3))
        this.grid[i][j].alive = 0;
    else
        this.grid[i][j].alive = state;
}

fs.writeFileSync("GoL_output.txt","Time\tLiving\tDead\n")
console.log("Time\tLiving\tDead")

model.gol.update = function()
{
    this.synchronous()         // Applied as many times as it can in 1/60th of a second    
    count_popsizes = this.getPopsizes('alive',[0,1])
    if(model.time%10==0)
        {
            process.stdout.write(model.time+"\t"+count_popsizes[1]+"\t"+count_popsizes[0]+'\n')
            fs.appendFileSync("GoL_output.txt",(model.time+"\t"+count_popsizes[1]+"\t"+count_popsizes[0]+'\n').toString())
        }
    
    if(model.time>=model.options.maxtime) exit(0)

}

model.start()
