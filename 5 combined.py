# -*- coding: utf-8 -*-
"""
Created on Sat Dec 23 16:02:43 2023

@author: popul
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Define the reservoir name and the start and end dates for the analysis
reservoir_name = "Baish"
start_date = '2015-09-01'
end_date = '2020-07-01'

# File paths
landsat_file = f"{reservoir_name}_ls.csv"
sentinel2_file = f"{reservoir_name}_s2.csv"
reservoir_file = f"{reservoir_name}_res.xlsx"
sentinel1_file = f"{reservoir_name}_s1.csv"

# Read the CSV files
landsat_df = pd.read_csv(landsat_file)
sentinel2_df = pd.read_csv(sentinel2_file)
sentinel1_df = pd.read_csv(sentinel1_file)

# Read the Excel file
reservoir_df = pd.read_excel(reservoir_file)

# Convert 'Date' columns to datetime objects
landsat_df['Date'] = pd.to_datetime(landsat_df['Date'])
sentinel2_df['Date'] = pd.to_datetime(sentinel2_df['Date'])
reservoir_df['Date'] = pd.to_datetime(reservoir_df['Date'])
sentinel1_df['Date'] = pd.to_datetime(sentinel1_df['Date'])

# Filter data based on the specified date range
landsat_df = landsat_df[(landsat_df['Date'] >= start_date) & (landsat_df['Date'] <= end_date)]
sentinel2_df = sentinel2_df[(sentinel2_df['Date'] >= start_date) & (sentinel2_df['Date'] <= end_date)]
reservoir_df = reservoir_df[(reservoir_df['Date'] >= start_date) & (reservoir_df['Date'] <= end_date)]
sentinel1_df = sentinel1_df[(sentinel1_df['Date'] >= start_date) & (sentinel1_df['Date'] <= end_date)]

# Ensure that data is sorted by date
landsat_df = landsat_df.sort_values(by='Date')
sentinel2_df = sentinel2_df.sort_values(by='Date')
sentinel1_df = sentinel1_df.sort_values(by='Date')
reservoir_df = reservoir_df.sort_values(by='Date')

# Extract month and calculate the median for each month
landsat_df['Month'] = landsat_df['Date'].dt.month
sentinel2_df['Month'] = sentinel2_df['Date'].dt.month
reservoir_df['Month'] = reservoir_df['Date'].dt.month
sentinel1_df['Month'] = sentinel1_df['Date'].dt.month

landsat_monthly_median = landsat_df.groupby('Month')['Water extent - Landsat (sq km)'].median()
sentinel2_monthly_median = sentinel2_df.groupby('Month')['Water Extent -Sentinel 2 (sq km)'].median()
reservoir_monthly_median = reservoir_df.groupby('Month')['Elevation'].median()
sentinel1_monthly_median = sentinel1_df.groupby('Month')['Water Extent -Sentinel 1 (sq km)'].median()

# Time series plot
fig, ax1 = plt.subplots(figsize=(12, 6))

ax1.plot(landsat_df['Date'], landsat_df['Water extent - Landsat (sq km)'], label='Landsat Area (km²)', color='blue', linestyle='-')
ax1.plot(sentinel2_df['Date'], sentinel2_df['Water Extent -Sentinel 2 (sq km)'], label='Sentinel-2 Area (km²)', color='green', linestyle='-')
ax1.plot(sentinel1_df['Date'], sentinel1_df['Water Extent -Sentinel 1 (sq km)'], label='Sentinel-1 Area (km²)', color='orange', linestyle='-')
ax1.set_xlabel('Date')
ax1.set_ylabel('Area (km²)', color='black')
ax1.tick_params(axis='y', labelcolor='black')

# Twin axis for elevation
ax2 = ax1.twinx()
ax2.plot(reservoir_df['Date'], reservoir_df['Elevation'], label='Reservoir Elevation (m)', color='red', linestyle=':')
ax2.set_ylabel('Elevation (m)', color='black')
ax2.tick_params(axis='y', labelcolor='black')


fig.legend(loc='upper center', bbox_to_anchor=(0.5, 0.04), ncol=5)
plt.title(f'{reservoir_name} - Satellite observed Water Area and Reservoir Data Time Series', size=16)
plt.grid(True)
plt.show()

# Annual cycle plot
fig, ax1 = plt.subplots(figsize=(12, 6))

ax1.plot(landsat_monthly_median.index, landsat_monthly_median.values, label='Landsat Area (km²)', color='blue', linestyle='-')
ax1.plot(sentinel2_monthly_median.index, sentinel2_monthly_median.values, label='Sentinel-2 Area (km²)', color='green', linestyle='-')
ax1.plot(sentinel1_monthly_median.index, sentinel1_monthly_median.values, label='Sentinel-1 Area (km²)', color='orange', linestyle='-')
ax1.set_xlabel('Month')
ax1.set_ylabel('Area (km²)', color='black')
ax1.tick_params(axis='y', labelcolor='black')
ax1.set_xticks(range(1, 13))
ax1.set_xticklabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

# Twin axis for elevation median
ax2 = ax1.twinx()
ax2.plot(reservoir_monthly_median.index, reservoir_monthly_median.values, label='Reservoir Elevation Median (m)', color='red', linestyle=':')
ax2.set_ylabel('Elevation Median (m)', color='black')
ax2.tick_params(axis='y', labelcolor='black')

fig.legend(loc='upper center', bbox_to_anchor=(0.5, 0.03), ncol=5)
plt.title(f'{reservoir_name} - Annual Cycle', size=16)
plt.grid(True)
plt.tight_layout()
plt.show()