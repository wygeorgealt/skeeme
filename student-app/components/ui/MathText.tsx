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
  const [height, setHeight] = React.useState(40);


  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, system-ui;
            color: ${color};
            font-size: ${fontSize}px;
            background-color: transparent;
            word-wrap: break-word;
            overflow: hidden;
          }
          #math-container {
            padding: 4px 0;
            line-height: 1.5;
          }
          .katex { font-size: 1.1em; }
          .katex-display { margin: 0.5em 0; }
        </style>
      </head>
      <body>
        <div id="math-container">${content}</div>
        <script>
          function sendHeight() {
            var height = document.getElementById('math-container').offsetHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
          }

          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.getElementById('math-container'), {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
              ],
              throwOnError : false
            });
            setTimeout(sendHeight, 100);
          });

          // Use ResizeObserver for dynamic updates
          new ResizeObserver(sendHeight).observe(document.body);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[{ height: height, width: '100%' }, containerStyle]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height) {
              setHeight(data.height + 18); // Increased buffer for safety
            }
          } catch { }
        }}
      />
    </View>
  );
}
