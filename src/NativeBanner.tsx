import React, { useEffect, useRef, useState } from 'react';

const NATIVE_ID = 'c9a43c4c488f5bd7daaf55a2dd560595';

const nativeHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;font-family:sans-serif}</style></head>
<body>
<script async="async" data-cfasync="false" src="https://bicea.org/21/${NATIVE_ID}"></script>
<div id="container-${NATIVE_ID}"></div>
</body>
</html>`;

interface NativeBannerProps {
  className?: string;
}

const NativeBanner: React.FC<NativeBannerProps> = ({ className = '' }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(260);

  // Grow the frame to fit the ad once it has loaded
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        const doc = frameRef.current?.contentDocument;
        const h = doc?.body?.scrollHeight;
        if (h && h > 40) setHeight(Math.min(h + 8, 700));
      } catch {
        /* ignore */
      }
    }, 800);
    const stop = window.setTimeout(() => window.clearInterval(timer), 15000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 my-8 ${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 text-center">Sponsored</p>
      <iframe
        ref={frameRef}
        title="Sponsored"
        srcDoc={nativeHtml}
        width="100%"
        height={height}
        scrolling="no"
        style={{ border: 0, width: '100%' }}
      />
    </div>
  );
};

export default NativeBanner;
