# NanoVNA SWR Analyser

A lightweight web component for analyzing NanoVNA S-parameter files and generating SWR (Standing Wave Ratio) graphs for amateur radio bands. Perfect for embedding into static websites or using as a standalone tool.

## Features

- 📊 **Multi-Band Analysis** - Automatically detects and displays SWR for all amateur bands in your sweep data
- 📉 **Full Range View** - View the entire frequency sweep in a single chart with band highlighting
- 📁 **File Format Support** - Supports S1P and S2P Touchstone formats (RI, MA, DB formats)
- 🎯 **Interactive Charts** - Beautiful, interactive charts with hover tooltips showing exact SWR values
- 📈 **Band Statistics** - Shows min, max, and average SWR for each band with quality assessment
- 🎨 **Customizable Display** - Select which bands to display, toggle full range view, adjust chart heights
- 📦 **Easy Integration** - Simple to embed into any website with minimal setup

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Build as library for embedding
pnpm build:lib
```

### Usage in Your Website

1. **Build the library:**
```bash
pnpm build:lib
```

2. **Include the built files in your HTML:**
```html
<!-- Include React and ReactDOM if not already present -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Include the NanoVNA SWR Analyser -->
<script src="path/to/nanovna-swr-analyser.umd.js"></script>
```

3. **Add the component to your page:**

**Option A: Auto-mount with data attributes**
```html
<div id="swr-analyser"
     data-nanovna-swr-auto-mount
     data-show-all-bands="false"
     data-chart-height="350">
</div>
```

**Option B: Manual mounting with JavaScript**
```html
<div id="my-analyser"></div>

<script>
  window.NanoVNASWRAnalyser.mount('my-analyser', {
    showAllBands: false,
    chartHeight: 350,
    onDataLoaded: function(data) {
      console.log('Bands analyzed:', data);
    }
  });
</script>
```

## Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bands` | `Band[]` | Amateur bands | Array of frequency bands to detect |
| `showAllBands` | `boolean` | `false` | Whether to show all bands initially |
| `showFullRange` | `boolean` | `true` | Whether to show the full range chart by default |
| `chartHeight` | `number` | `300` | Height of each chart in pixels |
| `onDataLoaded` | `function` | - | Callback when data is loaded and analyzed |
| `style` | `CSSProperties` | `{}` | Custom styles for the container |

## Supported File Formats

The component supports Touchstone S-parameter files:
- **S1P** - Single-port measurements (S11 only)
- **S2P** - Two-port measurements (S11, S21, S12, S22)

Data formats:
- **RI** - Real/Imaginary
- **MA** - Magnitude/Angle
- **DB** - dB/Angle

## Amateur Bands

The component automatically detects these amateur radio bands:

**HF Bands:**
- 160m (1.8-2.0 MHz)
- 80m (3.5-4.0 MHz)
- 40m (7.0-7.3 MHz)
- 30m (10.1-10.15 MHz)
- 20m (14.0-14.35 MHz)
- 17m (18.068-18.168 MHz)
- 15m (21.0-21.45 MHz)
- 12m (24.89-24.99 MHz)
- 10m (28.0-29.7 MHz)

**VHF/UHF Bands:**
- 6m (50-54 MHz)
- 2m (144-148 MHz)
- 70cm (420-450 MHz)

## SWR Quality Indicators

The component provides visual quality indicators for SWR values:

- 🟢 **Excellent** (≤ 1.5:1) - Ideal match, minimal power loss
- 🔵 **Good** (≤ 2.0:1) - Acceptable for most applications
- 🟡 **Fair** (≤ 3.0:1) - Some power loss, tuning recommended
- 🔴 **Poor** (> 3.0:1) - Significant power loss, tuning required

## Development

### Project Structure

```
web-nanovna-swr-analyser/
├── src/
│   ├── components/           # React components
│   │   ├── NanoVNASWRAnalyser.tsx
│   │   ├── FileUpload.tsx
│   │   ├── SWRChart.tsx
│   │   └── SWRFullRangeChart.tsx
│   ├── lib/                  # Core logic
│   │   ├── sparamParser.ts   # S-parameter file parser
│   │   └── swrCalculator.ts   # SWR calculations
│   ├── types/                # TypeScript type definitions
│   ├── index.tsx             # Library entry point
│   └── main.tsx              # Development entry point
├── index.html                # Development HTML
├── standalone.html           # Standalone example
├── sample-multiband.s1p      # Sample multi-band test file
└── vite.config.ts            # Vite configuration
```

### Building

The project uses Vite for building:

- **Development build**: `pnpm build` - Creates a full application
- **Library build**: `pnpm build:lib` - Creates UMD and ES modules for embedding

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

Built for the amateur radio community to make antenna analysis more accessible.