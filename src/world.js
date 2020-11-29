import CA from "./ca"

class World
{
    constructor(opts)
    {  
        this.meter = new FPSMeter({left:"auto", top:"80px",right:"30px",graph:1,history:30})
        this.options = opts
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
            ca.display()
    }

    start()
    {        
        let time = 0
        let world = this    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        
        function animate()
        {    
            world.meter.tickStart()
            let t = 0;      // Will track cumulative time per step in microseconds 
            while(t<16.67) //(t < 16.67)   // 1/60 = 0.01667 = 16.67 microseconds
            {
                let startTime = performance.now();
                world.step()
                let endTime = performance.now();            
                t += (endTime - startTime);
            }       
            world.display()
            world.meter.tick()
            time++
            let frame = requestAnimationFrame(animate);        
            if(time>world.options.maxtime) cancelAnimationFrame(frame)
            
        }
        requestAnimationFrame(animate);
    }


    countMoore9(ca,col,row,val)
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
                
                let nval = ca.grid[x][y].val                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }
    countMoore8(ca,col,row,val)
    {
        let count = this.countMoore9(ca,col,row,val)
        let minus_this = ca.grid[col][row].val == val
        if(minus_this) count--
        return count
    }

    initialGrid(ca)
    {
        if(arguments.length%2==0) throw 'initialGrid expects an uneven nr of arguments (CA-name, value, fraction, value_2, fraction_2, etc.)'
        //console.log("Got", arguments.length, "arguments")
        for (let arg=1; arg<arguments.length; arg+=2)
        {
            
            for(let i=0;i<ca.nc;i++)         // i are columns
            {
                for(let j=0;j<ca.nr;j++)     // j are rows
                {                            
                    if(Math.random() < arguments[arg+1]) ca.grid[i][j].val = arguments[arg];
                }
            }
        }        
    }
    
    initialGlidergun(ca,x,y)              // A little bonus... manually added glider gun :')
    {
        for(let i=0;i<ca.nc;i++)         // i are columns
            for(let j=0;j<ca.nr;j++)     // j are rows
                ca.grid[i][j].val = 0;        

        ca.grid[x+0][y+4].val = 1;
        ca.grid[x+0][y+5].val = 1;
        ca.grid[x+1][y+4].val = 1;
        ca.grid[x+1][y+5].val = 1;
        ca.grid[x+10][y+4].val = 1;
        ca.grid[x+10][y+5].val = 1;
        ca.grid[x+10][y+6].val = 1;
        ca.grid[x+11][y+3].val = 1;
        ca.grid[x+11][y+7].val = 1;
        ca.grid[x+12][y+2].val = 1;
        ca.grid[x+12][y+8].val = 1;
        ca.grid[x+13][y+2].val = 1;
        ca.grid[x+13][y+8].val = 1;
        ca.grid[x+14][y+5].val = 1;
        ca.grid[x+15][y+3].val = 1;
        ca.grid[x+15][y+7].val = 1;
        ca.grid[x+16][y+4].val = 1;
        ca.grid[x+16][y+5].val = 1;
        ca.grid[x+16][y+6].val = 1;
        ca.grid[x+17][y+5].val = 1;
        ca.grid[x+20][y+2].val = 1;
        ca.grid[x+20][y+3].val = 1;
        ca.grid[x+20][y+4].val = 1;
        ca.grid[x+21][y+2].val = 1;
        ca.grid[x+21][y+3].val = 1;
        ca.grid[x+21][y+4].val = 1;
        ca.grid[x+22][y+1].val = 1;
        ca.grid[x+22][y+5].val = 1;
        ca.grid[x+24][y+1].val = 1;
        ca.grid[x+24][y+5].val = 1;
        ca.grid[x+24][y+0].val = 1;
        ca.grid[x+24][y+6].val = 1;
        ca.grid[x+34][y+2].val = 1;
        ca.grid[x+34][y+3].val = 1;
        ca.grid[x+35][y+2].val = 1;
        ca.grid[x+35][y+3].val = 1;
    }

}

export default World