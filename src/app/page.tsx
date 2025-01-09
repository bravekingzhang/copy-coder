'use client'

import { Upload, Copy, Check } from 'lucide-react'
import Image from 'next/image'
import { useState, useCallback, useEffect, useRef } from 'react'
import { generatePromptAction } from './actions'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [applicationType, setApplicationType] = useState('web')
  const [temperature, setTemperature] = useState(0.2)
  const promptContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when content updates
  useEffect(() => {
    if (promptContainerRef.current) {
      promptContainerRef.current.scrollTop = promptContainerRef.current.scrollHeight
    }
  }, [generatedPrompt])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleGeneratePrompt = useCallback(async () => {
    if (!selectedImage) return

    try {
      setIsGenerating(true)
      setError(null)
      const stream = await generatePromptAction(selectedImage, applicationType, temperature)

      setGeneratedPrompt('')

      if (stream) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          setGeneratedPrompt(prev => prev + content)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedImage, applicationType, temperature])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const removeImage = useCallback(() => {
    setSelectedImage(null)
    setGeneratedPrompt(null)
    setError(null)
  }, [])

  const handleCopyPrompt = useCallback(async () => {
    if (!generatedPrompt) return

    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [generatedPrompt])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-6">
          Create powerful prompts for Cursor, Bolt, v0 & more..
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Built for the next generation of AI coders. Upload images of full applications, UI mockups, or custom designs and use our generated prompts to build your apps faster.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <div className="text-center">
              {!selectedImage ? (
                <div
                  className={`relative border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors`}
                  onClick={() => document.getElementById('file-upload')?.click()}
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
                    <Button
                      variant="outline"
                      className="mt-4"
                    >
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-5 h-5">
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

          {/* Tools Section */}
          <div className="mt-8 bg-white p-8 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-4">Quick Access Tools:</h3>
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="mr-2">⚡</span>
                <div>
                  <div className="font-medium">Bolt</div>
                  <div className="text-sm text-gray-300">Build full-stack web apps</div>
                </div>
              </a>
              <a
                href="https://v0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <span className="mr-2">🚀</span>
                <div>
                  <div className="font-medium">v0.dev</div>
                  <div className="text-sm text-violet-200">Design and build UI visually</div>
                </div>
              </a>
              <a
                href="https://cursor.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">💻</span>
                <div>
                  <div className="font-medium">Cursor</div>
                  <div className="text-sm text-blue-200">AI-powered code editor</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white p-8 rounded-xl border border-gray-200">
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Choose analysis focus:</h3>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
            >
              <option value="web">Web applications</option>
              <option value="mobile">Mobile applications</option>
              <option value="desktop">Desktop applications</option>
            </select>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Temperature:</h3>
              <span className="text-sm text-gray-500">{temperature}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Precise</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-blue-700"
              />
              <span className="text-sm text-gray-500">Creative</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Adjust temperature to control the creativity level of the generated prompts. Lower values produce more focused results, while higher values increase creativity and variability.
            </p>
          </div>

          <Button
            className="w-full mt-8"
            onClick={handleGeneratePrompt}
            disabled={!selectedImage || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate prompt'}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          {generatedPrompt && (
            <div className="mt-8 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h4 className="font-semibold">Generated Prompt:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div ref={promptContainerRef} className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="text-gray-600"
                >
                  {generatedPrompt}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
