// set the dimensions and margins of the graph
const margin = {top: 50, right: 0, bottom: 50, left: 0},
    width = 900 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;
    
const svg_translation = {x: 150, y: 50};

function _get_sliced_dict(dict, keys) {
    return keys.reduce((obj, key) => {
        if (key in dict) obj[key] = dict[key];
        return obj;
    }, {});
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
        transformedData = [];
        selected_key = ['Category', 'Job Title', 'Experience Level']
        // Step 1: Aggregate data by 'Job Title' and calculate counts
        data.forEach((d) => {

            const jobTitle = d['Job Title'];

            if (jobTitle.includes('Data') && jobTitle.includes('Scien')) {
                d['Category'] = 'Data Science';
            } else if (jobTitle.includes('Data') && jobTitle.includes('Engineer')) {
                d['Category'] = 'Data Engineer';
            } else if (jobTitle.includes('Analy')) {
                d['Category'] = 'Data Analytics';
            } else if (jobTitle.includes('Machine Learning') || jobTitle.includes('ML')) {
                d['Category'] = 'Machine Learning';
            } else {
                d['Category'] = 'Others';
            }

            transformedData.push(_get_sliced_dict(dict=d, keys=selected_key))
           
        });
        
        resolve(transformedData);
    })
}

function render (data) {

    classNames = ['Category', 'Job Title', 'Experience Level']

    var units = "Widgets";
 
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 1200 - margin.left - margin.right,
        height = 740 - margin.top - margin.bottom;
    
    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scale.category20();
    
    // append the svg canvas to the page
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
    
    // Set the sankey diagram properties
    // var sankey = d3.sankey()
    //     .nodeWidth(36)
    //     .nodePadding(10)
    //     .size([width, height]);
    
    //var path = sankey.link();
    let freq = {};
  	let graph = {};
  	let raw_nodes = [];
  	let raw_edges = {};
  	let nodes = [];
  	let edges = [];
  	let from;
  	let to;
  	let from_to;

    for(let i=0; i<2; i=i+1){
        data.forEach(function (d){
            // add node
            from = d[classNames[i]];
            to = d[classNames[i+1]];
            if(!(raw_nodes.includes(from))){
                raw_nodes.push(from);
            }
            if(!(raw_nodes.includes(to))){
                raw_nodes.push(to);
            }
            // add edges
            from_to = from + '+' + to;
            if(from_to in raw_edges){
                raw_edges[from_to] += 1;
            }
            else{
                raw_edges[from_to] = 1;
            }
        });
    }

    raw_nodes.forEach(function(d){
        nodes.push({
            "name" : d
        });
    });
        
    
    for (let [key, value] of Object.entries(raw_edges)){
        edges.push({
            "source" : key.split('+')[0],
            "target" : key.split('+')[1],
            "value" : value.toString()
        });
    }
        
    console.log('nodes');
    console.log(nodes);
    console.log('edges');
    console.log(edges);
    
    graph = {
        "links" : edges,
        "nodes" : nodes
    };
    
    console.log(graph);
    
    var nodeMap = {};
    graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
    graph.links = graph.links.map(function(x) {
    return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
    };
    });
    console.log(graph);
    // sankey
    //     .nodes(graph.nodes)
    //     .links(graph.links)
    //     .layout(32);
    
    // console.log('construt link...')
    // // add in the links
    // var link = svg.append("g").selectAll(".link")
    //     .data(graph.links)
    //     .enter().append("path")
    //     .attr("class", "link")
    //     .attr("d", path)
    //     .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    //     .sort(function(a, b) { return b.dy - a.dy; });
   
    // // add the link titles
    // link.append("title")
    //       .text(function(d) {
    //         return d.source.name + " → " + 
    //               d.target.name + "\n" + format(d.value); });

    // console.log('   nodes...')
   
    // // add in the nodes
    // var node = svg.append("g").selectAll(".node")
    //     .data(graph.nodes)
    //     .enter().append("g")
    //     .attr("class", "node")
    //     .attr("transform", function(d) { 
    //         return "translate(" + d.x + "," + d.y + ")"; })
    //     .call(d3.behavior.drag()
    //     .origin(function(d) { return d; })
    //     .on("dragstart", function() { 
    //         this.parentNode.appendChild(this); })
    //     .on("drag", dragmove));
   
    // // add the rectangles for the nodes
    // node.append("rect")
    //     .attr("height", function(d) { return d.dy; })
    //     .attr("width", sankey.nodeWidth())
    //     .style("fill", function(d) { 
    //         return d.color = color(d.name.replace(/ .*/, "")); })
    //     .style("stroke", function(d) { 
    //         return d3.rgb(d.color).darker(2); })
    //   .append("title")
    //     .text(function(d) { 
    //         return d.name + "\n" + format(d.value); });
   
    // // add in the title for the nodes
    // node.append("text")
    //     .attr("x", -6)
    //     .attr("y", function(d) { return d.dy / 2; })
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "end")
    //     .attr("transform", null)
    //     .text(function(d) { return d.name; })
    //   .filter(function(d) { return d.x < width / 2; })
    //     .attr("x", 6 + sankey.nodeWidth())
    //     .attr("text-anchor", "start");
    
    //     console.log('   dragging...')
    // // the function for moving the nodes
    // function dragmove(d) {
    //   d3.select(this).attr("transform", 
    //       "translate(" + (
    //              d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
    //           ) + "," + (
    //                  d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
    //           ) + ")");
    //   sankey.relayout();
    //   link.attr("d", path);
    // }
}



loadData()
    .then(rawdata => transformData(rawdata))
    .then(transformedData => render(transformedData))
    .catch(error => console.error("An error occurred:", error));