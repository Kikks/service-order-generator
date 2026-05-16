# Church Service Order Generator

A Progressive Web App (PWA) for creating and exporting church service orders with a beautiful, professional design.

## Features

- **Easy Service Management**: Add service information including church name, service title, date, and time
- **Program Segments**: Create detailed program segments with:
  - Segment title
  - Start time
  - Duration
  - Person assigned (optional)
- **Live Preview**: See your service order in real-time as you build it
- **Export as Image**: Download the service order as a high-quality PNG image
- **PWA Support**: Install on your device for offline access
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **html2canvas** for image export
- **Vite PWA Plugin** for Progressive Web App capabilities
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Enter Service Information**:
   - Fill in the church name
   - Add the service title/theme
   - Select the service date and time

2. **Add Program Segments**:
   - Enter the segment title (e.g., "Call to Worship")
   - Set the start time
   - Specify the duration in minutes
   - Optionally assign a person

3. **Preview and Export**:
   - Review the live preview on the right
   - Click "Export as Image" to download as PNG
   - Use "Clear All" to start over

## PWA Installation

When visiting the app in a supported browser, you'll see an install prompt. Click "Install" to add the app to your home screen for offline access.

## License

MIT License
