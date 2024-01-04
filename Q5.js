let xrange = 60;
let yrange = 250000;

const lgd_show = {
    'Data Science':1,
    'Data Analytics':1, 
    'Data Engineer':1, 
    'Machine Learning':1, 
    'Others':1
}

const cls_to_lgd = {
    'Data Science':'aa',
    'Data Analytics':'bb', 
    'Data Engineer':'cc', 
    'Machine Learning':'dd', 
    'Others':'ee'
}

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
        // Step 1: Define grouping categories
        function categorizeJobTitle(jobTitle) {
            if (jobTitle.includes('Data') && jobTitle.includes('Scien')) {
                return 'Data Science';
            } else if (jobTitle.includes('Data') && jobTitle.includes('Engineer')) {
                return 'Data Engineer';
            } else if (jobTitle.includes('Analy') || jobTitle.includes('BI')) {
                return 'Data Analytics';
            } else if (jobTitle.includes('Machine Learning') || jobTitle.includes('ML') || jobTitle.includes('Vision') || jobTitle.includes('AI') || jobTitle.includes('NLP')) {
                return 'Machine Learning';
            } else {
                return 'Others';
            }
        }

        // Step 2: Grouping & aggregating
        let categorySalaries = {};
        let categoryCounts = {};

        data.forEach(d => {
            let category = categorizeJobTitle(d['Job Title']);
            let salary = +d['Salary in USD'];

            if (!categorySalaries[d['Job Title']]) {
                categorySalaries[d['Job Title']] = 0;
                categoryCounts[d['Job Title']] = 0;
            }

            categorySalaries[d['Job Title']] += salary;
            categoryCounts[d['Job Title']]++;
        });

        let aggregatedData = [];
        for (let job in categorySalaries) {
            let meanSalary = categorySalaries[job] / categoryCounts[job];
            aggregatedData.push({'Job Title': job, 'Group': categorizeJobTitle(job), 'salary': +meanSalary.toFixed(2), 'count':+ Math.min(categoryCounts[job], 150) });
        }

        resolve(aggregatedData);
    })
}

function render (data) {
    d3.select("#body").selectAll("*").remove();
    var tooltip = d3.select("#tooltip");
    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 330, bottom: 80, left: 70},
    width = 1080 - margin.left - margin.right,
    height = 760 - margin.top - margin.bottom;
    // main element
    // append the svg object to the body of the page
    var svg = d3.select("#body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    

    function category(cat) {
        dicts = {
            'Data Science': '#1f77b4',
            'Data Analytics': '#ff7f0e',
            'Data Engineer': '#2ca02c',
            'Machine Learning': '#d62728',
            'Others': '#9467bd'
        };
        return dicts[cat];
    }

    function _getTooltipContent(d) {
        let s = d['Job Title'] + '<br> Job counts: ' + (d['count']==150 ? '>150': d['count']) + '<br> Mean salary: $' + d['salary'];
        return s;
    }

    function handleMouseOver(d) {
        console.log(d);
        tooltip.style("display", "block")
                .html(_getTooltipContent(d));
    }
    
    function handleMouseMove(d) {
        var tooltipX = d3.event.pageX + 20;
        var tooltipY = d3.event.pageY - 20;
        tooltipX = Math.max(0, tooltipX); // Prevent going off-screen left
        tooltipY = Math.max(0, tooltipY); // Prevent going off-screen top
        tooltip.style("left", tooltipX + "px")
                .style("top", tooltipY + "px");
    }

    function handleMouseOut(d) {
        tooltip.style("display", "none");
    }

    // Legend
    var color = d3.scaleOrdinal()
        .domain(['Data Science', 'Data Analytics', 'Data Engineer', 'Machine Learning', 'Others'])
        .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd"])

    var lbl = d3.scaleOrdinal()
        .domain(['a','b','c','d','e'])
        .range(['aa','bb','cc','dd','ee'])

    var lbl_inv = d3.scaleOrdinal()
        .range(['a','b','c','d','e'])
        .domain(['aa','bb','cc','dd','ee'])
        

    var legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(['Data Science', 'Data Analytics', 'Data Engineer', 'Machine Learning', 'Others'])
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // Add X axis label:
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2 + margin.left / 8 + 20)
    .attr("y", height + margin.top/4*3)
    .text("Job counts");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + width/4 - 160)
        .attr("x", -margin.top - height/2 + 100)
        .text("Salary in USD");

    legend.append("text")
        .attr("x", width + 25)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("class", lbl)
        .style("text-decoration", function(d){console.log(lgd_show[d]);return lgd_show[d] ? 'none' : 'line-through';})
        .text(function(d) { return d; });

    legend.append("rect")
        .attr("x", width)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color)
        .attr("class", lbl_inv)
        .on("click", function() {
            var textobj = d3.selectAll('.' + d3.select(this).attr("class") + d3.select(this).attr("class"));
            if(textobj.style("text-decoration") == 'line-through'){
                textobj.text(textobj.text()).style('text-decoration', 'none');
                lgd_show[textobj.text()] = 1 - lgd_show[textobj.text()];
                draw();
            }
            else{
                textobj.text(textobj.text()).style('text-decoration', 'line-through');
                lgd_show[textobj.text()] = 1 - lgd_show[textobj.text()];
                draw();
            }
            console.log(lgd_show);
        });
    

    data = data.filter(function(row){
        return lgd_show[row['Group']];
    });
    console.log(data);

    // Add X axis
    var x = d3.scaleLinear()
    .domain([0, xrange])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([20000, yrange])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function (d) { return x(d['count']); } )
        .attr("cy", function (d) { return y(d['salary']); } )
        .attr("r", 5)
        .style("fill", function (d) {return category(d['Group']);})
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut);
}

function draw() {
    loadData()
        .then(rawdata => transformData(rawdata))
        .then(transformedData => render(transformedData))
        .catch(error => console.error("An error occurred:", error));
};

draw();

// Listen to the slider?
d3.select("#mySlider").on("change", function(d){
    d3.select("#corVal").text(this.value);
    xrange = this.value;;
    draw();
});

d3.select("#mySlider2").on("change", function(d){
    d3.select("#corVal2").text(this.value);
    yrange = this.value;;
    draw();
});


