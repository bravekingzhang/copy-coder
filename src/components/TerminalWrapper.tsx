'use client'

import { useEffect, useRef } from 'react'
import type { Terminal } from 'xterm'
import type { FitAddon } from '@xterm/addon-fit'

export interface TerminalWrapperProps {
  onTerminal: (terminal: Terminal) => void
}

const TerminalWrapper = ({ onTerminal}: TerminalWrapperProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    let isMounted = true

    const initTerminal = async () => {
      if (!terminalRef.current || terminalInstance.current) return

      const { Terminal } = await import('xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { WebLinksAddon } = await import('@xterm/addon-web-links')
      await import('xterm/css/xterm.css')

      if (!isMounted) return

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
        }
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)

      terminalInstance.current = term
      fitAddonRef.current = fitAddon

      term.open(terminalRef.current)

      // 使用 requestAnimationFrame 确保 DOM 已更新
      requestAnimationFrame(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
        }
        onTerminal(term)
      })
    }

    initTerminal()

    return () => {
      isMounted = false
      if (terminalInstance.current) {
        terminalInstance.current.dispose()
        terminalInstance.current = null
      }
    }
  }, [onTerminal])

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div ref={terminalRef} className="h-full bg-[#1e1e1e]" />
}

export default TerminalWrapper