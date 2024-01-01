// set the dimensions and margins of the graph
const margin = {top: 50, right: 0, bottom: 50, left: 0},
    width = 900 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;
    
const svg_translation = {x: 150, y: 50};


function loadData () {
    return new Promise((resolve, reject) => {
        var selected_attr = document.getElementById("feature").value;
        console.log(selected_attr);

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
            
            loadedData = loadedData.filter(function(row){
                if(selected_attr == 'Overall') return true;
                return row['Experience Level'] == selected_attr;
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

        // Step 2: Aggregate data by 'Job Title' and calculate job counts & experience levels
        const experienceLevels = ['Executive', 'Senior', 'Mid', 'Entry'];
        const aggregatedData = {};

        data.forEach(row => {
            const jobTitle = row['Job Title'];
            const experienceLevel = row['Experience Level'];

            // Initialize the job title in the aggregatedData object if it doesn't exist
            if (!aggregatedData[jobTitle]) {
                aggregatedData[jobTitle] = new Array(experienceLevels.length).fill(0);
            }

            // Find the index of the experience level
            const index = experienceLevels.indexOf(experienceLevel);
            if (index !== -1) {
                aggregatedData[jobTitle][index]++;
            }
        });

        console.log(aggregatedData);
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
            } else if (jobTitle.includes('Analy') || jobTitle.includes('BI')) {
                category = groupedData.children[2];
            } else if (jobTitle.includes('Machine Learning') || jobTitle.includes('ML') || jobTitle.includes('Vision') || jobTitle.includes('AI') || jobTitle.includes('NLP')) {
                category = groupedData.children[3];
            } else {
                category = groupedData.children[4];
            }
            
            let jobTitleObject = category.children.find((item) => item.name === jobTitle);
            if (!jobTitleObject) {
                jobTitleObject = {
                    name: jobTitle,
                    total,
                    experience: aggregatedData[jobTitle]
                };
                category.children.push(jobTitleObject);
            }
        });

        s = JSON.stringify(groupedData);
        // console.log(s);
        var blob = new Blob([s], { type: 'json/applcation' });
        var url = URL.createObjectURL(blob);
        resolve(url);
    })
}

function render (data_url) {

    d3.select("#body").selectAll("*").remove();

    var w = 1280 - 80,
        h = 800 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root,
        node;

    const opacities = [1.0, 0.8, 0.6, 0.4];

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

        function _calculateProportions(array) {
            const sum = array.reduce((a, b) => a + b, 0);
            return array.map(element => _round_2_dec(element*100 / sum));
        }

        function _round_2_dec(x) {
            return Math.round(x * 100) / 100;
        }

        function _getTooltipContent(d) {
            const proportionArray = _calculateProportions(d.experience);
            let s = 
                d.name + "<br>" +
                "Total: " + d.total + "<br>" + 
                "Executive: " + d.experience[0] + "(" + proportionArray[0] + "%)" + "<br>" +
                "Senior: " + d.experience[1] + "(" + proportionArray[1] + "%)" + "<br>" +
                "Mid: " + d.experience[2] + "(" + proportionArray[2] + "%)" + "<br>" +
                "Entry: " + d.experience[3] + "(" + proportionArray[3] + "%)";
            return s;
        }
      
        function handleMouseOver(d) {
            tooltip.style("display", "block")
                    .html(_getTooltipContent(d));
        }
        
        function handleMouseMove(d) {
            var tooltipX = d3.event.pageX - 200;
            var tooltipY = d3.event.pageY - 20;
            tooltipX = Math.max(0, tooltipX); // Prevent going off-screen left
            tooltipY = Math.max(0, tooltipY); // Prevent going off-screen top
            tooltip.style("left", tooltipX + "px")
                    .style("top", tooltipY + "px");
        }
        
        function handleMouseOut(d) {
            tooltip.style("display", "none");
        }
        
        cell.each(function(d) {
            const node = d3.select(this);
            let yOffset = 0;
        
            d.experience.forEach((count, index) => {
                const rectHeight = Math.max(d.dy * (count / d3.sum(d.experience)) - 1, 0);
                
        
                node.append("svg:rect")
                    .attr("x", 0)
                    .attr("y", yOffset)
                    .attr("width", d.dx - 1)
                    .attr("height", rectHeight)
                    .style("fill", function(d) { return color(d.parent.name); })
                    .style("opacity", opacities[index])
                    .on("mouseover", handleMouseOver)
                    .on("mousemove", handleMouseMove)
                    .on("mouseout", handleMouseOut);
        
                yOffset += rectHeight;
            });
        });
        
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
    
        t.each(function(d) {
            const node = d3.select(this);
            let yOffset = 0;
    
            d.experience.forEach((count, index) => {
                let rectHeight = ky * d.dy * (count / d3.sum(d.experience)) - 1;
                rectHeight = Math.max(rectHeight, 0); // Ensure the height is not negative
    
                node.selectAll("rect").filter(function(_, i) { return i === index; })
                    .attr("width", kx * d.dx - 1)
                    .attr("height", rectHeight)
                    .attr("y", yOffset);
    
                yOffset += rectHeight;
            });
        });
    
        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
    
        node = d;
        d3.event.stopPropagation();
    }
}


function draw_treemap() {
    loadData()
        .then(rawdata => transformData(rawdata))
        .then(transformedData => render(transformedData))
        .catch(error => console.error("An error occurred:", error));
};

draw_treemap();


