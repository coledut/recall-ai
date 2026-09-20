"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onExtractedText: (text: string, fileName: string) => void;
  authToken: string;
}

export default function FileUpload({ onExtractedText, authToken }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      let extractedText = "";

      if (file.type.startsWith("image/")) {
        // Client-side OCR using Tesseract.js
        try {
          const Tesseract = await import("tesseract.js");
          console.log("🔤 Starting OCR with Tesseract.js...");
          const result = await Tesseract.recognize(file, "eng");
          extractedText = result.data.text || "";
          console.log("✅ OCR complete:", extractedText.substring(0, 100));
        } catch (ocrError) {
          console.error("OCR Error:", ocrError);
          extractedText = "[Image uploaded - OCR processing failed, manual review needed]";
        }
      } else if (file.type === "application/pdf") {
        // Server-side PDF extraction
        const formData = new FormData();
        formData.append("file", file);
        formData.append("authToken", authToken);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          extractedText = data.extractedText;
          console.log("📄 PDF extraction complete:", extractedText.substring(0, 100));
        } else {
          console.error("PDF extraction failed:", response.statusText);
          extractedText = "[PDF uploaded - extraction in progress]";
        }
      }

      setUploadedFile(file.name);
      onExtractedText(extractedText, file.name);
      setTimeout(() => setUploadedFile(null), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 hover:border-teal-400"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            <p className="text-sm text-gray-600">Extracting text...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-sm text-green-600">{uploadedFile}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-teal-500" />
            <p className="text-sm font-medium text-gray-700">
              Drag & drop image or PDF
            </p>
            <p className="text-xs text-gray-500">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}
