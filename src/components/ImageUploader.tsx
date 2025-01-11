"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelect: (image: string) => void;
  onImageRemove: () => void;
}

const ImageUploader = ({
  selectedImage,
  onImageSelect,
  onImageRemove,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200">
      <div className="text-center">
        {!selectedImage ? (
          <div
            className={`relative border-2 ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } border-dashed rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors`}
            onClick={() => document.getElementById("file-upload")?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop images of websites, Figma designs,
              </p>
              <p className="text-sm text-gray-600 mb-4">or UI mockups here</p>
              <p className="text-sm text-gray-400">or</p>
              <Button variant="outline" className="mt-4">
                Choose image
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="mt-4 text-xs text-gray-400">
              Note: Only one image can be uploaded at a time.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-20">
              <Button
                onClick={onImageRemove}
                variant="destructive"
                className="inline-flex items-center gap-2 py-3 px-6"
              >
                <X className="w-5 h-5" />
                Remove Image
              </Button>
            </div>
            <div className="relative w-full aspect-video">
              <Image
                src={selectedImage}
                alt="Uploaded design"
                fill
                className="rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;