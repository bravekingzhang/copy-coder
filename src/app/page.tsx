"use client";

import { Copy, Check } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { generatePromptAction, generateCodeAction } from "./actions";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCopyToClipboard } from "usehooks-ts";
import { useCodeStore } from "@/store/code";
import Workbench from "@/components/Workbench";
import CollapsibleSettings from "@/components/CollapsibleSettings";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion";
import { ApplicationFramework } from "@/types/application";


export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [applicationType, setApplicationType] = useState<ApplicationFramework>("react");
  const [temperature, setTemperature] = useState(0.2);
  const [codeWithImage, setCodeWithImage] = useState(false);
  const [promptCopiedText, copyPromptToClipboard] = useCopyToClipboard();
  const promptContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when content updates
  useEffect(() => {
    if (promptContainerRef.current) {
      promptContainerRef.current.scrollTop =
        promptContainerRef.current.scrollHeight;
    }
  }, [generatedPrompt]);

  useEffect(() => {
    if (useCodeStore.getState().isWebcontainerReady && useCodeStore.getState().webcontainer) {
      // 等待一小段时间确保 WebContainer 完全初始化
      const timer = setTimeout(() => {
        useCodeStore.getState().initWebContainer();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!selectedImage) return;

    try {
      setIsGenerating(true);
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
      const errorMessage = err instanceof Error ? err.message : "Failed to generate prompt";
      toast.error(errorMessage, {
        description: "Please try again later",
        action: {
          label: "Try Again",
          onClick: () => {
            handleGeneratePrompt();
          },
        },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, applicationType, temperature]);

  const handleGenerateCode = useCallback(async () => {
    if (!selectedImage || !generatedPrompt) return;

    try {
      setIsGeneratingCode(true);
      await useCodeStore.getState().clearState();

      const stream = await generateCodeAction(
        codeWithImage,
        selectedImage,
        generatedPrompt,
        temperature
      );

      setGeneratedCode("");
      let currentAction = "";

      if (stream) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          // console.log(content)
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
      const errorMessage = err instanceof Error ? err.message : "Failed to generate code";
      toast.error(errorMessage, {
        description: "Please try again later",
        action: {
          label: "Try Again",
          onClick: () => {
            handleGenerateCode();
          },
        },
      });
    } finally {
      setIsGeneratingCode(false);
    }
  }, [selectedImage, generatedPrompt, codeWithImage, temperature]);


  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setGeneratedPrompt(null);
    setGeneratedCode(null);
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
          prompts to build your apps faster. and preview
        </p>
      </div>

      {/* Main Content Grid */}
      <motion.div
        className={`${generatedCode ? 'relative' : 'relative flex justify-center items-center'}`}
        layout
      >
        {/* Left Column */}
        <motion.div
          layout
          className={`${generatedCode ? 'w-1/4' : 'max-w-3xl w-full'}`}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
        >
          {/* Upload Section */}
          <ImageUploader
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            onImageRemove={removeImage}
          />

          {/* Settings Section */}
          <CollapsibleSettings
            applicationType={applicationType}
            temperature={temperature}
            codeWithImage={codeWithImage}
            onApplicationTypeChange={setApplicationType}
            onTemperatureChange={setTemperature}
            onCodeWithImageChange={setCodeWithImage}
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedPrompt || "*Prompt will appear here*"}
                </ReactMarkdown>
              </div>
              {/* 生成代码按钮 */}
              <div className="w-full justify-end">
                <Button
                  className="w-full p-6 mt-4"
                  onClick={handleGenerateCode}
                  disabled={!generatedPrompt || isGeneratingCode}
                >
                  {isGeneratingCode ? "Generating..." : "Generate Code and Preview"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <AnimatePresence>
          {generatedCode && (
            <motion.div
              className="absolute top-0 right-0 w-3/4 pl-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Workbench />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
