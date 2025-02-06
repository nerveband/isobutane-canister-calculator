import * as React from "react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Camera } from "lucide-react";

interface CameraComponentProps {
  onOCRResult: (result: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onOCRResult }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } // Prefer back camera on mobile
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        setError("Could not access camera. Please ensure camera permissions are granted.");
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return;

    setLoading(true);
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const { data: { text } } = await Tesseract.recognize(canvas, "eng", {
        logger: m => console.log(m)
      });
      onOCRResult(text);
      setError(null);
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error("OCR error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="p-4 bg-destructive/10 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        onClick={captureImage}
        disabled={loading}
        className="w-full max-w-[200px]"
      >
        <Camera className="mr-2 h-4 w-4" />
        {loading ? "Processing..." : "Capture Image"}
      </Button>
    </div>
  );
};

export default CameraComponent; 