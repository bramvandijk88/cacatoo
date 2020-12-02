import CA from "./ca"
import {MersenneTwister} from '../lib/mersenne.js'


class World
{
    constructor(opts)
    {                  
        this.options = opts
        this.rng = new MersenneTwister(opts.seed || 53);
        this.sleep = opts.sleep || 0
        this.targetfps = opts.targetfps || 60
        this.throttlefps = true
        if(opts.throttlefps==false) this.throttlefps = false                                       // Turbo allows multiple updates of the CA before the screen refreshes. It is faster, but it can be confusing if you see two or more changes happening at once. 
        this.CAs = []
    }

    makeCA(name)
    {
        let ca = new CA(name,this.options,this.rng)
        this[name] = ca
        this.CAs.push(ca)
    }

    step()
    {
        for(let ca of this.CAs)
            ca.update()
    }

    display()
    {
        for(let ca of this.CAs)
        {
            ca.display()
        }
    }

    start()
    {        
        let time = 0
        let world = this    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        world.display()
        if(typeof window != undefined)
        {
            let meter = new FPSMeter({left:"auto", top:"80px",right:"30px",graph:1,history:30})
            async function animate()
            {    
                if(world.sleep>0) await pause(world.sleep)
                meter.tickStart()
                
                let t = 0;              // Will track cumulative time per step in microseconds 

                while(t<16.67*60/world.targetfps)          //(t < 16.67) results in 60 fps if possible
                {
                    let startTime = performance.now();
                    world.step()
                    let endTime = performance.now();            
                    t += (endTime - startTime);                    
                    time++    
                    if(!world.throttlefps) break        
                }      
                world.display()
                meter.tick()
                
                let frame = requestAnimationFrame(animate);        
                if(time>world.options.maxtime) cancelAnimationFrame(frame)
                
            }
            requestAnimationFrame(animate);
        }
        else
        {
            // NODE CODE HERE 
        }
    }

    initialGrid(ca,property,def_state)
    {
        let p = property || 'val'
        let bg = def_state
        
        for(let i=0;i<ca.nc;i++)                          // i are columns
                for(let j=0;j<ca.nr;j++)                  // j are rows
                    ca.grid[i][j][p] = bg
        
        for (let arg=3; arg<arguments.length; arg+=2)       // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<ca.nc;i++)                        // i are columns
                for(let j=0;j<ca.nr;j++)                    // j are rows
                    if(this.rng.random() < arguments[arg+1]) ca.grid[i][j][p] = arguments[arg];                    
    }
    
    initialGlidergun(ca,property,x,y)              // A little bonus... manually added glider gun :')
    {
        let p = property || 'val'
        for(let i=0;i<ca.nc;i++)         // i are columns
            for(let j=0;j<ca.nr;j++)     // j are rows
                ca.grid[i][j][p] = 0;        

        ca.grid[x+0][y+4][p] = 1;
        ca.grid[x+0][y+5][p] = 1;
        ca.grid[x+1][y+4][p] = 1;
        ca.grid[x+1][y+5][p] = 1;
        ca.grid[x+10][y+4][p] = 1;
        ca.grid[x+10][y+5][p] = 1;
        ca.grid[x+10][y+6][p] = 1;
        ca.grid[x+11][y+3][p] = 1;
        ca.grid[x+11][y+7][p] = 1;
        ca.grid[x+12][y+2][p] = 1;
        ca.grid[x+12][y+8][p] = 1;
        ca.grid[x+13][y+2][p] = 1;
        ca.grid[x+13][y+8][p] = 1;
        ca.grid[x+14][y+5][p] = 1;
        ca.grid[x+15][y+3][p] = 1;
        ca.grid[x+15][y+7][p] = 1;
        ca.grid[x+16][y+4][p] = 1;
        ca.grid[x+16][y+5][p] = 1;
        ca.grid[x+16][y+6][p] = 1;
        ca.grid[x+17][y+5][p] = 1;
        ca.grid[x+20][y+2][p] = 1;
        ca.grid[x+20][y+3][p] = 1;
        ca.grid[x+20][y+4][p] = 1;
        ca.grid[x+21][y+2][p] = 1;
        ca.grid[x+21][y+3][p] = 1;
        ca.grid[x+21][y+4][p] = 1;
        ca.grid[x+22][y+1][p] = 1;
        ca.grid[x+22][y+5][p] = 1;
        ca.grid[x+24][y+1][p] = 1;
        ca.grid[x+24][y+5][p] = 1;
        ca.grid[x+24][y+0][p] = 1;
        ca.grid[x+24][y+6][p] = 1;
        ca.grid[x+34][y+2][p] = 1;
        ca.grid[x+34][y+3][p] = 1;
        ca.grid[x+35][y+2][p] = 1;
        ca.grid[x+35][y+3][p] = 1;

    }

}

export default World

/**
* Delay for a number of milliseconds
*/
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve,timeoutMsec))
