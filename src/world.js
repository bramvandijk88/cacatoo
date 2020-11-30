import CA from "./ca"

class World
{
    constructor(opts)
    {  
        this.meter = new FPSMeter({left:"auto", top:"80px",right:"30px",graph:1,history:30})
        this.options = opts
        this.sleep = opts.sleep || 0
        this.CAs = []
    }

    makeCA(name)
    {
        let ca = new CA(name,this.options)
        this[name] = ca
        this.CAs.push(ca)
    }

    step()
    {
        for(let ca of this.CAs)
            ca.step()
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
        
        async function animate()
        {    
            if(world.sleep>0) await pause(world.sleep)
            world.meter.tickStart()
            
            let t = 0;              // Will track cumulative time per step in microseconds 
            while(t<16.67)          //(t < 16.67)   // 1/60 = 0.01667 = 16.67 microseconds    // This can be changed later to allow skipping of frames
            {
                let startTime = performance.now();
                world.step()
                let endTime = performance.now();            
                t += (endTime - startTime);
                time++            
            }       
            world.display()
            world.meter.tick()
            
            let frame = requestAnimationFrame(animate);        
            if(time>world.options.maxtime) cancelAnimationFrame(frame)
            
        }
        requestAnimationFrame(animate);
    }


    countMoore9(ca,col,row,val,property)
    {    
        let count = 0;
        
        for(let v=-1;v<2;v++)   // Check +/-1 vertically 
        {
            for(let h=-1;h<2;h++) // Check +/-1 horizontally 
            {       
                let x = col+h
                if(ca.wrap[0]) x = (col+h+ca.nc) % ca.nc; // Wraps neighbours left-to-right
                let y = row+v
                if(ca.wrap[1]) y = (row+v+ca.nr) % ca.nr; // Wraps neighbours top-to-bottom
                if(x<0||y<0||x>=ca.nc||y>=ca.nr) continue
                
                let nval = ca.grid[x][y][property]                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }
    countMoore8(ca,col,row,val,property)
    {
        let count = this.countMoore9(ca,col,row,val,property)
        let minus_this = ca.grid[col][row][property] == val
        if(minus_this) count--
        return count
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
                    if(Math.random() < arguments[arg+1]) ca.grid[i][j][p] = arguments[arg];                    
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
