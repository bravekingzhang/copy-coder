'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import 'xterm/css/xterm.css'

export interface TerminalWrapperProps {
  onTerminal: (terminal: Terminal) => void
}

const TerminalWrapper = ({ onTerminal }: TerminalWrapperProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!terminalRef.current) return

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

    term.open(terminalRef.current)
    fitAddon.fit()

    onTerminal(term)

    return () => {
      term.dispose()
    }
  }, [onTerminal])

  return <div ref={terminalRef} className="h-full bg-[#1e1e1e]" />
}

export default TerminalWrapper