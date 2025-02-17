"use client";

import { Copy, Check, AlertCircle } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { generatePromptAction, generateCodeAction } from "./actions";
import { Button } from "@/components/ui/button";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { useCopyToClipboard } from "usehooks-ts";
import { useCodeStore } from "@/store/code";
import Workbench from "@/components/Workbench";
import CollapsibleSettings from "@/components/CollapsibleSettings";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion";
import { ApplicationFramework } from "@/types/application";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [applicationType, setApplicationType] = useState<ApplicationFramework>("react");
  const [temperature, setTemperature] = useState(0.2);
  const [codeWithImage, setCodeWithImage] = useState(false);
  const [, copyPromptToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  const buildErrors = useCodeStore((state) => state.buildErrors);
  const clearBuildErrors = useCodeStore((state) => state.clearBuildErrors);

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

  const handleFixCode = useCallback(async () => {
    if (!generatedPrompt || buildErrors.length === 0 || !selectedImage) return;

    try {
      setIsGeneratingCode(true);
      // 清理之前的状态
      await useCodeStore.getState().clearState();

      // 构建错误修复提示
      const errorContext = buildErrors.join('\n');
      const fixPrompt = `${generatedPrompt}\n\nThe code generated has the following errors:\n${errorContext}\n\nPlease fix these issues and regenerate the code.`;

      const stream = await generateCodeAction(
        codeWithImage,
        selectedImage,
        fixPrompt,
        temperature
      );

      setGeneratedCode("");
      let currentAction = "";

      if (stream) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          currentAction += content;

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
              currentAction = currentAction.slice(
                actionMatch.index + action.length
              );
            }
          }

          setGeneratedCode((prev) => prev + content);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fix code";
      toast.error(errorMessage, {
        description: "Please try again later",
        action: {
          label: "Try Again",
          onClick: () => {
            handleFixCode();
          },
        },
      });
    } finally {
      setIsGeneratingCode(false);
      clearBuildErrors();
    }
  }, [generatedPrompt, buildErrors, codeWithImage, selectedImage, temperature, clearBuildErrors]);

  const handleGenerateCode = useCallback(async () => {
    clearBuildErrors();
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
  }, [selectedImage, generatedPrompt, codeWithImage, temperature, clearBuildErrors]);


  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setGeneratedPrompt(null);
    setGeneratedCode(null);
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    if (!generatedPrompt) return;
    const success = await copyPromptToClipboard(generatedPrompt);
    if (success) {
      setIsCopied(true);
      // 2秒后重置复制状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [generatedPrompt, copyPromptToClipboard]);

  // 初始化 WebContainer
  useEffect(() => {
    const initContainer = async () => {
      try {
        await useCodeStore.getState().initWebContainer();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        toast.error("Failed to initialize development environment", {
          description: `Please refresh the page to try again. Error: ${errorMessage}`,
        });
      }
    };

    initContainer();
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
          className={`${generatedCode ? 'w-1/4' : 'max-w-5xl w-full'}`}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
        >
          {/* Upload Section */}
          <Accordion type="single" collapsible>
            <AccordionItem value="image-uploader">
              <AccordionTrigger className="flex gap-2">
                <span>Image Upload</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {selectedImage ? "(Image uploaded)" : "(Click to upload)"}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ImageUploader
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                  onImageRemove={removeImage}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-[600px] overflow-hidden rounded-lg border">
                <CodeMirror
                  value={generatedPrompt || "*Prompt will appear here*"}
                  height="600px"
                  theme={oneDark}
                  extensions={[markdown()]}
                  onChange={(value) => setGeneratedPrompt(value)}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    foldGutter: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    defaultKeymap: true,
                    searchKeymap: true,
                    historyKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                  }}
                />
              </div>
              {/* 生成代码按钮 */}
              <div className="w-full justify-end">
                <div className="flex gap-2">
                  <Button
                    className="flex-1 p-6 mt-4"
                    onClick={handleGenerateCode}
                    disabled={!generatedPrompt || isGeneratingCode}
                  >
                    {isGeneratingCode ? "Generating..." : "Generate Code and Preview"}
                  </Button>
                  {buildErrors.length > 0 && (
                    <Button
                      variant="destructive"
                      className="mt-4 gap-2"
                      onClick={handleFixCode}
                      disabled={isGeneratingCode}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Fix Code ({buildErrors.length})
                    </Button>
                  )}
                </div>
                {buildErrors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-red-700 font-semibold mb-2">Build Errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {buildErrors.map((error, index) => (
                        <li key={index} className="text-red-600 text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
