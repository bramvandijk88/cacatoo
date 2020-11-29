import Gridpoint from "./gridpoint.js"
import Canvas from "./canvas.js"

let colours;

// Class definition
class CA
{
    // Constructor
    constructor(name, opts)
    {
        // Make empty grid      
        this.name = name
        this.grid = MakeGrid(opts.ncol,opts.nrow);                 // Grid        
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
                let value = this.grid[i][j].val
                if(value == 0) continue // Don't draw the background state
                
                    for(let n=0;n<scale;n++)
                    {
                        for(let m=0;m<scale;m++)
                        {
                            let x = i*scale+n;
                            let y = j*scale+m;                    
                            var off = (y * id.width + x) * 4;
                            pixels[off] = colours[value][0];
                            pixels[off + 1] = colours[value][1];
                            pixels[off + 2] = colours[value][2];
                            pixels[off + 3] = colours[value][3];
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
        let new_grid = MakeGrid(this.nc,this.nr,this.grid);
        
        for(let i=0;i<this.nc;i++)
        {    
            for(let j=0;j<this.nr;j++)
            {
                let next_state = this.nextstate(i,j)
                if(next_state === undefined) continue 
                else new_grid[i][j].val = next_state
            }
        }

        this.grid = new_grid;                
    }


}

export default CA



function MakeGrid(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let r = 0; r< cols; r++)
    {
        grid[r] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let i=0;i<rows;i++)
        {
            if(template) grid[r][i] = new Gridpoint(template[r][i].val);
            else grid[r][i] = new Gridpoint(0);
        }
    }
    
    return grid;
}

colours = [ [0,0,0,255],
            [255,255,255,255],
            [255,0,0,255],
            [0,0,255,255],
            [0,255,0,255]
    ]