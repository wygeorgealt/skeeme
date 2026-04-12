import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  content: string;
  color?: string;
  fontSize?: number;
  containerStyle?: any;
}

/**
 * Safety net: wraps bare LaTeX commands (e.g. \frac{a}{b}) in $...$ delimiters
 * if they aren't already inside math delimiters.
 * Runs on the TypeScript side to avoid template literal escaping issues.
 */
function wrapBareLaTeX(text: string): string {
  const latexCmds = [
    'frac', 'text', 'sqrt', 'sum', 'prod', 'int', 'lim', 'log', 'ln',
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'times', 'cdot', 'div',
    'pm', 'mp', 'leq', 'geq', 'neq', 'approx', 'equiv', 'infty',
    'partial', 'nabla', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    'theta', 'lambda', 'mu', 'sigma', 'omega', 'pi', 'phi', 'psi',
    'Delta', 'Gamma', 'Omega', 'Sigma', 'mathrm', 'mathbf',
    'operatorname', 'left', 'right', 'displaystyle', 'overline',
    'underline', 'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde',
    'binom', 'choose', 'mod', 'pmod'
  ];

  const cmdPattern = new RegExp(
    '^\\\\(' + latexCmds.join('|') + ')(?=[^a-zA-Z]|$)'
  );

  let result = '';
  let inDollar = false;
  let inDoubleDollar = false;
  let i = 0;

  while (i < text.length) {
    // Track $$ (double dollar) delimiters
    if (text[i] === '$' && i + 1 < text.length && text[i + 1] === '$') {
      inDoubleDollar = !inDoubleDollar;
      result += '$$';
      i += 2;
      continue;
    }

    // Track $ (single dollar) delimiters
    if (text[i] === '$' && !inDoubleDollar) {
      inDollar = !inDollar;
      result += '$';
      i++;
      continue;
    }

    // If we're inside delimiters, pass through unchanged
    if (inDollar || inDoubleDollar) {
      result += text[i];
      i++;
      continue;
    }

    // Check if this backslash starts a bare LaTeX command
    if (text[i] === '\\') {
      const remaining = text.substring(i);
      const cmdMatch = remaining.match(cmdPattern);

      if (cmdMatch) {
        // Found a bare LaTeX command — extract the full expression including brace groups
        let exprEnd = i + cmdMatch[0].length;

        // Consume all consecutive {...} groups
        while (exprEnd < text.length && text[exprEnd] === '{') {
          let depth = 0;
          for (let j = exprEnd; j < text.length; j++) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') {
              depth--;
              if (depth === 0) { exprEnd = j + 1; break; }
            }
          }
          if (exprEnd === i + cmdMatch[0].length) break; // didn't advance, bail
        }

        // Also consume trailing subscripts/superscripts (e.g. _3 or ^{2})
        while (exprEnd < text.length && (text[exprEnd] === '_' || text[exprEnd] === '^')) {
          exprEnd++;
          if (exprEnd < text.length && text[exprEnd] === '{') {
            let depth2 = 0;
            for (let k = exprEnd; k < text.length; k++) {
              if (text[k] === '{') depth2++;
              else if (text[k] === '}') {
                depth2--;
                if (depth2 === 0) { exprEnd = k + 1; break; }
              }
            }
          } else if (exprEnd < text.length && text[exprEnd] !== ' ') {
            exprEnd++; // single char subscript/superscript like _3
          }
        }

        result += '$' + text.substring(i, exprEnd) + '$';
        i = exprEnd;
        continue;
      }
    }

    result += text[i];
    i++;
  }

  return result;
}

export function MathText({
  content,
  color = '#121212',
  fontSize = 16,
  containerStyle
}: MathTextProps) {
  // Start with a small default height so it doesn't jump too wildly, but calculates instantly.
  const [height, setHeight] = React.useState(24);

  // Pre-process content: wrap any bare LaTeX commands in $ delimiters (safety net)
  const processedContent = React.useMemo(() => wrapBareLaTeX(content), [content]);

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
            overflow: hidden;
            line-height: 1.75;
          }
          #math-container {
            padding: 2px 0;
          }
          /* Paragraphs — clean spacing between logical blocks */
          .para {
            margin: 0 0 0.85em 0;
          }
          .para:last-child {
            margin-bottom: 0;
          }
          /* Bullet point items */
          .bullet-item {
            display: flex;
            align-items: flex-start;
            margin: 0.25em 0;
            padding-left: 4px;
          }
          .bullet-dot {
            flex-shrink: 0;
            width: 18px;
            font-weight: 700;
            color: ${color};
            opacity: 0.5;
          }
          .bullet-content {
            flex: 1;
          }
          .katex { font-size: 1.1em; }
          /* Left align block equations like Gauth */
          .katex-display { 
            text-align: left !important; 
            margin: 0.6em 0; 
          }
          .katex-display > .katex {
            text-align: left !important;
            display: inline-block;
          }
          strong, b {
            font-weight: 700;
            color: ${color === '#121212' || color === '#0f172a' || color === '#334155' ? '#000000' : '#FFFFFF'};
          }
        </style>
      </head>
      <body>
        <div id="math-container"></div>
        <script>
          const rawContent = decodeURIComponent("${encodeURIComponent(processedContent)}");
          
          // — Rich markdown-to-HTML formatter (Gauth-style document layout) —
          function formatContent(text) {
            // Split into paragraphs on double newlines (real newline chars after decode)
            const paragraphs = text.split(/\n\n+/);
            let html = '';
            
            for (const para of paragraphs) {
              const lines = para.split(/\n/);
              const bulletLines = [];
              const textLines = [];
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (/^[•\-\*]\s/.test(trimmed)) {
                  // Flush accumulated text lines as a paragraph first
                  if (textLines.length > 0) {
                    html += '<div class="para">' + formatInline(textLines.join(' ')) + '</div>';
                    textLines.length = 0;
                  }
                  bulletLines.push(trimmed.replace(/^[•\-\*]\s*/, ''));
                } else if (trimmed.length > 0) {
                  // Flush accumulated bullets first
                  if (bulletLines.length > 0) {
                    html += renderBullets(bulletLines);
                    bulletLines.length = 0;
                  }
                  textLines.push(trimmed);
                }
              }
              
              // Flush remaining
              if (bulletLines.length > 0) {
                html += renderBullets(bulletLines);
              }
              if (textLines.length > 0) {
                html += '<div class="para">' + formatInline(textLines.join(' ')) + '</div>';
              }
            }
            
            return html;
          }
          
          function renderBullets(items) {
            let out = '';
            for (const item of items) {
              out += '<div class="bullet-item"><span class="bullet-dot">•</span><span class="bullet-content">' + formatInline(item) + '</span></div>';
            }
            return out;
          }
          
          function formatInline(text) {
            // Bold: **text** → <strong>text</strong>
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          }
          
          document.getElementById('math-container').innerHTML = formatContent(rawContent);

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

          sendHeight();

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
                setTimeout(sendHeight, 50);
            }
          });

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
