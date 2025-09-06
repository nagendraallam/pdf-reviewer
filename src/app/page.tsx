"use client";

import { useState } from "react";
import {
  ArrowUpTrayIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Redirect to chat page after successful upload
      window.location.href = "/chat";
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">PDF Reviewer</h1>
        <p className="text-center text-lg mb-8">
          Upload your PDF and chat with it using AI
        </p>

        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ArrowUpTrayIcon className="w-12 h-12 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only</p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {file && (
              <div className="w-full">
                <p className="text-sm text-gray-500 mb-2">Selected file:</p>
                <p className="text-sm font-medium">{file.name}</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg ${
                !file || uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Start Chatting
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
