'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Terminal } from 'xterm'
import { useCodeStore } from '@/store/code'
import { Folder, File, Terminal as TerminalIcon, Globe } from 'lucide-react'
import type { TerminalWrapperProps } from './TerminalWrapper'

interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  children?: FileTreeNode[]
}

const TerminalWrapper = dynamic<TerminalWrapperProps>(() => import('./TerminalWrapper'), { ssr: false })

const Workbench = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([])
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { webcontainer, files, isWebcontainerReady } = useCodeStore()

  const handleTerminal = (term: Terminal) => {
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

    // 检查是否有 HTTP 服务启动
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3000')
        if (response.ok) {
          setPreviewUrl('http://localhost:3000')
        }
      } catch {
        // 服务未启动，忽略错误
      }
    }
    checkServer()
  }

  // 监听窗口大小变化，调整终端大小
  useEffect(() => {
    const handleResize = async () => {
      if (terminal) {
        const { FitAddon } = await import('@xterm/addon-fit')
        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)
        fitAddon.fit()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [terminal])

  // 构建文件树
  useEffect(() => {
    const buildFileTree = (paths: string[]): FileTreeNode[] => {
      const root: Record<string, FileTreeNode> = {}

      paths.forEach(path => {
        const parts = path.split('/')
        let current = root

        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = {
              name: part,
              type: index === parts.length - 1 ? 'file' : 'directory',
              children: index === parts.length - 1 ? undefined : []
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

  // 渲染文件树
  const renderFileTree = (nodes: FileTreeNode[], basePath = '') => {
    return (
      <ul className="pl-4">
        {nodes.map((node) => {
          const path = `${basePath}${node.name}`
          return (
            <li key={path} className="py-1">
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded ${
                  selectedFile === path ? 'bg-blue-100' : ''
                }`}
                onClick={() => {
                  if (node.type === 'file') {
                    setSelectedFile(path)
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
              {node.children && renderFileTree(node.children, `${path}/`)}
            </li>
          )
        })}
      </ul>
    )
  }

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
        {/* 预览窗口 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            {previewUrl && (
              <span className="text-sm text-gray-500">{previewUrl}</span>
            )}
          </div>
          <div className="h-full">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Preview will appear here when the server starts
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