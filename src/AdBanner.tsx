import React from 'react';

interface AdBannerProps {
  className?: string;
}

const AD_KEY = '7eef90e298e1f4fc27c64e13ea2d78a5';
const AD_WIDTH = 300;
const AD_HEIGHT = 250;

const adHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head>
<body>
<script>
  atOptions = {
    'key' : '${AD_KEY}',
    'format' : 'iframe',
    'height' : ${AD_HEIGHT},
    'width' : ${AD_WIDTH},
    'params' : {}
  };
</script>
<script src="https://bicea.org/22/${AD_KEY}"></script>
</body>
</html>`;

const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center my-6 ${className}`}>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Advertisement</p>
        <iframe
          title="Advertisement"
          srcDoc={adHtml}
          width={AD_WIDTH}
          height={AD_HEIGHT}
          scrolling="no"
          style={{ border: 0, maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};

export default AdBanner;
