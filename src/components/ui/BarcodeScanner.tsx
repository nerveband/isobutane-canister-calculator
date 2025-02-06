import * as React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onOCRResult: (text: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onOCRResult }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState(false);
  const [isLiveOCR, setIsLiveOCR] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const codeReader = React.useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const ocrIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    return () => {
      stopScanning();
      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
      }
    };
  }, []);

  // Clean up when component unmounts or tab changes
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
      }
    };
  }, []);

  const processImage = async (imageSource: string | Blob) => {
    setIsProcessing(true);
    try {
      // Try barcode detection first
      const img = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
      try {
        const result = await codeReader.current?.decodeFromImageUrl(img);
        if (result) {
          onBarcodeDetected(result.getText());
          setError(null);
        }
      } catch (barcodeError) {
        // If no barcode found or error, try OCR
        const { data: { text } } = await Tesseract.recognize(imageSource, "eng", {
          logger: m => console.log(m)
        });
        if (text.trim()) {
          onOCRResult(text);
          setError(null);
        } else {
          setError("No barcode or readable text found in image.");
        }
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Could not process image. Please try again.");
    } finally {
      setIsProcessing(false);
      if (typeof imageSource === 'string') {
        URL.revokeObjectURL(imageSource);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await processImage(acceptedFiles[0]);
      }
    },
  });

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      setHasPermission(true);
      setError(null);
      setShowScanner(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera access was denied. Please grant camera permissions to use the camera.");
      } else {
        setError("Could not access camera. Please ensure your device has a working camera.");
      }
      setHasPermission(false);
      setShowScanner(false);
      console.error("Error requesting camera permission:", err);
    }
  };

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current || !hasPermission) return;

    try {
      setIsScanning(true);
      setError(null);

      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        streamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error("Error playing video:", playError);
          throw playError;
        }
      }

      // Start barcode scanning
      await codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            onBarcodeDetected(result.getText());
            if (!isLiveOCR) {
              stopScanning();
            }
          }
          // Only show error if it's not a "no barcode found" error
          if (error && !(error instanceof TypeError) && !error.message?.includes("No MultiFormat Readers")) {
            console.error("Barcode scanning error:", error);
          }
        }
      );

      // Start OCR if enabled
      if (isLiveOCR) {
        startLiveOCR();
      }
    } catch (err) {
      setError("Could not start scanning. Please try again.");
      console.error("Error starting scanner:", err);
      stopScanning();
    }
  };

  const startLiveOCR = () => {
    if (!videoRef.current || ocrIntervalRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    ocrIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !context || !isScanning) return;

      try {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const { data: { text } } = await Tesseract.recognize(canvas, "eng", {
          logger: m => console.log(m)
        });
        if (text.trim()) {
          onOCRResult(text);
        }
      } catch (err) {
        console.error("OCR error:", err);
      }
    }, 2000); // Run OCR every 2 seconds
  };

  const stopScanning = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
        ocrIntervalRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }

    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="live-ocr"
            checked={isLiveOCR}
            onCheckedChange={setIsLiveOCR}
            className="data-[state=checked]:bg-orange-500"
          />
          <Label htmlFor="live-ocr" className="text-sm">Enable Live Weight Detection</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Camera Scanner</h3>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !showScanner ? (
            <Button onClick={requestCameraPermission} className="w-full">
              Start Camera
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay={false}
                />
              </div>
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  className="w-full"
                >
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Image Upload</h3>

          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center w-full p-6 border-2 border-dashed 
              rounded-lg cursor-pointer transition-colors min-h-[200px]
              ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500'}
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-center text-gray-600">
              {isProcessing ? "Processing..." : (
                isDragActive
                  ? "Drop the image here..."
                  : "Drag and drop an image here, or click to select"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner; 