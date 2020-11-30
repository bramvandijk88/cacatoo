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
        this.statecolours = dict_reverse(opts.statecolours) || {'val':1}
        this.scale = opts.scale || 1
        this.canvas = new Canvas(this.nc,this.nr,this.scale);  
    }

    display()
    {                        
        let ctx = this.canvas.ctx
        let scale = this.canvas.scale
        let ncol = this.nc
        let nrow = this.nr
        let col = [255,255,255,255]

        ctx.clearRect(0,0,scale*ncol,scale*nrow);
        ctx.fillStyle = 'rgb('+colours[this.statecolours['bg']]+')'
        ctx.fillRect(0, 0, ncol*scale, nrow*scale);
        var id = ctx.getImageData(0, 0,scale*ncol,scale*nrow);
        var pixels = id.data;        
        

        for(let i=0;i<ncol;i++)         // i are rows
        {
            for(let j=0;j<nrow;j++)     // j are columns
            {               
                for(let prop in this.statecolours)
                {           
                    let state = this.statecolours[prop]        
                    if (!(prop in this.grid[i][j])) continue
                    
                    let value = this.grid[i][j][prop]
                    
                    if(value == 0) continue // Don't draw the background state
                    let idx = state
                    if (state.constructor == Object) {
                        idx = state[value]
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
                this.nextState(i,j)
                newstate[i][j] = this.grid[i][j]
                this.grid[i][j] = oldstate[i][j]
            }
        }
        this.grid = newstate;                
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
    ]

for(let i = 0; i < 100; i++)
{
    let f = 1-(i/100)
    colours.push([f*255,f*255,255,255]) // Blue to white gradient
}

function dict_reverse(obj) {
    let new_obj= {}
    let rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function(i) { 
        new_obj[i] = obj[i];
    })
    return new_obj;
}