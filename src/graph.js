/**
 *  Graph is a wrapper-class for a Dygraph element (see https://dygraphs.com/). It is attached to the DOM-windows, and stores all values to be plotted, colours, title, axis names, etc. 
 */

class Graph {
    /**
  *  The constructor function for a @Canvas object. 
  *  @param {Array} labels array of strings containing the labels for datapoints (e.g. for the legend)
  *  @param {Array} values Array of floats to plot (here plotted over time)
  * @param {Array} colours Array of colours to use for plotting
  * @param {String} title Title of the plot
  * @param {Object} opts dictionary-style list of opts to pass onto dygraphs
  */
    constructor(labels, values, colours, title, opts) {

        if (typeof window == undefined) throw "Using dygraphs with cashJS only works in browser-mode"
        this.labels = labels
        this.data = [values]
        this.title = title
        this.num_dps = this.labels.length // number of data points for this graphs        
        this.elem = document.createElement("div")
        this.elem.className = "graph-holder"
        this.colours = []
        console.log(`Setting up colours for graph ${title}`)
        console.log(colours)
        for (let v of colours) {
            console.log(v)
            console.log(v[0], v[1], v[2])
            if (v == "Time") continue            
            else if (v == undefined) this.colours.push("#000000")
            else if (v[0] + v[1] + v[2] == 765) this.colours.push("#dddddd")
            else this.colours.push(rgbToHex(v[0], v[1], v[2]))
        }

        document.body.appendChild(this.elem)
        document.getElementById("graph_holder").appendChild(this.elem)
        this.g = new Dygraph(this.elem, this.data,
            {
                title: this.title,
                showRoller: false,
                ylabel: this.labels.length == 2 ? this.labels[1] : "",
                width: 500,
                height: 200,
                xlabel: this.labels[0],
                drawPoints: opts && opts.drawPoints || false,
                pointSize: opts ? (opts.pointSize ? opts.pointSize : 0) : 0,
                strokePattern: opts ? (opts.strokePattern ? opts.strokePattern : null) : null,
                dateWindow: [0, 100],
                axisLabelFontSize: 10,
                valueRange: [0.000,],
                strokeWidth: opts ? opts.strokeWidth : 3,
                colors: this.colours,
                labels: this.labels
            });
    }


    /** Push data to your graph-element
    * @param {array} array of floats to be added to the dygraph object (stored in 'data')
    */
    push_data(data_array) {
        this.data.push(data_array)
    }

    reset_plot() {
        this.data = [this.data[0]]
        this.g.updateOptions(
            {
                'file': [this.data]
            });
    }

    /** 
     * Update the graph axes   
    */
    update() {
        let max_x = 0
        let min_x = 999999999999
        for (let i of this.data) {
            if (i[0] > max_x) max_x = i[0]
            if (i[0] < min_x) min_x = i[0]
        }
        this.g.updateOptions(
            {
                'file': this.data,
                dateWindow: [min_x, max_x]
            });

    }
}
export default Graph

/* 
Functions below are to make sure dygraphs understands the colours used by Cacatoo (converts to hex)
*/
function componentToHex(c) {
    console.log(`Calling componentToHex for c ${c}`)
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}