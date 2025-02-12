import { create } from 'zustand'
import { WebContainer,WebContainerProcess } from '@webcontainer/api'
import { Terminal } from 'xterm'

interface FileContent {
  type: 'file'
  filePath: string
  content: string
}

interface ShellCommand {
  type: 'shell'
  command: string
}

type BoltAction = FileContent | ShellCommand

interface CodeState {
  files: Record<string, string>
  webcontainer: WebContainer | null
  shellProcess: WebContainerProcess | null
  isWebcontainerReady: boolean
  serverUrl: string | null
  actions: BoltAction[]
  buildErrors: string[]
  addFile: (path: string, content: string) => void
  executeShellCommand: (command: string) => Promise<void>
  initWebContainer: () => Promise<void>
  parseBoltAction: (action: string) => void
  setServerUrl: (url: string) => void
  terminal: Terminal | null
  setTerminal: (terminal: Terminal) => void
  clearState: () => Promise<void>
  addBuildError: (error: string) => void
  clearBuildErrors: () => void
}

export const useCodeStore = create<CodeState>((set, get) => ({
  files: {},
  webcontainer: null,
  shellProcess: null,
  isWebcontainerReady: false,
  serverUrl: null,
  actions: [],
  terminal: null,
  buildErrors: [],

  addBuildError: (error: string) => {
    set((state) => ({
      buildErrors: [...state.buildErrors, error]
    }))
  },

  clearBuildErrors: () => {
    set({ buildErrors: [] })
  },

  setServerUrl: (url: string) => {
    set({ serverUrl: url })
  },

  addFile: (path: string, content: string) => {
    set((state) => ({
      files: { ...state.files, [path]: content }
    }))
  },

  executeShellCommand: async (command: string) => {
    const { webcontainer, isWebcontainerReady, terminal } = get()
    if (!webcontainer || !isWebcontainerReady) return

    try {
      const shell = await webcontainer.spawn('sh', ['-c', command], {
        terminal: {
          cols: terminal?.cols || 80,
          rows: terminal?.rows || 50,
        },
      })

      // 将输出重定向到终端
      if (terminal) {
        const writableStream = new WritableStream({
          write(data) {
            terminal.write(data)
            // 检查错误信息
            const errorPattern = /(?:Failed to resolve import|Error:|error:|Cannot find module|Module not found|Syntax error|TypeError|ReferenceError)/i
            if (errorPattern.test(data)) {
              get().addBuildError(data)
            }
          },
        })
        shell.output.pipeTo(writableStream)
      }

      // 对于特定的长期运行命令，不等待退出
      if (command.includes('npm run dev') || command.includes('npm start')) {
        // 保持进程运行
        set({ shellProcess: shell })
        return
      }

      set({ shellProcess: null })
      // 其他命令等待完成
      await shell.exit
    } catch (error) {
      console.error('Failed to execute command:', error)
      terminal?.write('\r\nFailed to execute command: ' + error + '\r\n')
    }
  },

  initWebContainer: async () => {
    const state = get();

    // 如果已经有一个运行中的 WebContainer，先清理它
    if (state.webcontainer) {
      // 清理所有运行中的进程
      if (state.shellProcess) {
        await state.shellProcess.kill();
      }

      // 清理所有文件
      const files = Object.keys(state.files);
      if (files.length > 0) {
        for (const filePath of files) {
          try {
            await state.webcontainer.fs.rm(filePath, { force: true, recursive: true });
          } catch (error) {
            console.error(`Failed to remove file ${filePath}:`, error);
          }
        }
      }

      // 重置状态
      set({
        webcontainer: null,
        shellProcess: null,
        isWebcontainerReady: false,
        serverUrl: null,
        files: {},
        actions: [],
        buildErrors: []
      });
    }

    try {
      // 启动新的 WebContainer 实例
      const container = await WebContainer.boot({ workdirName: 'projects', coep: 'credentialless' });

      // 监听服务启动事件
      container.on('server-ready', (port, url) => {
        get().setServerUrl(url);
      });

      set({ webcontainer: container, isWebcontainerReady: true });
    } catch (error) {
      console.error('Failed to boot WebContainer:', error);
      set({
        webcontainer: null,
        isWebcontainerReady: false,
        serverUrl: null
      });
      throw error; // 重新抛出错误以便上层处理
    }
  },

  parseBoltAction: (actionText: string) => {
    // 解析 type
    const typeMatch = actionText.match(/type="([^"]*)"/)
    if (!typeMatch) return

    const type = typeMatch[1]
    const state = get()

    if (type === 'file') {
      // 解析 file 类型的 action
      const filePathMatch = actionText.match(/filePath="([^"]*)"/)
      if (!filePathMatch) return

      const filePath = filePathMatch[1]
      // 提取文件内容
      const contentMatch = actionText.match(/>([^]*?)<\/boltAction>/)
      if (!contentMatch) return

      const content = contentMatch[1].trim()

      // 更新 store 并写入 WebContainer
      state.addFile(filePath, content)
      if (state.webcontainer && state.isWebcontainerReady) {
        // 确保目录存在
        const dirPath = filePath.split('/').slice(0, -1).join('/')
        if (dirPath) {
          state.webcontainer.fs.mkdir(dirPath, { recursive: true })
        }
        state.webcontainer.fs.writeFile(filePath, content)
      }

      set((state) => ({
        actions: [...state.actions, { type: 'file', filePath, content }]
      }))
    } else if (type === 'shell') {
      // 提取命令内容，使用更精确的正则表达式
      const contentMatch = actionText.match(/>([^<]*)<\/boltAction>/)
      if (!contentMatch) return

      const command = contentMatch[1].trim()

      // 执行命令
      state.executeShellCommand(command)

      set((state) => ({
        actions: [...state.actions, { type: 'shell', command }]
      }))
    }
  },

  setTerminal: (terminal: Terminal) => {
    set({ terminal: terminal });
  },

  clearState: async () => {
    const { webcontainer, files, terminal, shellProcess } = get();

    // 清理终端
    if (terminal) {
      terminal.clear();
      terminal.write('\x1bc'); // 发送清屏命令
    }

    // 清理 shell 进程
    if (shellProcess) {
      await shellProcess.kill();
    }

    // 清理 store 状态
    set({
      files: {},
      actions: [],
      serverUrl: null,
      shellProcess: null,
      buildErrors: []
    });

    // 清理文件
    if (webcontainer && Object.keys(files).length > 0) {
      for (const filePath of Object.keys(files)) {
        try {
          await webcontainer.fs.rm(filePath, { force: true, recursive: true });
        } catch (error) {
          console.error(`Failed to remove file ${filePath}:`, error);
        }
      }
    }
  },
}))