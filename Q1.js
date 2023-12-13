// set the dimensions and margins of the graph
const margin = {top: 50, right: 0, bottom: 50, left: 0},
    width = 900 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;
    
const svg_translation = {x: 150, y: 50};


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
        // Step 1: Aggregate data by 'Job Title' and calculate counts
        const jobTitleCounts = {};
        data.forEach((d) => {
            const jobTitle = d['Job Title'];
            jobTitleCounts[jobTitle] = (jobTitleCounts[jobTitle] || 0) + 1;
        });
        // Step 2: Group the data into five categories
        let groupedData = {
            name: 'Job Title',
            children: [
            {
                name: 'Data Scientist',
                children: [],
            },
            {
                name: 'Data Engineer',
                children: [],
            },
            {
                name: 'Data Analyst',
                children: [],
            },
            {
                name: 'ML Engineer',
                children: [],
            },
            {
                name: 'Others',
                children: [],
            },
            ],
        };

        // Step 3: Populate the groupedData object
        data.forEach((d) => {
            const jobTitle = d['Job Title'];
            const total = jobTitleCounts[jobTitle].toString();

            let category;
            if (jobTitle.includes('Data') && jobTitle.includes('Scien')) {
                category = groupedData.children[0];
            } else if (jobTitle.includes('Data') && jobTitle.includes('Engineer')) {
                category = groupedData.children[1];
            } else if (jobTitle.includes('Analy')) {
                category = groupedData.children[2];
            } else if (jobTitle.includes('Machine Learning') || jobTitle.includes('ML')) {
                category = groupedData.children[3];
            } else {
                category = groupedData.children[4];
            }

            let jobTitleObject = category.children.find((item) => item.name === jobTitle);
            if (!jobTitleObject) {
                jobTitleObject = {
                    name: jobTitle,
                    total,
                };
                category.children.push(jobTitleObject);
            }
        });

        s = JSON.stringify(groupedData);
        var blob = new Blob([s], { type: 'json/applcation' });
        var url = URL.createObjectURL(blob);
        resolve(url);
    })
}

function render (data_url) {

    var w = 1280 - 80,
        h = 800 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root,
        node;

    var treemap = d3.layout.treemap()
        .round(false)
        .size([w, h])
        .sticky(true)
        .value(function(d) { return d.total; });

    var svg = d3.select("#body").append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
    .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
    .append("svg:g")
        .attr("transform", "translate(.5,.5)");

    var tooltip = d3.select("#tooltip");

    d3.json(data_url, function(data) {
        console.log(data);
        node = root = data;
        var nodes = treemap.nodes(root)
            .filter(function(d) {return !d.children; });
      
        var cell = svg.selectAll("g")
            .data(nodes)
          .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });
      
        function handleMouseOver(d) {
            tooltip.style("display", "block")
                    .html(d.name + "<br>" + "Total: " + d.total);
        }
        
        function handleMouseMove(d) {
            var tooltipX = d3.event.pageX - 350;
            var tooltipY = d3.event.pageY - 20;
            tooltipX = Math.max(0, tooltipX); // Prevent going off-screen left
            tooltipY = Math.max(0, tooltipY); // Prevent going off-screen top
            tooltip.style("left", tooltipX + "px")
                    .style("top", tooltipY + "px");
        }
        
        function handleMouseOut(d) {
            tooltip.style("display", "none");
        }
        
        // Apply these to both rect and text
        cell.append("svg:rect")
            .attr("width", function(d) { return d.dx - 1; })
            .attr("height", function(d) { return d.dy - 1; })
            .style("fill", function(d) { return color(d.parent.name); })
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut);
        
        cell.append("svg:text")
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name; })
            .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; })
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut);
      
        d3.select(window).on("click", function() { zoom(root); });
      });
      
      function zoom(d) {
        var kx = w / d.dx, ky = h / d.dy;
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);
      
        var t = svg.selectAll("g.cell").transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
      
        t.select("rect")
            .attr("width", function(d) { return kx * d.dx - 1; })
            .attr("height", function(d) { return ky * d.dy - 1; })
      
        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
      
        node = d;
        d3.event.stopPropagation();
      }
}



loadData()
    .then(rawdata => transformData(rawdata))
    .then(transformedData => render(transformedData))
    .catch(error => console.error("An error occurred:", error));