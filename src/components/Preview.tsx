import { memo, useState, useRef, useEffect } from 'react';
import { RefreshCw, Smartphone, Monitor, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ImperativePanelHandle,
} from "react-resizable-panels";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { type RefObject } from 'react';

interface PreviewProps {
  serverUrl: string | null;
}

const Preview = memo(({ serverUrl }: PreviewProps) => {
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sideSize, setSideSize] = useState(0);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const isLeftResizing = useRef(false);
  const isRightResizing = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const toggleDevice = () => {
    setIsMobile(prev => !prev);
    const newSize = !isMobile ? 30 : 0;
    setSideSize(newSize);
    requestAnimationFrame(() => {
      leftPanelRef.current?.resize(newSize);
      rightPanelRef.current?.resize(newSize);
    });
  };

  const syncPanelSize = (size: number, targetRef: RefObject<ImperativePanelHandle>) => {
      targetRef.current?.resize(size);
  };

  const handleLeftPanelResize = (size: number) => {
    // if (isRightResizing.current) return;

    // try {
    //   isLeftResizing.current = true;
    //   // setSideSize(size);
    //   syncPanelSize(size, rightPanelRef);
    // } finally {
    //   isLeftResizing.current = false;
    // }
    setSideSize(size);
  };

  const handleRightPanelResize = (size: number) => {
    if (isLeftResizing.current) return;

    try {
      isRightResizing.current = true;
      setSideSize(size);
      syncPanelSize(size, leftPanelRef);
    } finally {
      isRightResizing.current = false;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      previewContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="h-full flex flex-col" ref={previewContainerRef}>
      {/* 工具栏 */}
      <div className="p-2 border-b flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <div className="border-l mx-2 h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDevice}
        >
          {isMobile ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </Button>
        <div className="border-l mx-2 h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* 左侧空白区域 */}
          <ResizablePanel
            ref={leftPanelRef}
            defaultSize={sideSize}
            minSize={0}
            maxSize={40}
            onResize={handleLeftPanelResize}
          >
            <div className="h-full bg-gray-100" />
          </ResizablePanel>

          {/* 左侧拖动手柄 */}
          <ResizableHandle />

          {/* 预览内容 */}
          <ResizablePanel>
            <div className="h-full bg-white">
              {serverUrl ? (
                <iframe
                  key={key}
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
          </ResizablePanel>

          {/* 右侧拖动手柄 */}
          <ResizableHandle withHandle />

          {/* 右侧空白区域 */}
          <ResizablePanel
            ref={rightPanelRef}
            defaultSize={sideSize}
            minSize={0}
            maxSize={40}
            onResize={handleRightPanelResize}
          >
            <div className="h-full bg-gray-100" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;