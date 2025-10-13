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
import { formatFrequency, getSWRQuality, swrToReturnLoss, swrToPowerReflected } from '../lib/swrCalculator';

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

  const chartData = {
    labels: displayPoints.map(point => formatFrequency(point.frequency)),
    datasets: [
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
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
            const pointIndex = tooltipItems[0].dataIndex * downsampleRate;
            const actualPoint = swrPoints[Math.min(pointIndex, swrPoints.length - 1)];
            return formatFrequency(actualPoint.frequency);
          },
          label: (context) => {
            const swr = context.parsed.y;
            const quality = getSWRQuality(swr);
            const returnLoss = swrToReturnLoss(swr);
            const powerReflected = swrToPowerReflected(swr);
            const pointIndex = context.dataIndex * downsampleRate;
            const actualPoint = swrPoints[Math.min(pointIndex, swrPoints.length - 1)];

            // Check which band this point belongs to
            const band = presentBands.find(b =>
              actualPoint.frequency >= b.startFreq &&
              actualPoint.frequency <= b.endFreq
            );

            const labels = [
              `SWR: ${swr.toFixed(3)}:1`,
              `Quality: ${quality.quality}`,
              `Return Loss: ${returnLoss === Infinity ? '∞' : returnLoss.toFixed(1)} dB`,
              `Power Reflected: ${powerReflected.toFixed(1)}%`,
              `Power Transmitted: ${(100 - powerReflected).toFixed(1)}%`,
            ];

            if (band) {
              labels.push(`Band: ${band.name}`);
            }

            return labels;
          },
          afterLabel: (context) => {
            const swr = context.parsed.y;
            const quality = getSWRQuality(swr);
            return `\n${quality.description}`;
          },
        },
      },
      // Add custom plugin to draw band highlights
      ...(showBandHighlights && {
        annotation: {
          annotations: presentBands.reduce((acc, band) => {
            const bandStart = displayPoints.findIndex(p => p.frequency >= band.startFreq);
            const bandEnd = displayPoints.findIndex(p => p.frequency > band.endFreq);

            if (bandStart !== -1) {
              acc[band.name] = {
                type: 'box',
                xMin: bandStart,
                xMax: bandEnd === -1 ? displayPoints.length - 1 : bandEnd,
                backgroundColor: band.color + '10', // Very transparent
                borderColor: band.color,
                borderWidth: 1,
                label: {
                  content: band.name,
                  enabled: true,
                  position: 'start',
                },
              };
            }
            return acc;
          }, {} as any),
        },
      }),
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