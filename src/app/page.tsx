"use client";

import { Upload, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { generatePromptAction, generateCodeAction } from "./actions";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCopyToClipboard } from "usehooks-ts";
import { useCodeStore } from "@/store/code";
import Workbench from "@/components/Workbench";
import SettingsControl from "@/components/SettingsControl";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applicationType, setApplicationType] = useState("web");
  const [temperature, setTemperature] = useState(0.2);
  const [promptCopiedText, copyPromptToClipboard] = useCopyToClipboard();
  const promptContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when content updates
  useEffect(() => {
    if (promptContainerRef.current) {
      promptContainerRef.current.scrollTop =
        promptContainerRef.current.scrollHeight;
    }
  }, [generatedPrompt]);


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!selectedImage) return;

    try {
      setIsGenerating(true);
      setError(null);
      const stream = await generatePromptAction(
        selectedImage,
        applicationType,
        temperature
      );

      setGeneratedPrompt("");

      if (stream) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          setGeneratedPrompt((prev) => prev + content);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate prompt"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, applicationType, temperature]);

  const handleGenerateCode = useCallback(async () => {
    if (!selectedImage || !generatedPrompt) return;

    try {
      setIsGeneratingCode(true);
      setError(null);
      const stream = await generateCodeAction(
        selectedImage,
        generatedPrompt,
        temperature
      );

      setGeneratedCode("");
      let currentAction = "";

      if (stream) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";

          // 累积内容
          currentAction += content;

          // 检查是否包含完整的 boltAction
          if (
            currentAction.includes("<boltAction") &&
            currentAction.includes("</boltAction>")
          ) {
            const actionMatch = currentAction.match(
              /<boltAction[\s\S]*?<\/boltAction>/
            );
            if (actionMatch && actionMatch.index !== undefined) {
              const action = actionMatch[0];
              useCodeStore.getState().parseBoltAction(action);

              // 清除已处理的 action
              currentAction = currentAction.slice(
                actionMatch.index + action.length
              );
            }
          }

          setGeneratedCode((prev) => prev + content);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [selectedImage, generatedPrompt, temperature]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setGeneratedPrompt(null);
    setGeneratedCode(null);
    setError(null);
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    if (!generatedPrompt) return;
    await copyPromptToClipboard(generatedPrompt);
  }, [generatedPrompt, copyPromptToClipboard]);

  // 初始化 WebContainer
  useEffect(() => {
    useCodeStore.getState().initWebContainer();
  }, []);

  return (
    <div className="mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-6">
          Create powerful prompts for Cursor, Bolt, v0 & more..
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Built for the next generation of AI coders. Upload images of full
          applications, UI mockups, or custom designs and use our generated
          prompts to build your apps faster.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          {/* Upload Section */}
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <div className="text-center">
              {!selectedImage ? (
                <div
                  className={`relative border-2 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  } border-dashed rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors`}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop images of websites, Figma designs,
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or UI mockups here
                    </p>
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
                    <button
                      onClick={removeImage}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-500 hover:bg-red-600 text-white h-auto py-3 px-6 text-base font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x w-5 h-5"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      Remove Image
                    </button>
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

          {/* Settings Section */}
          <SettingsControl
            applicationType={applicationType}
            temperature={temperature}
            onApplicationTypeChange={setApplicationType}
            onTemperatureChange={setTemperature}
          />

          <div className="space-y-8 mt-8">
            {/* Prompt Section */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Generated Prompt:</h3>
                <div className="space-x-2">
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={!selectedImage || isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Prompt"}
                  </Button>
                  {generatedPrompt && (
                    <Button
                      variant="outline"
                      onClick={handleCopyPrompt}
                      className="gap-2"
                    >
                      {promptCopiedText ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {promptCopiedText ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>
              </div>
              <div
                ref={promptContainerRef}
                className="bg-gray-50 rounded-lg p-4 h-[200px] overflow-y-auto"
              >
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedPrompt || "*Prompt will appear here*"}
                  </ReactMarkdown>
                )}
              </div>
              {/* 生成代码按钮 */}
              <div className="w-full justify-end">
                <Button
                  className="w-full"
                  onClick={handleGenerateCode}
                  disabled={!generatedPrompt || isGeneratingCode}
                >
                  {isGeneratingCode ? "Generating..." : "Generate Code"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        {generatedCode && (
          <div className="mt-8">
            <Workbench />
          </div>
        )}
      </div>
    </div>
  );
}
