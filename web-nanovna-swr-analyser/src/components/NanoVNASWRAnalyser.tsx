import React, { useState, useCallback, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import { SWRChart } from './SWRChart';
import { SWRFullRangeChart } from './SWRFullRangeChart';
import { parseSParameterFile } from '../lib/sparamParser';
import { calculateSWR, getBandSWRData } from '../lib/swrCalculator';
import { BandSWRData, Band, SWRPoint, AMATEUR_BANDS } from '../types';

export interface NanoVNASWRAnalyserProps {
  bands?: Band[];
  showAllBands?: boolean;
  showFullRange?: boolean;
  showBandPlan?: boolean;
  chartHeight?: number;
  onDataLoaded?: (bandData: BandSWRData[]) => void;
  style?: React.CSSProperties;
}

export const NanoVNASWRAnalyser: React.FC<NanoVNASWRAnalyserProps> = ({
  bands = AMATEUR_BANDS,
  showAllBands = false,
  showFullRange = true,
  showBandPlan = false,
  chartHeight = 300,
  onDataLoaded,
  style = {},
}) => {
  const [bandData, setBandData] = useState<BandSWRData[]>([]);
  const [swrPoints, setSWRPoints] = useState<SWRPoint[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedBands, setSelectedBands] = useState<Set<string>>(new Set());
  const [showFullRangeChart, setShowFullRangeChart] = useState<boolean>(showFullRange);
  const [showBandPlanOverlay, setShowBandPlanOverlay] = useState<boolean>(showBandPlan);

  const handleFileLoad = useCallback(
    (content: string, loadedFilename: string) => {
      try {
        setError('');

        // Parse the S-parameter file
        const sparamData = parseSParameterFile(content);

        // Calculate SWR from S-parameters
        const calculatedSWRPoints = calculateSWR(sparamData);

        // Store the full SWR data
        setSWRPoints(calculatedSWRPoints);

        // Get SWR data for each band
        const bandsWithData = getBandSWRData(calculatedSWRPoints, bands);

        if (bandsWithData.length === 0 && !showFullRange) {
          setError('No data found in the selected frequency bands');
          setBandData([]);
          setSWRPoints([]);
          setFilename('');
          return;
        }

        setBandData(bandsWithData);
        setFilename(loadedFilename);

        // Auto-select all bands initially or show all if specified
        if (showAllBands) {
          setSelectedBands(new Set(bandsWithData.map(b => b.band.name)));
        } else {
          // Select bands with good SWR (min SWR < 3)
          const goodBands = bandsWithData
            .filter(b => b.minSWR < 3)
            .map(b => b.band.name);
          setSelectedBands(new Set(goodBands.length > 0 ? goodBands : [bandsWithData[0].band.name]));
        }

        // Callback with loaded data
        if (onDataLoaded) {
          onDataLoaded(bandsWithData);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse S-parameter file');
        setBandData([]);
        setSWRPoints([]);
        setFilename('');
      }
    },
    [bands, showAllBands, onDataLoaded]
  );

  const toggleBandSelection = useCallback((bandName: string) => {
    setSelectedBands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bandName)) {
        newSet.delete(bandName);
      } else {
        newSet.add(bandName);
      }
      return newSet;
    });
  }, []);

  const displayedBands = useMemo(() => {
    return bandData.filter(b => selectedBands.has(b.band.name));
  }, [bandData, selectedBands]);

  return (
    <div className="nanovna-swr-analyser" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '100%',
      padding: '20px',
      ...style,
    }}>
      {bandData.length === 0 ? (
        <div>
          <FileUpload onFileLoad={handleFileLoad} />
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '14px',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {filename}
              </h3>
              <button
                onClick={() => {
                  setBandData([]);
                  setSWRPoints([]);
                  setFilename('');
                  setSelectedBands(new Set());
                  setError('');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Load New File
              </button>
            </div>

            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6b7280' }}>
                View options:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <button
                  onClick={() => setShowFullRangeChart(!showFullRangeChart)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: showFullRangeChart ? '#3b82f6' : '#ffffff',
                    color: showFullRangeChart ? '#ffffff' : '#374151',
                    border: '2px solid #3b82f6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📊 Full Range
                </button>
                <button
                  onClick={() => setShowBandPlanOverlay(!showBandPlanOverlay)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: showBandPlanOverlay ? '#10b981' : '#ffffff',
                    color: showBandPlanOverlay ? '#ffffff' : '#374151',
                    border: '2px solid #10b981',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📡 Band Plan
                </button>
              </div>

              {bandData.length > 0 && (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6b7280' }}>
                    Select bands to display:
                  </p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    {bandData.map(({ band, minSWR }) => (
                  <button
                    key={band.name}
                    onClick={() => toggleBandSelection(band.name)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: selectedBands.has(band.name)
                        ? band.color
                        : '#ffffff',
                      color: selectedBands.has(band.name)
                        ? '#ffffff'
                        : '#374151',
                      border: `2px solid ${band.color}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {band.name}
                    <span style={{
                      marginLeft: '4px',
                      fontSize: '12px',
                      opacity: 0.9,
                    }}>
                      ({minSWR.toFixed(1)}:1)
                    </span>
                  </button>
                ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Full Range Chart */}
          {showFullRangeChart && swrPoints.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <SWRFullRangeChart
                swrPoints={swrPoints}
                bands={bands}
                showBandHighlights={true}
                height={chartHeight + 100}
              />
            </div>
          )}

          {/* Band-specific Charts */}
          {displayedBands.length === 0 && !showFullRangeChart ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280',
            }}>
              <p style={{ margin: 0 }}>
                Select one or more bands to display SWR charts
              </p>
            </div>
          ) : displayedBands.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: displayedBands.length > 1
                ? 'repeat(auto-fit, minmax(500px, 1fr))'
                : '1fr',
              gap: '20px',
            }}>
              {displayedBands.map(band => (
                <SWRChart
                  key={band.band.name}
                  bandData={band}
                  showBandPlan={showBandPlanOverlay}
                  height={chartHeight}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};