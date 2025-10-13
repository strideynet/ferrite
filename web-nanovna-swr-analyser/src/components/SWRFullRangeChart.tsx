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
import { SWRPoint, Band, AMATEUR_BANDS } from '../types';
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

interface SWRFullRangeChartProps {
  swrPoints: SWRPoint[];
  bands?: Band[];
  showBandHighlights?: boolean;
  showGrid?: boolean;
  height?: number;
}

export const SWRFullRangeChart: React.FC<SWRFullRangeChartProps> = ({
  swrPoints,
  bands = AMATEUR_BANDS,
  showBandHighlights = true,
  showGrid = true,
  height = 400,
}) => {
  // Find bands that are present in the data
  const presentBands = bands.filter(band =>
    swrPoints.some(point =>
      point.frequency >= band.startFreq && point.frequency <= band.endFreq
    )
  );

  // Calculate overall statistics
  const swrValues = swrPoints.map(p => p.swr);
  const minSWR = Math.min(...swrValues);
  const maxSWR = Math.max(...swrValues);
  const avgSWR = swrValues.reduce((a, b) => a + b, 0) / swrValues.length;
  const minSWRPoint = swrPoints.find(p => p.swr === minSWR);
  const minSWRQuality = getSWRQuality(minSWR);

  // Downsample points if there are too many (for performance)
  const maxPoints = 500;
  const downsampleRate = Math.ceil(swrPoints.length / maxPoints);
  const displayPoints = downsampleRate > 1
    ? swrPoints.filter((_, index) => index % downsampleRate === 0)
    : swrPoints;

  // Create band shading datasets for each present band
  const bandShadingDatasets = presentBands.map(band => {
    const chartMaxSWR = Math.min(10, Math.ceil(maxSWR + 1));

    // Create data array with max value for points within this band
    const bandData = displayPoints.map(point => {
      if (point.frequency >= band.startFreq && point.frequency <= band.endFreq) {
        return chartMaxSWR; // Fill to top of chart
      }
      return null;
    });

    return {
      label: `${band.name} Band`,
      data: bandData,
      backgroundColor: band.color + '30', // More visible transparency (was 15)
      borderColor: 'transparent',
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: {
        target: 'origin',
        above: band.color + '30', // Increased opacity for better visibility
      },
      order: 3, // Draw behind everything
      showLine: false,
      spanGaps: false,
      hidden: false,
    };
  });

  const chartData = {
    labels: displayPoints.map(point => formatFrequency(point.frequency)),
    datasets: [
      ...bandShadingDatasets,
      {
        label: 'SWR',
        data: displayPoints.map(point => point.swr),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f620',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        borderWidth: 2,
        fill: false,
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
        text: 'Full Range SWR Analysis',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
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
            const pointIndex = tooltipItems[0].dataIndex * downsampleRate;
            const actualPoint = swrPoints[Math.min(pointIndex, swrPoints.length - 1)];
            return formatFrequency(actualPoint.frequency);
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
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 0,
          callback: function(value, index) {
            // Show fewer labels for better readability
            const step = Math.ceil(displayPoints.length / 10);
            if (index % step === 0) {
              return this.getLabelForValue(value as number);
            }
            return '';
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'SWR',
        },
        min: 1,
        max: Math.min(10, Math.ceil(maxSWR + 1)),
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

  // Custom band indicators below the chart
  const bandIndicators = presentBands.length > 0 && showBandHighlights && (
    <div style={{
      marginTop: '10px',
      padding: '10px',
      backgroundColor: '#f9fafb',
      borderRadius: '4px',
      fontSize: '12px',
    }}>
      <strong>Bands in sweep:</strong>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '5px',
      }}>
        {presentBands.map(band => {
          const bandPoints = swrPoints.filter(
            p => p.frequency >= band.startFreq && p.frequency <= band.endFreq
          );
          const bandMinSWR = Math.min(...bandPoints.map(p => p.swr));

          return (
            <div
              key={band.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: `1px solid ${band.color}`,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: band.color,
                  borderRadius: '50%',
                  marginRight: '4px',
                }}
              />
              <span>{band.name}</span>
              <span style={{
                marginLeft: '4px',
                color: '#6b7280',
                fontSize: '11px',
              }}>
                ({bandMinSWR.toFixed(1)}:1)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="swr-fullrange-chart-container" style={{ marginBottom: '20px' }}>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Statistics panel */}
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong>Frequency Range:</strong>{' '}
            {formatFrequency(swrPoints[0].frequency)} - {formatFrequency(swrPoints[swrPoints.length - 1].frequency)}
          </div>
          <div>
            <strong>Data Points:</strong> {swrPoints.length}
          </div>
          <div>
            <strong>Best SWR:</strong>{' '}
            <span style={{ color: minSWRQuality.color }}>
              {minSWR.toFixed(2)}:1
            </span>
            {minSWRPoint && (
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                {' '}@ {formatFrequency(minSWRPoint.frequency)}
              </span>
            )}
          </div>
          <div>
            <strong>Worst SWR:</strong> {maxSWR.toFixed(2)}:1
          </div>
          <div>
            <strong>Average SWR:</strong> {avgSWR.toFixed(2)}:1
          </div>
        </div>
      </div>

      {bandIndicators}
    </div>
  );
};