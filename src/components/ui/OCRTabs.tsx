import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import CameraComponent from "./CameraComponent";
import ImageDropzone from "./ImageDropzone";

export interface OCRTabsProps {
  onOCRResult: (result: string) => void;
}

const OCRTabs: React.FC<OCRTabsProps> = ({ onOCRResult }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <TabsPrimitive.Root defaultValue="camera" className="w-full">
        <TabsPrimitive.List className="flex gap-2 border-b border-border p-1">
          <TabsPrimitive.Trigger
            value="camera"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
              "data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}>
            Camera
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            value="upload"
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
              "data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}>
            Upload
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>
        <div className="p-4">
          <TabsPrimitive.Content value="camera" className="focus:outline-none">
            <CameraComponent onOCRResult={onOCRResult} />
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="upload" className="focus:outline-none">
            <ImageDropzone onOCRResult={onOCRResult} />
          </TabsPrimitive.Content>
        </div>
      </TabsPrimitive.Root>
    </Card>
  );
};

export default OCRTabs; 