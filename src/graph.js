
class Graph
{
    constructor(labels,values,colours,title,opts)
    {

        if(typeof window == undefined) throw "Using dygraphs with cashJS only works in browser-mode"                
        this.labels = labels
        this.data = [values]
        this.title = title
        this.num_dps = this.labels.length // number of data points for this graphs        
        this.elem = document.createElement("div")
        this.elem.className="graph-holder"
        this.colours = []       
        
        for(let v in colours)
        {
             if(v=="Time") continue    
             else if(colours[v][0]+colours[v][1]+colours[v][2] == 765) this.colours.push("#dddddd")       
             else this.colours.push(rgbToHex(colours[v][0],colours[v][1],colours[v][2]))        
        }
        
        document.body.appendChild(this.elem)         
        document.getElementById("graph_holder").appendChild(this.elem)
        this.g = new Dygraph(this.elem, this.data,
        {
            title: this.title,
            showRoller: false,
            ylabel: this.labels.length == 2 ? this.labels[1]: "",
            width: 600,
            height: 300,
            xlabel: this.labels[0],    
            drawPoints: opts && opts.drawPoints || false,
            pointSize: opts ? (opts.pointSize ? opts.pointSize : 0): 0,
            strokePattern: opts ? (opts.strokePattern ? opts.strokePattern : null) : null,
            dateWindow: [0,100],
            axisLabelFontSize: 10,    
            valueRange: [0.000, ],
            strokeWidth: opts ? opts.strokeWidth : 3,
            colors: this.colours,
            labels: this.labels            
        });
    }

    push_data(data_array)
    {
        this.data.push(data_array)
    }

    update(){
        let max_x = 0
        let min_x = 999999999999
        for(let i of this.data) 
        {
            if(i[0]>max_x) max_x = i[0]
            if(i[0]<min_x) min_x = i[0]
        }
        this.g.updateOptions( 
            {'file': this.data,
             dateWindow: [min_x,max_x]
        });
        
    }
}
export default Graph

function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
//if(r+g+b==765) return "#cccccc"
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// function hexToRgb(hex) {
// var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
// return result ? {
//     r: parseInt(result[1], 16),
//     g: parseInt(result[2], 16),
//     b: parseInt(result[3], 16)
// } : null;
// }

