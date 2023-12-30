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

    var w = 1280 - 80,
        h = 800 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root,
        node;

    console.log(data);
}



loadData()
    .then(rawdata => transformData(rawdata))
    .then(transformedData => render(transformedData))
    .catch(error => console.error("An error occurred:", error));