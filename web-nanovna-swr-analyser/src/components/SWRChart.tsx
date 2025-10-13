import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BandSWRData, RSGB_BAND_PLANS, BandPlanSegment } from '../types';
import { formatFrequency, getSWRQuality } from '../lib/swrCalculator';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SWRChartProps {
  bandData: BandSWRData;
  showGrid?: boolean;
  showBandPlan?: boolean;
  height?: number;
}

export const SWRChart: React.FC<SWRChartProps> = ({
  bandData,
  showGrid = true,
  showBandPlan = false,
  height = 300,
}) => {
  const minSWRQuality = getSWRQuality(bandData.minSWR);
  const bandPlanSegments = showBandPlan ? RSGB_BAND_PLANS[bandData.band.name] : undefined;

  // Create band plan background datasets if enabled
  const bandPlanDatasets = [];
  if (showBandPlan && bandPlanSegments) {
    const maxSWR = Math.min(10, Math.ceil(bandData.maxSWR + 1));

    bandPlanSegments.forEach((segment, idx) => {
      // Find the data points that fall within this segment
      const segmentData = bandData.swrPoints.map(point => {
        if (point.frequency >= segment.startFreq && point.frequency <= segment.endFreq) {
          return maxSWR; // Return max value to fill the area
        }
        return null; // Return null for points outside this segment
      });

      // Only add dataset if it has any data points
      if (segmentData.some(val => val !== null)) {
        bandPlanDatasets.push({
          label: segment.label,
          data: segmentData,
          backgroundColor: segment.color,
          borderColor: 'transparent',
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: {
            target: 'origin',
            above: segment.color,
          },
          order: 2, // Draw behind the SWR line
          showLine: false,
          spanGaps: false,
          hidden: false, // Show the dataset
          // Hide from legend
          plugins: {
            legend: {
              display: false
            }
          }
        });
      }
    });
  }

  const chartData = {
    labels: bandData.swrPoints.map(point => formatFrequency(point.frequency)),
    datasets: [
      ...bandPlanDatasets,
      {
        label: 'SWR',
        data: bandData.swrPoints.map(point => point.swr),
        borderColor: bandData.band.color,
        backgroundColor: bandData.band.color + '20', // Add transparency
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: bandData.band.color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        borderWidth: 3,
        order: 1, // Draw on top
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${bandData.band.name} Band SWR`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: bandData.band.color,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        titleFont: {
          size: 13,
          weight: 'normal',
        },
        bodyFont: {
          size: 13,
          weight: 'bold',
        },
        filter: function(tooltipItem) {
          // Only show tooltip for the SWR dataset (which has label 'SWR')
          return tooltipItem.dataset.label === 'SWR';
        },
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const point = bandData.swrPoints[index];
            return formatFrequency(point.frequency);
          },
          label: (context) => {
            const swr = context.parsed.y;
            return `${swr.toFixed(2)}:1`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Frequency',
        },
        grid: {
          display: showGrid,
        },
        ticks: {
          maxTicksLimit: 6,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'SWR',
        },
        min: 1,
        max: Math.min(10, Math.ceil(bandData.maxSWR + 1)),
        grid: {
          display: showGrid,
        },
        ticks: {
          callback: function(value) {
            return value + ':1';
          },
        },
      },
    },
  };

  return (
    <div className="swr-chart-container" style={{ marginBottom: '20px' }}>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong>Min SWR:</strong>{' '}
            <span style={{ color: minSWRQuality.color }}>
              {bandData.minSWR.toFixed(2)}:1
            </span>
          </div>
          <div>
            <strong>Max SWR:</strong> {bandData.maxSWR.toFixed(2)}:1
          </div>
          <div>
            <strong>Avg SWR:</strong> {bandData.avgSWR.toFixed(2)}:1
          </div>
          <div>
            <strong>Best Match:</strong>{' '}
            <span style={{ color: minSWRQuality.color }}>
              {minSWRQuality.quality}
            </span>
          </div>
        </div>
      </div>

      {showBandPlan && bandPlanSegments && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          <strong>RSGB Band Plan:</strong>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '5px',
          }}>
            {/* Get unique modes that actually exist in the band plan for this band */}
            {Array.from(new Set(bandPlanSegments.map(s => s.mode)))
              .map(mode => {
                const segment = bandPlanSegments.find(s => s.mode === mode);
                if (!segment) return null;

                // Use the label from the segment for display
                const displayLabel = segment.label || mode;

                return (
                  <div
                    key={mode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: segment.color,
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '2px',
                        marginRight: '6px',
                      }}
                    />
                    <span>{displayLabel}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};