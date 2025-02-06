# System Architecture and Patterns

## Component Architecture

### Core Components
- `IsobutaneCalculator`: Main application component
- `TabNavigation`: Handles navigation between calculator and about sections
- `About`: Information about the application

### Data Layer
- `canisterAdapter.ts`: Data access layer for canister information
  - Static data for canister specifications
  - Barcode mapping for canister identification
  - Async data fetching simulation for future API integration

### OCR Integration
- `OCRTabs`: Container component for OCR functionality
  - Manages tab state between camera and upload options
  - Handles OCR result processing
- `CameraComponent`: Camera access and image capture
  - Uses `navigator.mediaDevices` for camera access
  - Canvas-based image capture
  - Tesseract.js integration for OCR
- `ImageDropzone`: Drag & drop file upload
  - Uses react-dropzone for file handling
  - Image preprocessing for OCR
  - Error handling for invalid files

### Barcode Scanning
- `BarcodeScanner`: ZXing integration for barcode reading
  - Camera stream management
  - Real-time barcode detection
  - Error handling for camera access
  - Automatic canister identification

## Data Flow

### Weight Input Flow
1. Manual Input:
   - Direct numeric input
   - Unit conversion (g/oz)
   - Validation against canister specs

2. OCR Input:
   - Image capture/upload
   - Tesseract.js processing
   - Text extraction and parsing
   - Weight validation
   - Unit conversion if needed

3. Barcode Flow:
   - Camera stream initialization
   - ZXing barcode detection
   - Lookup in barcode mapping
   - Canister data retrieval
   - Auto-selection of brand/model

## State Management

### Component State
- Current weight
- Selected brand/model
- Unit preference (g/oz)
- OCR processing state
- Barcode scanning state
- Error/warning messages

### Data Persistence
- In-memory canister data
- Barcode mapping
- Future: Local storage for preferences

## Error Handling

### Camera Access
- Permission checks
- Fallback to manual input
- Clear error messages
- Automatic retry options

### OCR Processing
- Image validation
- Text extraction validation
- Numeric parsing
- Range validation
- User feedback

### Barcode Scanning
- Camera stream errors
- Unrecognized barcodes
- Invalid data handling
- Graceful fallbacks

## UI/UX Patterns

### Input Methods
- Manual numeric input
- Camera capture
- Image upload
- Barcode scanning

### Feedback
- Loading states
- Success indicators
- Error messages
- Warning alerts
- Progress indicators

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast support

## Future Considerations

### Performance
- Image optimization
- OCR worker threads
- Caching strategies
- Lazy loading

### Offline Support
- Service worker
- IndexedDB storage
- Offline-first architecture

### Extensibility
- Plugin architecture for new features
- API integration points
- Custom OCR processors
- Additional barcode formats 