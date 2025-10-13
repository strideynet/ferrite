// Main export for library usage
export { NanoVNASWRAnalyser } from './components/NanoVNASWRAnalyser';
export type { NanoVNASWRAnalyserProps } from './components/NanoVNASWRAnalyser';

// Export utility functions for advanced usage
export { parseSParameterFile } from './lib/sparamParser';
export {
  calculateSWR,
  getBandSWRData,
  filterSWRByBand,
  formatFrequency,
  getSWRQuality,
  swrToReturnLoss,
  swrToPowerReflected,
  swrToPowerTransmitted,
} from './lib/swrCalculator';

// Export types
export * from './types';

// For standalone/embedded usage
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NanoVNASWRAnalyser, type NanoVNASWRAnalyserProps } from './components/NanoVNASWRAnalyser';

// Function to mount the component in a specific DOM element
export function mountNanoVNASWRAnalyser(
  elementId: string,
  props?: Partial<NanoVNASWRAnalyserProps>
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const root = ReactDOM.createRoot(element);
  root.render(
    <React.StrictMode>
      <NanoVNASWRAnalyser {...props} />
    </React.StrictMode>
  );

  // Return unmount function
  return () => root.unmount();
}

// Auto-mount if a specific element exists (for simple embedding)
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const autoMountElement = document.querySelector('[data-nanovna-swr-auto-mount]');
    if (autoMountElement) {
      const elementId = autoMountElement.id || 'nanovna-swr-analyser-auto';
      if (!autoMountElement.id) {
        autoMountElement.id = elementId;
      }

      // Parse data attributes for configuration
      const showAllBands = autoMountElement.getAttribute('data-show-all-bands') === 'true';
      const chartHeight = parseInt(
        autoMountElement.getAttribute('data-chart-height') || '300'
      );

      mountNanoVNASWRAnalyser(elementId, {
        showAllBands,
        chartHeight,
      });
    }
  });

  // Expose to window for manual mounting
  (window as any).NanoVNASWRAnalyser = {
    mount: mountNanoVNASWRAnalyser,
  };
}