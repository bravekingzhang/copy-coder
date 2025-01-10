import { create } from 'zustand'
import { WebContainer } from '@webcontainer/api'

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
  isWebcontainerReady: boolean
  serverUrl: string | null
  actions: BoltAction[]
  addFile: (path: string, content: string) => void
  executeShellCommand: (command: string) => Promise<void>
  initWebContainer: () => Promise<void>
  parseBoltAction: (action: string) => void
  setServerUrl: (url: string) => void
}

export const useCodeStore = create<CodeState>((set, get) => ({
  files: {},
  webcontainer: null,
  isWebcontainerReady: false,
  serverUrl: null,
  actions: [],

  setServerUrl: (url: string) => {
    set({ serverUrl: url })
  },

  addFile: (path: string, content: string) => {
    set((state) => ({
      files: { ...state.files, [path]: content }
    }))
  },

  executeShellCommand: async (command: string) => {
    const { webcontainer, isWebcontainerReady } = get()
    if (!webcontainer || !isWebcontainerReady) return

    try {
      const shell = await webcontainer.spawn('sh', ['-c', command])
      await shell.exit
    } catch (error) {
      console.error('Failed to execute command:', error)
    }
  },

  initWebContainer: async () => {
    if (!get().webcontainer) {
      const container = await WebContainer.boot()

      // 监听服务启动事件
      container.on('server-ready', (port, url) => {
        get().setServerUrl(url)
      })

      set({ webcontainer: container, isWebcontainerReady: true })
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
      const contentMatch = actionText.match(/>[\s\S]*<\/boltAction>/)
      if (!contentMatch) return

      const content = contentMatch[0].slice(1, -12).trim()

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
      // 提取命令内容
      const contentMatch = actionText.match(/>[\s\S]*<\/boltAction>/)
      if (!contentMatch) return

      const command = contentMatch[0].slice(1, -12).trim()

      // 执行命令
      state.executeShellCommand(command)

      set((state) => ({
        actions: [...state.actions, { type: 'shell', command }]
      }))
    }
  }
}))