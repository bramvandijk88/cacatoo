import Gridpoint from "./gridpoint.js"
import Canvas from "./canvas.js"

let colours;

// Class definition
class CA
{
    // Constructor
    constructor(name, opts, rng)
    {
        // Make empty grid      
        this.name = name
        this.time = 0
        this.grid = MakeGrid(opts.ncol,opts.nrow);                 // Grid        
        this.nc = opts.ncol || 200
        this.nr = opts.nrow || 200
        this.wrap = opts.wrap || [true, true] 
        this.rng = rng
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

    synchronous()  // Do one step (synchronous) of this CA
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
        this.time++          
    }   

    update()
    {
        throw 'Update function of \'' + this.name + '\' undefined';
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

    getNeighbour(i,j)
    {
        let x = i
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) return undefined               // TODO!!!!!!! Return border-state instead!
        else return this.grid[x][y]
    }

    setNeighbour(i,j,neigh)
    {
        let x = i
        if(this.wrap[0]) x = (i+this.nc) % this.nc;                         // Wraps neighbours left-to-right
        let y = j
        if(this.wrap[1]) y = (j+this.nr) % this.nr;                         // Wraps neighbours top-to-bottom
        if(x<0||y<0||x>=this.nc||y>=this.nr) this.grid[x][y] = undefined    // TODO!!!!!!!! Return border-state instead!
        else this.grid[x][y] = neigh
    }


    margolusDiffusion()
    {
        //   
        //   A  B
        //   D  C
        //   a = backup of A 
        //   rotate cw or ccw randomly
        let even = this.time%2==0
        if((this.nc%2 + this.nr%2) > 0) throw "Do not use margolusDiffusion with an uneven number of cols / rows!"
        
        for(let i=0+even;i<this.nc;i+=2)
        {    
            for(let j=0+even;j<this.nr;j+=2)
            {
                // console.log(i,j)
                let old_A = new Gridpoint(this.grid[i][j]);
                let A = this.getNeighbour(i,j)
                let B = this.getNeighbour(i+1,j)
                let C = this.getNeighbour(i+1,j+1)
                let D = this.getNeighbour(i,j+1)
                
                if(this.rng.random() < 0.5)
                {
                    A = D                           // cw
                    D = C 
                    C = B
                    B = old_A
                }
                else
                {
                    A = B
                    B = C
                    C = D
                    D = old_A
                }
                this.setNeighbour(i,j,A)
                this.setNeighbour(i+1,j,B)
                this.setNeighbour(i+1,j+1,C)
                this.setNeighbour(i,j+1,D)                
            }
        }        
    }
    printgrid(value)
    {
        let grid = new Array(this.nr);             // Makes a column or <rows> long --> grid[cols]
        for(let i = 0; i< this.nc; i++)
        {
            grid[i] = new Array(this.nc);          // Insert a row of <cols> long   --> grid[cols][rows]
            for(let j=0;j<this.nr;j++)
            {
                grid[i][j] = this.grid[i][j][value]
            }
        }
        console.table(grid)
    }
}

export default CA



function MakeGrid(cols,rows,template)
{
    let grid = new Array(rows);             // Makes a column or <rows> long --> grid[cols]
    for(let i = 0; i< cols; i++)
    {
        grid[i] = new Array(cols);          // Insert a row of <cols> long   --> grid[cols][rows]
        for(let j=0;j<rows;j++)
        {
            if(template) grid[i][j] = new Gridpoint(template[i][j]); // Make real copy constructor for this, not just val!!
            else grid[i][j] = new Gridpoint();
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