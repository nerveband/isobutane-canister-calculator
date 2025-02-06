# Comprehensive Development Plan

## Overview

This plan expands the Isobutane Canister Calculator MVP by:
- Incorporating barcode scanning (using an updated data adapter that maps barcodes to canister IDs).
- Adding an OCR feature to extract weight values from images, with two sub-features:
  - **Camera Capture:** Uses `navigator.mediaDevices.getUserMedia()` and Tesseract.js to capture an image and perform OCR.
  - **Drag & Drop:** Allows users to drag and drop an image (or click to select) for OCR processing.
- Presenting OCR options in a tabbed interface that respects the existing layout and look & feel (leveraging shadcn UI components and Radix UI for tabs).
- Ensuring graceful handling if a barcode or OCR input is not recognized (with appropriate messaging).

## 1. Data Adapter Update

Modify the data adapter to include a mapping between barcode numbers and canister IDs. Also, expose a helper function to retrieve canister information using a scanned barcode.

**Changes:**
- Add a `barcodeMapping` constant.
- Export a helper function `getCanisterByBarcode` that looks up canister data based on a scanned barcode, returning `null` if not found.

Example implementation:

```typescript:src/adapters/canisterAdapter.ts
export interface CanisterData {
  brand: string;
  fuelWeight: number;
  weights: number[];
}

export type CanisterDataMap = {
  [key: string]: CanisterData;
};

const staticCanisterData: CanisterDataMap = {
  "MSR-110": { brand: "MSR", fuelWeight: 110, weights: [101, 129, 156, 184, 211] },
  // ... (rest of your canister data)
  "PrimusCold-450": { brand: "Primus Cold Gas", fuelWeight: 450, weights: [195, 308, 420, 533, 645] }
};

export const getCanisterData = async (): Promise<CanisterDataMap> => {
  // Simulate asynchronous data fetching.
  return Promise.resolve(staticCanisterData);
};

// Barcode mapping: scanned barcode value to canister ID.
const barcodeMapping: Record<string, string> = {
  "012345678912": "MSR-110",
  "112345678912": "JetBoil-100",
  "212345678912": "PrimusPower-100"
  // Add additional barcode mappings as needed.
};

/**
 * Retrieve canister data using a scanned barcode.
 *
 * @param barcode - The scanned barcode string.
 * @returns The matching CanisterData if found; otherwise, null.
 */
export const getCanisterByBarcode = async (barcode: string): Promise<CanisterData | null> => {
  const canisterDataMap = await getCanisterData();
  const canisterId = barcodeMapping[barcode];
  if (canisterId && canisterDataMap[canisterId]) {
    return canisterDataMap[canisterId];
  }
  return null;
};
```

## 2. OCR Feature – Tabbed UI

We will add a new UI section to let the user choose between camera capture and drag & drop image upload for OCR. Both methods will use Tesseract.js for processing.

### 2.1 Create an OCR Tabs Component

This component will render two tabs ("Camera" and "Upload") using Radix Tabs styled with shadcn UI utilities.

```typescript:src/components/ui/OCRTabs.tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import CameraComponent from "./CameraComponent";
import ImageDropzone from "./ImageDropzone";

export interface OCRTabsProps {
  onOCRResult: (result: string) => void;
}

const OCRTabs: React.FC<OCRTabsProps> = ({ onOCRResult }) => {
  return (
    <TabsPrimitive.Root defaultValue="camera">
      <TabsPrimitive.List className="flex gap-2 border-b">
        <TabsPrimitive.Trigger
          value="camera"
          className={cn("px-4 py-2 rounded-t-md focus:outline-none data-[state=active]:bg-card")}>
          Camera
        </TabsPrimitive.Trigger>
        <TabsPrimitive.Trigger
          value="upload"
          className={cn("px-4 py-2 rounded-t-md focus:outline-none data-[state=active]:bg-card")}>
          Upload
        </TabsPrimitive.Trigger>
      </TabsPrimitive.List>
      <TabsPrimitive.Content value="camera" className="p-4">
        <CameraComponent onOCRResult={onOCRResult} />
      </TabsPrimitive.Content>
      <TabsPrimitive.Content value="upload" className="p-4">
        <ImageDropzone onOCRResult={onOCRResult} />
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
};

export default OCRTabs;
```

### 2.2 Implement the Camera Component

This component accesses the user's camera, displays a live preview, and captures an image on request. The image is sent to Tesseract.js for OCR.

```typescript:src/components/ui/CameraComponent.tsx
import * as React from "react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/Button"; // Use your shadcn UI Button component

interface CameraComponentProps {
  onOCRResult: (result: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onOCRResult }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  }, []);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setLoading(true);
      try {
        const { data: { text } } = await Tesseract.recognize(canvas, "eng");
        onOCRResult(text);
      } catch (e) {
        console.error("OCR error:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} className="w-full max-w-md rounded-lg" autoPlay muted />
      <canvas ref={canvasRef} className="hidden" />
      <Button onClick={captureImage} disabled={loading} className="mt-2">
        {loading ? "Processing..." : "Capture Image"}
      </Button>
    </div>
  );
};

export default CameraComponent;
```

### 2.3 Implement the Drag & Drop Component

This component provides a drop zone where users can drag and drop an image (or click to select one) for OCR processing using Tesseract.js. It leverages the `react-dropzone` library for convenience.

```typescript:src/components/ui/ImageDropzone.tsx
import * as React from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/Button"; // Use your shadcn UI Button component

interface ImageDropzoneProps {
  onOCRResult: (result: string) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onOCRResult }) => {
  const [loading, setLoading] = React.useState(false);
  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const imageUrl = URL.createObjectURL(file);
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(imageUrl, "eng");
      onOCRResult(text);
    } catch (e) {
      console.error("OCR error:", e);
    } finally {
      setLoading(false);
    }
  }, [onOCRResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }
  });

  return (
    <div {...getRootProps()} className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer">
      <input {...getInputProps()} />
      {isDragActive
        ? <p>Drop the image here...</p>
        : <p>{loading ? "Processing..." : "Drag and drop an image here, or click to select"}</p>}
    </div>
  );
};

export default ImageDropzone;
```

## 3. Integration in the Main Calculator

Update the main component (`src/isobutane.tsx`) to include:
- Barcode scanning integration (using the updated adapter).
- The new OCR tab feature. When OCR processing returns a result, parse the numerical value (if applicable) and update the current weight field.

For example, inside your main component:
- Add a state for the OCR result.
- Render the new OCRTabs component:
  
```typescript:src/isobutane.tsx
import React, { useState, useEffect, useMemo } from "react";
import OCRTabs from "@/components/ui/OCRTabs";
import { getCanisterData, getCanisterByBarcode, type CanisterDataMap } from "@/adapters/canisterAdapter";
// ...other imports and shadcn UI components as needed

const IsobutaneCalculator = () => {
  // Existing states...
  const [currentWeight, setCurrentWeight] = useState('');
  const [useOunces, setUseOunces] = useState(false);
  const [canisterDataMap, setCanisterDataMap] = useState<CanisterDataMap | null>(null);
  // ...other states

  useEffect(() => {
    getCanisterData().then(data => setCanisterDataMap(data));
  }, []);

  // OCR callback: parse the OCR result to extract the weight value and update state.
  const handleOCRResult = (ocrText: string) => {
    // Basic extraction (this may be enhanced with better parsing)
    const extracted = ocrText.match(/\d+(\.\d+)?/);
    if (extracted) {
      setCurrentWeight(extracted[0]);
    } else {
      // Optionally display an error message to the user
      console.error("No valid weight detected in the image.");
    }
  };

  return (
    <div className="p-4">
      {/* Existing calculator UI */}
      <h1 className="text-3xl font-bold">Isobutane Canister Calculator</h1>
      {/* ...other inputs and components... */}
  
      {/* OCR Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Update Weight via OCR</h2>
        <OCRTabs onOCRResult={handleOCRResult} />
      </div>
    </div>
  );
};

export default IsobutaneCalculator;
```

## 4. Final Adjustments & Styling

- **Shadcn UI Consistency:**  
  Ensure that all new components (Buttons, Tabs, Cards, etc.) employ existing shadcn UI styling using the `cn` utility and tailwind classes.
  
- **Error Handling:**  
  Both the adapter and OCR methods must handle missing data gracefully—for instance, if a barcode isn't found, return `null` so that the UI can display a friendly message like "Sorry, we don't have that in our db."

- **Manual Verification:**  
  Since this is an MVP, perform manual tests:
  - Validate that switching between the "Camera" and "Upload" tabs works.
  - Ensure that camera capture and drag & drop trigger OCR processing.
  - Verify that OCR results correctly populate the weight input.
  - Test the barcode scanning logic separately.

## 5. Next Steps

1. **Merge the Adapter Changes:**  
   Update the adapter with barcode mapping and helper functions.

2. **Implement and Test the New UI Components:**  
   Create `OCRTabs`, `CameraComponent`, and `ImageDropzone` components and integrate them into your main calculator page.

3. **Refine OCR Parsing:**  
   Enhance logic in `handleOCRResult` as needed to properly extract numeric values from OCR text.

4. **Update Documentation:**  
   Document the new features in your README and Memory Bank (`docs/progress.md`, etc.) for future maintenance.

This plan covers all changes—from data modifications to UI adjustments—ensuring that the new OCR functionality integrates smoothly with the existing application and preserves the polished look and feel provided by shadcn UI. 