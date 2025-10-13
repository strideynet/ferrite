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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BandSWRData } from '../types';
import { formatFrequency, getSWRQuality, swrToReturnLoss, swrToPowerReflected } from '../lib/swrCalculator';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SWRChartProps {
  bandData: BandSWRData;
  showGrid?: boolean;
  height?: number;
}

export const SWRChart: React.FC<SWRChartProps> = ({
  bandData,
  showGrid = true,
  height = 300,
}) => {
  const minSWRQuality = getSWRQuality(bandData.minSWR);

  const chartData = {
    labels: bandData.swrPoints.map(point => formatFrequency(point.frequency)),
    datasets: [
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: bandData.band.color,
        borderWidth: 2,
        padding: 12,
        cornerRadius: 6,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const point = bandData.swrPoints[index];
            return formatFrequency(point.frequency);
          },
          label: (context) => {
            const swr = context.parsed.y;
            const quality = getSWRQuality(swr);
            const returnLoss = swrToReturnLoss(swr);
            const powerReflected = swrToPowerReflected(swr);

            return [
              `SWR: ${swr.toFixed(3)}:1`,
              `Quality: ${quality.quality}`,
              `Return Loss: ${returnLoss === Infinity ? '∞' : returnLoss.toFixed(1)} dB`,
              `Power Reflected: ${powerReflected.toFixed(1)}%`,
              `Power Transmitted: ${(100 - powerReflected).toFixed(1)}%`,
            ];
          },
          afterLabel: (context) => {
            const swr = context.parsed.y;
            const quality = getSWRQuality(swr);
            return `\n${quality.description}`;
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
    </div>
  );
};