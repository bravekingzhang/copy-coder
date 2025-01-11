import { memo } from 'react';

interface PreviewProps {
  serverUrl: string | null;
}

const Preview = memo(({ serverUrl }: PreviewProps) => {
  return (
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
  );
});

Preview.displayName = 'Preview';

export default Preview;