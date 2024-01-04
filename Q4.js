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

function transformData (data) {
    return new Promise((resolve, reject) => {
        let aggregatedData = {
            'Large': { 'Executive': 0, 'Senior': 0, 'Mid': 0, 'Entry': 0 },
            'Medium': { 'Executive': 0, 'Senior': 0, 'Mid': 0, 'Entry': 0 },
            'Small': { 'Executive': 0, 'Senior': 0, 'Mid': 0, 'Entry': 0 }
        };
        
        // Process and aggregate the data
        data.forEach(row => {
            if (aggregatedData[row['Company Size']]) {
                aggregatedData[row['Company Size']][row['Experience Level']]++;
            }
        });
        
        // To convert this object back to a CSV format or similar structure
        let result = [];
        for (let companySize in aggregatedData) {
            let row = { 'Company Size': companySize, ...aggregatedData[companySize] };
            result.push(row);
        }

        let proportionalData = result.map(row => {
            // Calculate the sum of all elements except 'Company Size'
            let sum = Object.keys(row).reduce((acc, key) => {
                return key !== 'Company Size' ? acc + row[key] : acc;
            }, 0);
        
            // Convert each value to its proportion
            let newRow = { 'Company Size': row['Company Size'] };
            for (let key in row) {
                if (key !== 'Company Size') {
                    newRow[key] = 100 * row[key] / sum;
                }
            }
        
            return newRow;
        });

        let csvData = d3.csvFormat(proportionalData);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        resolve(url);
    
    })
}

function render (data_url) {

    var tooltip = d3.select("#tooltip");

    function _round_2_dec(x) {
        return Math.round(x * 100) / 100;
    }

    function _getTooltipContent(d) {
        let s = _round_2_dec(d[1]-d[0]) + '%';
        return s;
    }

    function handleMouseOver(d) {
        console.log(d);
        tooltip.style("display", "block")
                .html(_getTooltipContent(d));
    }
    
    function handleMouseMove(d) {
        var tooltipX = d3.event.pageX - 100;
        var tooltipY = d3.event.pageY - 20;
        tooltipX = Math.max(0, tooltipX); // Prevent going off-screen left
        tooltipY = Math.max(0, tooltipY); // Prevent going off-screen top
        tooltip.style("left", tooltipX + "px")
                .style("top", tooltipY + "px");
    }

    function handleMouseOut(d) {
        tooltip.style("display", "none");
    }

    d3.csv(data_url, function (data){

        data.forEach(function(d){
            d['Executive'] = +d['Executive'];
            d['Senior'] = +d['Senior'];
            d['Mid'] = +d['Mid'];
            d['Entry'] = +d['Entry'];
        })

        console.log(data);

        // set the dimensions and margins of the graph
        var margin = {top: 60, right: 300, bottom: 200, left: 200},
        width = 910 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
        

        // List of subgroups = header of the csv files = soil condition here
        var subgroups = data.columns.slice(1).reverse();

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(data, function(d){return(d['Company Size'])}).keys()

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0 ]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"])

        // color palette = one color per subgroup
        // var color = d3.scaleOrdinal()
        //     .domain(subgroups)
        //     .range(['#e41a1c','#377eb8','#4daf4a', '#80648c']);

        // Add X axis label:
        svg.append("text")
           .attr("text-anchor", "end")
           .attr("x", width/2 + margin.left / 8 + 20)
           .attr("y", height + margin.top/4*3)
           .text("Company Size");

        // Add Y axis label:
        svg.append("text")
           .attr("text-anchor", "end")
           .attr("transform", "rotate(-90)")
           .attr("y", -margin.left + width/4 + 50)
           .attr("x", -margin.top - height/2 + 100)
           .text("Percentage");

        // Legend
        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(subgroups)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color)
            

        legend.append("text")
            .attr("x", width + 25)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });


        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
        .keys(subgroups)
        (data)

        // Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("x", function(d) { return x(d.data['Company Size']); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut);
    })

    

}


function draw() {
    loadData()
        .then(rawdata => transformData(rawdata))
        .then(transformedData => render(transformedData))
        .catch(error => console.error("An error occurred:", error));
};

draw();


