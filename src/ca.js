import Gridpoint from "./gridpoint.js"
import Canvas from "./canvas.js"

// Class definition
class CA
{
    // Constructor
    constructor(name, opts)
    {
        // Make empty grid      
        this.name = name
        this.grid = MakeEmptyGrid(opts.ncol,opts.nrow);                 // Grid        
        this.nc = opts.ncol || 200
        this.nr = opts.nrow || 200
        this.wrap = opts.wrap || [true, true] 
        this.scale = opts.scale || 1

        this.canvas = new Canvas(this.nc,this.nr,this.scale);
        
        

        //GliderGun(this,3,3);            // Place a glider gun instead        
    }

    display()
    {        
        let ctx = this.canvas.ctx
        let scale = this.canvas.scale
        let ncol = this.nc
        let nrow = this.nr
        let col = [255,255,255,255]

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
                if(this.grid[i][j].val == 1) col = [255,255,255,255]
                if(this.grid[i][j].val == 2) col = [100,100,100,100]
                
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
                new_grid[i][j].val = this.nextstate(i,j)
            }
        }

        this.grid = new_grid;                
    }


}

export default CA



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
