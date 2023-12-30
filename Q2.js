// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 80},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


function loadData () {
    return new Promise((resolve, reject) => {
        d3.csv("Latest_Data_Science_Salaries.csv", function(loadedData){
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

function renderViolinPlot(data) {
    // Nest the data by Company Size
    const nestedData = d3.nest().key(d => d["Company Size"]).entries(data);
    
    // Append the SVG object to the body of the page
    const svg = d3.select("#body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Build and Show the Y scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d["Salary in USD"])])  // Note that here the Y scale is set manually
        .range([height, 0])
    svg.append("g").call( d3.axisLeft(y) )

     // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(nestedData.map(d => d.key))
        .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
  
    // Features of the histogram
    var histogram = d3.histogram()
    .domain(y.domain())
    .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value(d => d)

    // Compute the binning for each group of the dataset
    var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d["Company Size"];})
    .rollup(function(d) {   // For each key..
    input = d.map(function(g) { return +g["Salary in USD"];})    // Keep the variable called Sepal_Length
    bins = histogram(input)   // And compute the binning on it.
    return(bins)
    })
    .entries(data)

    // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
    var maxNum = 0
    for ( i in sumstat ){
        allBins = sumstat[i].value
        //console.log(allBins);
        lengths = allBins.map(function(a){return a.length;})
        longest = d3.max(lengths)
        if (longest > maxNum) { maxNum = longest }
    }

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    var xNum = d3.scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum,maxNum])

    // Add the shape to this svg!
    svg
    .selectAll("myViolin")
    .data(sumstat)
    .enter()        // So now we are working group per group
    .append("g")
    .attr("transform", function(d){ return("translate(" + x(d.key) +" ,0)") } ) // Translation on the right to be at the group position
    .append("path")
    .datum(function(d){ return(d.value)})     // So now we are working bin per bin
    .style("stroke", "none")
    .style("fill","#69b3a2")
    .attr("d", d3.area()
        .x0(function(d){ return(xNum(-d.length)) } )
        .x1(function(d){ return(xNum(d.length)) } )
        .y(function(d){ return(y(d.x0)) } )
        .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
    )
}
  



loadData()
    .then(rawdata => renderViolinPlot(rawdata))
    .catch(error => console.error("An error occurred:", error));