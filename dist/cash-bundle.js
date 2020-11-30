'use strict';

class Gridpoint 
{    
   constructor(template) 
    {        
        // This class only contains a copy-constructor, meaning that a new gridpoint will be made based on the passed template gridpoint
        // If no template is given, the object is empty (for initialisation, this is true)
        for (var prop in template) {
            this[prop] = template[prop];
        }
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
}

let colours;

// Class definition
class CA
{
    // Constructor
    constructor(name, opts)
    {
        // Make empty grid      
        this.name = name;
        this.grid = MakeGrid(opts.ncol,opts.nrow);                 // Grid        
        this.nc = opts.ncol || 200;
        this.nr = opts.nrow || 200;
        this.wrap = opts.wrap || [true, true]; 
        this.statecolours = dict_reverse(opts.statecolours) || {'val':1};
        this.scale = opts.scale || 1;
        this.canvas = new Canvas(this.nc,this.nr,this.scale);  
    }

    display()
    {                        
        let ctx = this.canvas.ctx;
        let scale = this.canvas.scale;
        let ncol = this.nc;
        let nrow = this.nr;

        ctx.clearRect(0,0,scale*ncol,scale*nrow);
        ctx.fillStyle = 'rgb('+colours[this.statecolours['bg']]+')';
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        
        

        for(let i=0;i<ncol;i++)         // i are rows
        {
            for(let j=0;j<nrow;j++)     // j are columns
            {               
                for(let prop in this.statecolours)
                {           
                    let state = this.statecolours[prop];        
                    if (!(prop in this.grid[i][j])) continue
                    
                    let value = this.grid[i][j][prop];
                    
                    if(value == 0) continue // Don't draw the background state
                    let idx = state;
                    if (state.constructor == Object) {
                        idx = state[value];
                    }
                    
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = colours[idx][0];
                            pixels[off + 1] = colours[idx][1];
                            pixels[off + 2] = colours[idx][2];
                            //pixels[off + 3] = 255; // Last is always 255
                        }
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


    nextState(i,j){
        throw 'Nextstate function of \'' + this.name + '\' undefined';
    }

    // Method 2
    step()
    {
        let oldstate = MakeGrid(this.nc,this.nr,this.grid);
        let newstate = MakeGrid(this.nc,this.nr,this.grid);
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                this.nextState(i,j);
                newstate[i][j] = this.grid[i][j];
                this.grid[i][j] = oldstate[i][j];
            }
        }
        this.grid = newstate;                
    }


}



function MakeGrid(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let r = 0; r< cols; r++)
    {
        grid[r] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let i=0;i<rows;i++)
        {
            if(template) grid[r][i] = new Gridpoint(template[r][i]); // Make real copy constructor for this, not just val!!
            else grid[r][i] = new Gridpoint();
        }
    }
    
    return grid;
}

colours = [ [0,0,0],                // Black     0
            [255,255,255],          // White     1
            [255,0,0],              // Red       2
            [0,0,255],              // Blue      3
            [0,255,0],              // Green     4
            [40,40,40],             // Darkgrey  5
            [180,180,180],          // Lightgrey 6
            [148, 0, 211],          // Violet    7
            [64, 224, 208],         // Turquoise  8
            [255, 165, 0],          // Orange    9
    ];

for(let i = 0; i < 100; i++)
{
    let f = 1-(i/100);
    colours.push([f*255,f*255,255,255]); // Blue to white gradient
}

function dict_reverse(obj) {
    let new_obj= {};
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function(i) { 
        new_obj[i] = obj[i];
    });
    return new_obj;
}

class World
{
    constructor(opts)
    {  
        this.meter = new FPSMeter({left:"auto", top:"80px",right:"30px",graph:1,history:30});
        this.options = opts;
        this.sleep = opts.sleep || 0;
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
        {
            ca.display();
        }
    }

    start()
    {        
        let time = 0;
        let world = this;    // Caching this, as function animate changes the this-scope to the scope of the animate-function
        
        async function animate()
        {    
            if(world.sleep>0) await pause(world.sleep);
            world.meter.tickStart();
            
            let t = 0;              // Will track cumulative time per step in microseconds 
            while(t<16.67)          //(t < 16.67)   // 1/60 = 0.01667 = 16.67 microseconds    // This can be changed later to allow skipping of frames
            {
                let startTime = performance.now();
                world.step();
                let endTime = performance.now();            
                t += (endTime - startTime);
                time++;            
            }       
            world.display();
            world.meter.tick();
            
            let frame = requestAnimationFrame(animate);        
            if(time>world.options.maxtime) cancelAnimationFrame(frame);
            
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
                let x = col+h;
                if(ca.wrap[0]) x = (col+h+ca.nc) % ca.nc; // Wraps neighbours left-to-right
                let y = row+v;
                if(ca.wrap[1]) y = (row+v+ca.nr) % ca.nr; // Wraps neighbours top-to-bottom
                if(x<0||y<0||x>=ca.nc||y>=ca.nr) continue
                
                let nval = ca.grid[x][y][property];                
                if(nval == val)
                    count++;      // Add value                
            }
        }
        return count;
    }
    countMoore8(ca,col,row,val,property)
    {
        let count = this.countMoore9(ca,col,row,val,property);
        let minus_this = ca.grid[col][row][property] == val;
        if(minus_this) count--;
        return count
    }

    initialGrid(ca,property,def_state)
    {
        let p = property || 'val';
        let bg = def_state;
        
        for(let i=0;i<ca.nc;i++)                          // i are columns
                for(let j=0;j<ca.nr;j++)                  // j are rows
                    ca.grid[i][j][p] = bg;
        
        for (let arg=3; arg<arguments.length; arg+=2)       // Parse remaining 2+ arguments to fill the grid           
            for(let i=0;i<ca.nc;i++)                        // i are columns
                for(let j=0;j<ca.nr;j++)                    // j are rows
                    if(Math.random() < arguments[arg+1]) ca.grid[i][j][p] = arguments[arg];                    
    }
    
    initialGlidergun(ca,property,x,y)              // A little bonus... manually added glider gun :')
    {
        let p = property || 'val';
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

/**
* Delay for a number of milliseconds
*/
const pause = (timeoutMsec) => new Promise(resolve => setTimeout(resolve,timeoutMsec));

module.exports = World;
