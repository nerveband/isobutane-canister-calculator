import * as React from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import { Card } from "@/components/ui/card";
import { AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onOCRResult: (result: string) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onOCRResult }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      const { data: { text } } = await Tesseract.recognize(imageUrl, "eng", {
        logger: m => console.log(m)
      });
      onOCRResult(text);
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error("OCR error:", err);
    } finally {
      setLoading(false);
    }
  }, [onOCRResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive ? "border-primary bg-primary/10" : "border-border",
          loading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          "w-12 h-12 mb-4",
          isDragActive ? "text-primary" : "text-muted-foreground"
        )} />
        <p className="text-sm text-center text-muted-foreground">
          {loading ? "Processing..." : (
            isDragActive
              ? "Drop the image here..."
              : "Drag and drop an image here, or click to select"
          )}
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageDropzone; 