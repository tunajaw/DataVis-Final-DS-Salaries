// set the dimensions and margins of the graph
const margin = {top: 50, right: 0, bottom: 50, left: 0},
    width = 900 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;
    
const svg_translation = {x: 150, y: 50};


function loadData () {
    return new Promise((resolve, reject) => {
        d3.csv("Latest_Data_Science_Salaries.csv").then(function(loadedData){
            //filter NaN
            let data = loadedData.filter(function(row){
                for(let key in row) {
                    if (row[key]=="" || isNaN(row[key])){
                        return false;
                    }
                }
                return true;
            })
            data = loadedData;
            resolve(data);
        });
    })
};

function transformData (data) {
    return new Promise((resolve, reject) => {
        resolve(data);
    })
}

function render (data) {

    console.log(data);
    
    // // console.log(selected_attr);
    // d3.select("#my_dataviz").html("");

    // // append the svg object
    // const svg = d3.select("#my_dataviz")
    //         .append("svg")
    //             .attr("width", width + margin.left + margin.right + svg_translation.x)
    //             .attr("height", height + margin.top + margin.bottom + svg_translation.y)
    //         .append("g")
    //             .attr("transform", `translate(${svg_translation.x}, ${svg_translation.y})`);


    // // Add X axis
    // const x = d3.scaleLinear()
    //     .domain([Math.min(0, max_value * 1.1), Math.max(0, max_value * 1.1)])
    //     .range([max_value>0 ? 0 : width - svg_translation.x, max_value>0 ? width - svg_translation.x : 0]);
    // svg.append("g")
    //     .attr("transform", `translate(0, 0)`)
    //     .call(d3.axisTop(x))
    //     .selectAll("text")
    //     .style("font-size", 12)
    //     //.attr("transform", "translate(-10,0)rotate(-45)")
    //     .style("text-anchor", "end");

    // // Y axis
    // const y = d3.scaleBand()
    //     .range([ 0, height + svg_translation.y ])
    //     .domain(data.map(function(d) { return d.genre; }))
    //     .padding(1);
    // svg.append("g")
    //     .call(d3.axisLeft(y))
    //     .style("font-size", 12)

    // // Lines
    // svg.selectAll("myline")
    //     .data(data)
    //     .join("line")
    //     .attr("x1", function(d) { return x(d[sorted_by]); })
    //     .attr("x2", x(0))
    //     .attr("y1", function(d) { return y(d.genre); })
    //     .attr("y2", function(d) { return y(d.genre); })
    //     .attr("stroke", "grey")

    // // Circles
    // svg.selectAll("mycircle")
    //     .data(data)
    //     .join("circle")
    //     .attr("cx", function(d) { return x(d.mean); })
    //     .attr("cy", function(d) { return y(d.genre); })
    //     .attr("r", "7")
    //     .style("fill", "#69b3a2")
    //     .attr("stroke", "black")

    // svg.selectAll("mycircle")
    //     .data(data)
    //     .join("circle")
    //     .attr("cx", function(d) { return x(d.max); })
    //     .attr("cy", function(d) { return y(d.genre); })
    //     .attr("r", "7")
    //     .style("fill", "#d54b7d")
    //     .attr("stroke", "black")

    // svg.selectAll("mycircle")
    //     .data(data)
    //     .join("circle")
    //     .attr("cx", function(d) { return x(d.max); })
    //     .attr("cy", function(d) { return y(d.genre); })
    //     .attr("r", "7")
    //     .style("fill", "#d54b7d")
    //     .attr("stroke", "black")
    
    // // text
    // svg.selectAll("myText")
    //     .data(data)
    //     .join("text")
    //     .style("font-size", 12)
    //     .style("text-align", "left")
    //     .attr("x", width - svg_translation.x - 50)
    //     .attr("y", function(d) { return y(d.genre); })
    //     .text(function(d) {return `mean: ${d.mean}, max: ${d.max}`})
}



loadData()
    .then(rawdata => transformData(rawdata))
    .then(transformedData => render(transformedData))
    .catch(error => console.error("An error occurred:", error));