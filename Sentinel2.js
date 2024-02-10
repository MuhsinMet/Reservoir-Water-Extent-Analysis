// Define the area of interest (AOI)
var aoi = baish;  // 'baish' should be predefined as a geographic area

// Define the date range for analysis
var startDate = '2000-09-01'; 
var endDate = '2023-07-01'; 

// Load the Sentinel-2 ImageCollection
// Sentinel-2 provides high-resolution optical images
var sentinel2 = ee.ImageCollection('COPERNICUS/S2')
  .filterDate(startDate, endDate)  // Filters the collection to the specified date range
  .filterBounds(aoi)  // Limits the dataset to images within the AOI
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) // Filters out images with more than 30% cloud cover
  .select(['B3', 'B8']); // Selects Green (B3) and Near-Infrared (NIR, B8) bands

// Function to calculate NDWI (Normalized Difference Water Index)
function addNDWI(image) {
  // NDWI highlights water bodies; it's calculated from Green and NIR bands
  return image.addBands(image.normalizedDifference(['B3', 'B8']).rename('NDWI')); 
}

// Function to calculate water extent for a given image
function calculateWaterExtent(image) {
  var ndwi = image.select('NDWI');  // Selects the NDWI band
  var waterMask = ndwi.gt(0); // Creates a mask for water bodies (NDWI > 0)
  var waterArea = waterMask.multiply(ee.Image.pixelArea()).reduceRegion({ 
    reducer: ee.Reducer.sum(),  // Sums up the water pixels
    geometry: aoi, 
    scale: 10, // Uses 10m resolution of Sentinel-2
    maxPixels: 1e9 
  }).get('NDWI'); 

  // Creates a feature with date and calculated water extent
  return ee.Feature(null, { 
    'Date': image.date().format('YYYY-MM-dd'),  
    'Water Extent -Sentinel 2 (sq km)': ee.Number(waterArea).divide(1e6), // Converts area to square kilometers
    'system:time_start': image.get('system:time_start') 
  }); 
}

// Apply NDWI function and calculate water extent for each image
var waterExtentTimeSeries = sentinel2.map(addNDWI).map(calculateWaterExtent); 

// Create a time series chart to visualize water extent over time
var timeSeriesChart = ui.Chart.feature.byFeature(waterExtentTimeSeries, 'Date', 'Water Extent -Sentinel 2 (sq km)')
  .setOptions({ 
    title: 'Monthly Water Extent Time Series', 
    hAxis: {title: 'Date'}, 
    vAxis: {title: 'Area Extent -Sentinel (sq km)'}, 
    lineWidth: 1, 
    pointSize: 3 
  }); 

// Print the chart to the console
print(timeSeriesChart);
