import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  content: string;
  color?: string;
  fontSize?: number;
  containerStyle?: any;
}

export function MathText({
  content,
  color = '#121212',
  fontSize = 16,
  containerStyle
}: MathTextProps) {
  // Start with a small default height so it doesn't jump too wildly, but calculates instantly.
  const [height, setHeight] = React.useState(24);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: ${color};
            font-size: ${fontSize}px;
            word-wrap: break-word;
            overflow: hidden; /* Hide scrollbars */
            line-height: 1.6;
          }
          #math-container {
            padding: 2px 0;
            display: inline-block;
            min-width: 100%;
            white-space: pre-wrap; /* Crucial for AI paragraph layout and newlines */
          }
          .katex { font-size: 1.1em; }
          /* Left align block equations like Gauth/Photomath */
          .katex-display { 
              text-align: left !important; 
              margin: 0.7em 0; 
          }
          .katex-display > .katex {
              text-align: left !important;
              display: inline-block;
          }
          strong {
              font-weight: 700;
              color: ${color === '#121212' || color === '#0f172a' ? '#000000' : '#FFFFFF'}; /* Enhance contrast for bold text */
          }
        </style>
      </head>
      <body>
        <div id="math-container"></div>
        <script>
          // Safe injection preserving all newlines and quotes
          const rawContent = decodeURIComponent("${encodeURIComponent(content)}");
          // Simple markdown bold to strong tag
          let formattedContent = rawContent.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
          document.getElementById('math-container').innerHTML = formattedContent;

          let lastHeight = 0;
          function sendHeight() {
            const container = document.getElementById('math-container');
            if (!container) return;
            const newHeight = container.offsetHeight;
            if (Math.abs(newHeight - lastHeight) > 1 && newHeight > 0) {
              lastHeight = newHeight;
              window.ReactNativeWebView.postMessage(JSON.stringify({ height: newHeight }));
            }
          }

          // 1. Send initial raw text height immediately for fast perceived rendering
          sendHeight();

          // 2. Render math once KaTeX loads
          document.addEventListener("DOMContentLoaded", function() {
            if (window.renderMathInElement) {
                renderMathInElement(document.getElementById('math-container'), {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '\\\\[', right: '\\\\]', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\\\(', right: '\\\\)', display: false}
                ],
                throwOnError: false
                });
                setTimeout(sendHeight, 50); // Send height again after math renders
            }
          });

          // 3. Immediately catch any layout shifts
          const observer = new MutationObserver(sendHeight);
          observer.observe(document.getElementById('math-container'), { childList: true, subtree: true, characterData: true });
          
          window.addEventListener('load', sendHeight);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[{ height: Math.max(height, 24), width: '100%' }, containerStyle]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent', opacity: height > 24 ? 1 : 0.99 }} // Force hardware acceleration
        scrollEnabled={false}
        javaScriptEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height) {
              setHeight(Math.ceil(data.height) + 12); // Tighter buffer for a cleaner look
            }
          } catch { }
        }}
      />
    </View>
  );
}
