'use strict';

class Gridpoint 
{    
   constructor(value) 
    {
        this.val = value;        
    }
}

class Canvas
{
    constructor(cols,rows,scale)
    {        
        this.height = rows;
        this.width = cols;
        this.scale = scale;

        if( typeof document !== "undefined" ){              // In browser, crease a new HTML canvas-element to draw on 
            this.elem = document.createElement("canvas");
            this.elem.className="grid-holder";
            this.elem.width = this.width*this.scale;
            this.elem.height = this.height*this.scale;   
            document.body.appendChild(this.elem);         
            document.getElementById("canvas_holder").appendChild(this.elem);
        } 
        else 
        {                                            // In nodejs, use canvas package, FIX LATER, FIRST STUDENT VERSION
			const {createCanvas} = require("canvas");
			this.elem = createCanvas( this.width*this.scale, this.height*this.scale);
			//this.fs = require("fs")
		}
		this.ctx = this.elem.getContext("2d");
		this.ctx.lineWidth = 1;
        this.ctx.fillStyle = "#AAAAAA";
        this.ctx.fillRect(0, 0, cols*scale, rows*scale);
        this.ctx.strokeRect(0, 0, cols*scale, rows*scale);
    }

    show()
    {
        let ctx = this.ctx;
        let scale = this.scale;
        let ncol = this.height;
        let nrow = this.width;
        let col = [255,255,255,255];

        ctx.clearRect(0,0,scale*ncol,scale*nrow);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        
        

        for(let i=0;i<ncol;i++)         // i are rows
        {
            for(let j=0;j<nrow;j++)     // j are columns
            {   
                if(this.grid[i][j].val == 0) continue // Don't draw
                if(this.grid[i][j].val == 1) col = [255,255,255,255];
                if(this.grid[i][j].val == 2) col = [100,100,100,100];
                
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = col[0];
                            pixels[off + 1] = col[1];
                            pixels[off + 2] = col[2];
                            pixels[off + 3] = col[3];
                        }
                    }

            }
        }
        ctx.putImageData(id, 0, 0);
    }
}

// Class definition
class CA
{
    // Constructor
    constructor(name, opts)
    {
        // Make empty grid      
        this.name = name;
        this.grid = MakeEmptyGrid(opts.ncol,opts.nrow);                 // Grid        
        this.nc = opts.ncol || 200;
        this.nr = opts.nrow || 200;
        this.wrap = opts.wrap || [true, true]; 
        this.scale = opts.scale || 1;

        this.canvas = new Canvas(this.nc,this.nr,this.scale);
        
        

        //GliderGun(this,3,3);            // Place a glider gun instead        
    }

    display()
    {        
        let ctx = this.canvas.ctx;
        let scale = this.canvas.scale;
        let ncol = this.nc;
        let nrow = this.nr;
        let col = [255,255,255,255];

        ctx.clearRect(0,0,scale*ncol,scale*nrow);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        
        

        for(let i=0;i<ncol;i++)         // i are rows
        {
            for(let j=0;j<nrow;j++)     // j are columns
            {   
                if(this.grid[i][j].val == 0) continue // Don't draw
                if(this.grid[i][j].val == 1) col = [255,255,255,255];
                if(this.grid[i][j].val == 2) col = [100,100,100,100];
                
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = col[0];
                            pixels[off + 1] = col[1];
                            pixels[off + 2] = col[2];
                            pixels[off + 3] = col[3];
                        }
                    }

            }
        }
        ctx.putImageData(id, 0, 0);
    }

    printgrid()
    {
        console.table(this.grid);
    }


    nextstate(i,j){
        throw 'Nextstate function of \'' + this.name + '\' undefined';
    }

    // Method 2
    step()
    {
        let new_grid = MakeEmptyGrid(this.nc,this.nr);
        
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                new_grid[i][j].val = this.nextstate(i,j);
            }
        }

        this.grid = new_grid;                
    }


}



function MakeEmptyGrid(cols,rows)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let r = 0; r< cols; r++)
        grid[r] = new Array(cols);      // Insert a row of <cols> long   --> grid[cols][rows]

    // Fill it up with random 0's and 1's
    for(let i=0;i<cols;i++)         // i are columns        
        for(let j=0;j<rows;j++)     // j are rows           
            grid[i][j] = new Gridpoint(Math.floor(Math.random()*2));
    return grid;
}

class World
{
    constructor(opts)
    {  
        this.meter = new FPSMeter({left:"auto", top:"80px",right:"30px",graph:1,history:30});
        this.options = opts;
        this.CAs = [];
    }

    makeCA(name)
    {
        let ca = new CA(name,this.options);
        this[name] = ca;
        this.CAs.push(ca);
    }

    step()
    {
        for(let ca of this.CAs)
            ca.step();
    }

    display()
    {
        for(let ca of this.CAs)
            ca.display();
    }

    start()
    {        
        let time = 0;
        let world = this;    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        
        function animate()
        {    
            world.meter.tickStart();
            let t = 0;      // Will track cumulative time per step in microseconds 
            while(t<16.67) //(t < 16.67)   // 1/60 = 0.01667 = 16.67 microseconds
            {
                let startTime = performance.now();
                world.step();
                let endTime = performance.now();            
                t += (endTime - startTime);
            }       
            world.display();
            world.meter.tick();
            time++;
            let frame = requestAnimationFrame(animate);        
            if(time>world.options.maxtime) cancelAnimationFrame(frame);
            
        }
        requestAnimationFrame(animate);
    }


    CountMoore9(ca,col,row,val)
    {    
        let count = 0;
        
        for(let v=-1;v<2;v++)   // Check +/-1 vertically 
        {
            for(let h=-1;h<2;h++) // Check +/-1 horizontally 
            {       
                let x = col+h;
                if(ca.wrap[0]) x = (col+h+ca.nc) % ca.nc; // Wraps neighbours left-to-right
                let y = row+v;
                if(ca.wrap[1]) y = (row+v+ca.nr) % ca.nr; // Wraps neighbours top-to-bottom
                if(x<0||y<0||x>=ca.nc||y>=ca.nr) continue
                
                let nval = ca.grid[x][y].val;                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }
    CountMoore8(ca,col,row,val)
    {
        let count = this.CountMoore9(ca,col,row,val);
        let minus_this = ca.grid[col][row].val == val;
        if(minus_this) count--;
        return count
    }


    
    init_glidergun(ca,x,y)              // A little bonus... manually added glider gun :')
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

module.exports = World;
