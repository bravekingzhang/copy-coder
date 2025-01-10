'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Terminal } from 'xterm'
import { useCodeStore } from '@/store/code'
import { Folder, File, Terminal as TerminalIcon, Code, Globe } from 'lucide-react'
import type { TerminalWrapperProps } from './TerminalWrapper'

type TabType = 'code' | 'preview'

interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileTreeNode[]
  isExpanded?: boolean
}

const TerminalWrapper = dynamic<TerminalWrapperProps>(() => import('./TerminalWrapper'), { ssr: false })

const Workbench = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('code')
  const { webcontainer, files, isWebcontainerReady, serverUrl } = useCodeStore()

  // 构建文件树
  useEffect(() => {
    const buildFileTree = (paths: string[]): FileTreeNode[] => {
      const root: Record<string, FileTreeNode> = {}

      paths.forEach(path => {
        const parts = path.split('/')
        let current = root
        let currentPath = ''

        parts.forEach((part, index) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part
          if (!current[part]) {
            current[part] = {
              name: part,
              path: currentPath,
              type: index === parts.length - 1 ? 'file' : 'directory',
              children: index === parts.length - 1 ? undefined : [],
              isExpanded: true
            }
          }
          if (current[part].children) {
            current = current[part].children?.reduce((acc, node) => {
              acc[node.name] = node
              return acc
            }, {} as Record<string, FileTreeNode>) || {}
          }
        })
      })

      return Object.values(root)
    }

    setFileTree(buildFileTree(Object.keys(files)))
  }, [files])

  const toggleDirectory = (node: FileTreeNode) => {
    const updateNode = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map(n => {
        if (n.path === node.path) {
          return { ...n, isExpanded: !n.isExpanded }
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) }
        }
        return n
      })
    }
    setFileTree(updateNode(fileTree))
  }

  // 渲染文件树
  const renderFileTree = (nodes: FileTreeNode[]) => {
    return (
      <ul className="pl-4">
        {nodes.map((node) => (
          <li key={node.path} className="py-1">
            <div
              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded ${
                selectedFile === node.path ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                if (node.type === 'directory') {
                  toggleDirectory(node)
                } else {
                  setSelectedFile(node.path)
                }
              }}
            >
              {node.type === 'directory' ? (
                <Folder className="w-4 h-4" />
              ) : (
                <File className="w-4 h-4" />
              )}
              <span>{node.name}</span>
            </div>
            {node.children && node.isExpanded && renderFileTree(node.children)}
          </li>
        ))}
      </ul>
    )
  }

  const handleTerminal = useCallback((term: Terminal) => {
    setTerminal(term)

    // 设置终端输入输出
    let currentLine = ''
    term.onData(async (data: string) => {
      // 处理特殊键
      if (data === '\r') { // Enter
        term.write('\r\n')
        if (currentLine.trim()) {
          try {
            const shell = await webcontainer?.spawn('sh', ['-c', currentLine])
            if (shell) {
              shell.output.pipeTo(new WritableStream({
                write(data) {
                  term.write(data)
                }
              }))
              await shell.exit
            }
          } catch (e) {
            console.error('Failed to execute command:', e)
            term.write('\r\nError executing command\r\n')
          }
        }
        currentLine = ''
        term.write('\r\n$ ')
      } else if (data === '\u007f') { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          term.write('\b \b')
        }
      } else {
        currentLine += data
        term.write(data)
      }
    })

    term.write('$ ')
  }, [webcontainer])

  return (
    <div className="h-[600px] grid grid-cols-12 gap-4 bg-white rounded-xl border border-gray-200 p-4">
      {/* 文件浏览器 */}
      <div className="col-span-3 border-r border-gray-200 overflow-y-auto">
        <div className="font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Files
        </div>
        {renderFileTree(fileTree)}
      </div>

      {/* 主内容区域 */}
      <div className="col-span-9 grid grid-rows-2 gap-4">
        {/* 文件内容/预览 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-2">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 flex items-center gap-2 ${
                  activeTab === 'code'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('code')}
              >
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedFile || 'Editor'}
                </span>
              </button>
              <button
                className={`px-4 py-2 flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </button>
            </div>
          </div>
          <div className="h-full">
            {activeTab === 'code' ? (
              <div className="h-full p-4 font-mono text-sm overflow-auto bg-gray-50">
                {selectedFile && files[selectedFile] ? (
                  <pre>{files[selectedFile]}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Select a file to view its contents
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                {serverUrl ? (
                  <iframe
                    src={serverUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Preview will appear here when the server starts
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 终端 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-2 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Terminal</span>
          </div>
          {isWebcontainerReady && (
            <TerminalWrapper onTerminal={handleTerminal} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Workbench