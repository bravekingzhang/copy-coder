'use client'

import { Upload, ChevronRight, X, Copy, Check } from 'lucide-react'
import Image from 'next/image'
import { useState, useCallback } from 'react'
import { generatePromptAction } from './actions'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [applicationType, setApplicationType] = useState('web')
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
      const result = await generatePromptAction(selectedImage, applicationType)

      if (result.success && result.prompt) {
        setGeneratedPrompt(result.prompt)
      } else {
        setError(result.error || 'Failed to generate prompt')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedImage, applicationType])

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
                  <button className="mt-4 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Choose image
                  </button>
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
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
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

        {/* Info Section */}
        <div className="bg-white p-8 rounded-xl border border-gray-200">

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Choose analysis focus:</h3>
            <select className="w-full p-2 border border-gray-300 rounded-lg" value={applicationType} onChange={(e) => setApplicationType(e.target.value)}>
              <option value="web">Web applications</option>
              <option value="mobile">Mobile applications</option>
              <option value="desktop">Desktop applications</option>
            </select>
          </div>

          <button
            className="w-full mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGeneratePrompt}
            disabled={!selectedImage || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate prompt'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          {generatedPrompt && (
            <div className="mt-8 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h4 className="font-semibold">Generated Prompt:</h4>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
