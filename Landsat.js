// Define the area of interest (AOI)
var geometry = baish;  // 'wadihali' should be pre-defined as a geographic area

// Define the date range for analysis
var startDate = '2015-09-01'; 
var endDate = '2020-07-01'; 

// Load the JRC Monthly Water History dataset
// This dataset includes global surface water information
var collection = ee.ImageCollection('JRC/GSW1_4/MonthlyHistory')
    .filterBounds(geometry)  // Limits the dataset to images within the AOI
    .filterDate(startDate, endDate);  // Limits the dataset to the specified date range

// Select the 'water' band from the dataset
// In this band, 0=no data, 1=not water, 2=water
var water = collection.select('water'); 

// Function to calculate water extent for each image in the collection
var calculateWaterExtent = function(image) { 
    // Identifies water pixels (value 2) and calculates the water-covered area
    var waterExtent = image.eq(2).multiply(ee.Image.pixelArea()).reduceRegion({ 
        reducer: ee.Reducer.sum(), 
        geometry: geometry, 
        scale: 50,  // Spatial resolution of calculation in meters
        maxPixels: 1e9 
    }); 

    // Convert area from square meters to square kilometers
    waterExtent = ee.Number(waterExtent.get('water')).divide(1e6); 

    // Filter out images with zero water extent and create a feature with date and extent
    return ee.Algorithms.If(waterExtent.gt(0), 
        ee.Feature(null, { 
            'Date': image.date().format('YYYY-MM-dd'), 
            'Water extent - Landsat (sq km)': waterExtent 
        }), 
        null 
    ); 
}; 

// Apply the function to each image and create a time series of water extent
var waterExtentTimeSeries = ee.FeatureCollection(water.map(calculateWaterExtent, true));

// Create a line chart to visualize the water extent time series
var chart1 = ui.Chart.feature.byFeature(waterExtentTimeSeries, 'Date', 'Water extent - Landsat (sq km)')
    .setChartType('LineChart')
    .setOptions({
        title: 'Monthly Water Extent Time Series',
        hAxis: {title: 'Date'},
        vAxis: {title: 'Area Extent - Landsat (sq km)'},
        lineWidth: 1,
        pointSize: 4,
    });

// Print the line chart to the console
print(chart1);
