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
        this.num_dps = values.length // number of data points for this graphs        
        this.elem = document.createElement("div")
        this.elem.className = "graph-holder"      
        this.colours = []
        for (let v of colours) {
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
                width: opts ? (opts.width != undefined ? opts.width : 500) : 500,
                height: opts ? (opts.height != undefined ? opts.height : 200) : 200,
                xlabel: this.labels[0],
                ylabel: this.labels.length == 2 ? this.labels[1] : "",
                drawPoints: opts ? (opts.drawPoints ? opts.drawPoints : false) : false,
                pointSize: opts ? (opts.pointSize ? opts.pointSize : 0) : 0,
                strokePattern: opts ? (opts.strokePattern != undefined ? opts.strokePattern : null) : null,
                dateWindow: [0, 100],
                axisLabelFontSize: 10,               
                valueRange: [opts ? (opts.min_y != undefined ? opts.min_y: 0):0, opts ? (opts.max_y != undefined ? opts.max_y: null):null],
                strokeWidth: opts ? (opts.strokeWidth != undefined ? opts.strokeWidth : 3) : 3,
                colors: this.colours,
                labels: labels.length == values.length ? this.labels: null,
                series: opts ? ( opts.series != undefined ? opts.series : null) : null                
            });
    }


    /** Push data to your graph-element
    * @param {array} array of floats to be added to the dygraph object (stored in 'data')
    */
    push_data(data_array) {
        this.data.push(data_array)
    }

    reset_plot() {
        let first_dp = this.data[0]
        this.data = []
        let empty = Array(first_dp.length).fill(undefined)
        this.data.push(empty)
        this.g.updateOptions(
            {
                'file': this.data
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
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}