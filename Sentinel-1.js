// Define Area of Interest (AOI) and the date range for analysis
var aoi = baish; // 'baish' should be predefined as a geographic area
var startDate = '2000-09-01'; 
var endDate = '2023-07-01'; 

// Load Sentinel-1 Data
// Sentinel-1 provides C-band Synthetic Aperture Radar (SAR) imagery
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate(startDate, endDate)  // Filters the collection to the specified date range
  .filterBounds(aoi)  // Limits the dataset to images within the AOI
  .filter(ee.Filter.eq('instrumentMode', 'IW')) // Filters for Interferometric Wide (IW) mode
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']); // Selects VV and VH polarization bands

// Function to calculate water extent for a given image
function calculateWaterExtent(image) {
  var vh = image.select('VH'); // VH polarization
  var vv = image.select('VV'); // VV polarization
  var threshold = -18; // Threshold for water detection, adjust based on your area

  // Creates a mask for water bodies using both VV and VH polarization
  var waterMask = vv.lt(threshold).and(vh.lt(threshold)); 

  // Calculates the area of water pixels
  var waterArea = waterMask.multiply(ee.Image.pixelArea()).reduceRegion({ 
    reducer: ee.Reducer.sum(), 
    geometry: aoi, 
    scale: 10, // Uses Sentinel-1's resolution
    maxPixels: 1e9 
  }).get('VV'); 

  // Creates a feature with date and calculated water extent
  return ee.Feature(null, { 
    'Date': image.date().format('YYYY-MM-dd'), 
    'Water Extent -Sentinel 1 (sq km)': ee.Number(waterArea).divide(1e6), // Converts area to square kilometers
    'system:time_start': image.get('system:time_start') 
  }); 
}

// Apply function and calculate water extent for each image
var waterExtentTimeSeries = sentinel1.map(calculateWaterExtent); 

// Create a time series chart to visualize water extent over time
var timeSeriesChart = ui.Chart.feature.byFeature(waterExtentTimeSeries, 'Date', 'Water Extent -Sentinel 1 (sq km)')
  .setOptions({ 
    title: 'Water Extent Time Series (Sentinel-1)', 
    hAxis: {title: 'Date'}, 
    vAxis: {title: 'Water Extent -Sentinel 1 (sq km)'} 
  }); 

// Print the time series chart
print(timeSeriesChart);

