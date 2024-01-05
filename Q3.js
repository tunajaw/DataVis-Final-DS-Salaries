// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 100, left: 180},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
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

// Job Title, Experience Level, Company Location, Salary in USD
function transformData (data) {
    return new Promise((resolve, reject) => {
        // Initialize an empty dictionary to store the transformed data
        const transformedData = {};

        // Iterate through the data and populate the dictionary
        data.forEach(row => {
            // Create a unique key by combining Job Title and Experience Level
            const key = `${row['Job Title']}_${row['Experience Level']}`;

            // If the key does not exist in the dictionary, create an array for it
            if (!transformedData[key]) {
                transformedData[key] = [];
            }

            // Push Company Location and Salary in USD to the array
            transformedData[key].push({
                'Company Location': row['Company Location'],
                'Salary in USD': +row['Salary in USD'], // Convert Salary to a number
            });
        });

        // Calculate the mean Salary in USD for each unique combination
        for (const key in transformedData) {
            const locations = {};
            transformedData[key].forEach(entry => {
                const { 'Company Location': location, 'Salary in USD': salary } = entry;
                if (!locations[location]) {
                    locations[location] = { sum: 0, count: 0 };
                }
                locations[location].sum += salary;
                locations[location].count += 1;
            });

            const meanSalaries = Object.entries(locations).map(([location, { sum, count }]) => ({
                'Company Location': location,
                'Mean Salary in USD': sum / count,
                'count': count,
            }));

            transformedData[key] = meanSalaries;
        }

        // Get selected values from dropdowns
        const selectedJobTitle = document.getElementById('jobTitleDropdown').value;
        const selectedExpertiseLevel = document.getElementById('expertiseLevelDropdown').value;
        selectedData = transformedData[selectedJobTitle+'_' + selectedExpertiseLevel];
        if(selectedData){
            var paragraph = document.getElementById('no_data');
            paragraph.innerHTML = '';
            selectedData.columns =['Company Location', 'Mean Salary in USD'];
            resolve(selectedData);
        }
        else {
            var paragraph = document.getElementById('no_data');
            paragraph.innerHTML = '';
            paragraph.textContent = 'No data!';
            document.body.appendChild(paragraph);
            d3.select("#my_dataviz").selectAll("*").remove();
        }
    })
}

const render = (data) =>{
    d3.select("#my_dataviz").selectAll("*").remove();
    console.log("data");
    console.log(data);

    // Sort the data by Mean Salary in USD in descending order
    data.sort((a, b) => b['Mean Salary in USD'] - a['Mean Salary in USD']);

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // Calculate the maximum salary from the data
    var maxSalary = d3.max(data, function(d) {
        return d['Mean Salary in USD'];
    });
    console.log(maxSalary);
    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, maxSalary]) // Update the domain
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return d['Company Location']; }))
        .padding(.1);
    svg.append("g")
        .call(d3.axisLeft(y))

    //Bars with tooltip
    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d['Company Location']); })
        .attr("width", function(d) { return x(d['Mean Salary in USD']); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#69b3a2")
        .on("mouseover", handleMouseOver) // Add mouseover event
        .on("mousemove", handleMouseMove) // Add mousemove event
        .on("mouseout", handleMouseOut) // Add mouseout event;
        
     // X-axis title
     svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom -20 ) + ")")
        .text("Mean Salary in USD");
    
    // Y-axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (-margin.left + 20) + "," + (height / 2) + ")rotate(-90)")
        .text("Company Location");

    // Tooltip div
    // Tooltip div
    var tooltip = d3.select("#tooltip")

    function handleMouseOver(d) {
        tooltip.style("display", "block")
            .html(_getTooltipContent(d));
    }
    
    function handleMouseMove(d) {
        var tooltipX = d3.event.pageX - 170;
        var tooltipY = d3.event.pageY + 10;
        tooltipX = Math.max(0, tooltipX); // Prevent going off-screen left
        tooltipY = Math.max(0, tooltipY); // Prevent going off-screen top
        tooltip.style("left", tooltipX + "px")
                .style("top", tooltipY + "px");
    }
    
    function handleMouseOut(d) {
        tooltip.style("display", "none");
    }
        
    function _round_2_dec(x) {
        return Math.round(x * 100) / 100;
    }

    function _getTooltipContent(d) {
        let salary = "Salary: $" + _round_2_dec(d['Mean Salary in USD']);
        let count = "Population: " + d.count; // Assuming 'count' is available in your data
        return salary + "<br>" + count;
    }
}

function create_options(){
    loadData().then(rawdata => {
        console.log(rawdata);
        var Job_set = new Set();
        var Exp_set = new Set();
        rawdata.forEach(data => {
            Job_set.add(data['Job Title']);
            Exp_set.add(data['Experience Level']);
        });

        // Convert Exp_set to array and sort it
        var sortedExpArray = Array.from(Exp_set).sort((a, b) => {
            // Define the order for Experience Levels: Entry, Mid, Executive, Senior
            const order = ['Entry', 'Mid', 'Senior', 'Executive'];
            return order.indexOf(a) - order.indexOf(b);
        });

        var Job_element = document.getElementById('jobTitleDropdown');
        var Exp_element = document.getElementById('expertiseLevelDropdown');

        // Append options for Exp_element
        sortedExpArray.forEach(function(exp){
            var option = document.createElement('option');
            option.value = exp;
            option.textContent = exp;
            Exp_element.appendChild(option);
        });

        // Set the default selected option for Exp_element
        Exp_element.value = sortedExpArray[3]; // Choose the first experience level by default

        // Convert Job_set to array and sort it lexicographically
        var sortedJobArray = Array.from(Job_set).sort();

        // Append options for Job_element
        sortedJobArray.forEach(function(job){
            var option = document.createElement('option');
            option.value = job;
            option.textContent = job;
            Job_element.appendChild(option);
        });

        // Set the default selected option for Job_element
        Job_element.value = sortedJobArray[39]; // Choose the first job title by default
    })
}


create_options();
function draw_barchart() {
    loadData()
        .then(rawdata => transformData(rawdata))
        .then(transformedData => render(transformedData))
        .catch(error => console.error("An error occurred:", error));
}
draw_barchart();