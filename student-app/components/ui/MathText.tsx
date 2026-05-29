import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MathTextProps {
  content: string;
  color?: string;
  fontSize?: number;
  containerStyle?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// wrapBareLaTeX
// Safety net: wraps bare LaTeX commands (e.g. \frac{a}{b}) in $…$ delimiters
// if they are not already inside math delimiters.
// ─────────────────────────────────────────────────────────────────────────────

const LATEX_CMDS = [
  'frac', 'text', 'sqrt', 'sum', 'prod', 'int', 'lim', 'log', 'ln',
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'times', 'cdot', 'div',
  'pm', 'mp', 'leq', 'geq', 'neq', 'approx', 'equiv', 'infty',
  'partial', 'nabla', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
  'theta', 'lambda', 'mu', 'sigma', 'omega', 'pi', 'phi', 'psi',
  'Delta', 'Gamma', 'Omega', 'Sigma', 'mathrm', 'mathbf',
  'operatorname', 'left', 'right', 'displaystyle', 'overline',
  'underline', 'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde',
  'binom', 'choose', 'mod', 'pmod',
] as const;

const LATEX_CMD_PATTERN = new RegExp(
  '^\\\\(' + LATEX_CMDS.join('|') + ')(?=[^a-zA-Z]|$)'
);

function wrapBareLaTeX(text: string): string {
  // Pre-process plain-text exponents: 2^5 → $2^5$
  let processed = text.replace(
    /(?<!\$)\b([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)\b(?!\$)/g,
    '$$$1^$2$$'
  );

  // Pre-process plain-text fractions (1–2 digits only to avoid dates): 1/2 → $\frac{1}{2}$
  processed = processed.replace(
    /(?<!\$)\b(\d{1,2})\/(\d{1,2})([a-zA-Z]?)\b(?!\$)/g,
    '$$\\frac{$1}{$2}$3$$'
  );

  text = processed;

  let result = '';
  let inDollar = false;
  let inDoubleDollar = false;
  let i = 0;

  while (i < text.length) {
    // Handle $$
    if (text[i] === '$' && i + 1 < text.length && text[i + 1] === '$') {
      inDoubleDollar = !inDoubleDollar;
      result += '$$';
      i += 2;
      continue;
    }

    // Handle single $
    if (text[i] === '$' && !inDoubleDollar) {
      inDollar = !inDollar;
      result += '$';
      i++;
      continue;
    }

    // Inside math — pass through unchanged
    if (inDollar || inDoubleDollar) {
      result += text[i];
      i++;
      continue;
    }

    // Outside math — check for bare LaTeX command
    if (text[i] === '\\') {
      const remaining = text.substring(i);
      const cmdMatch = remaining.match(LATEX_CMD_PATTERN);

      if (cmdMatch) {
        let exprEnd = i + cmdMatch[0].length;

        // Consume all brace groups {…}
        while (exprEnd < text.length && text[exprEnd] === '{') {
          let depth = 0;
          for (let j = exprEnd; j < text.length; j++) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') {
              depth--;
              if (depth === 0) { exprEnd = j + 1; break; }
            }
          }
        }

        // Consume trailing sub/superscripts
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
            exprEnd++;
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

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeMathContent
// Cleans AI/user-generated math text to avoid malformed dollar-delimited
// blocks and stray escaped braces that break KaTeX rendering.
// ─────────────────────────────────────────────────────────────────────────────

function sanitizeMathContent(input: string): string {
  if (!input) return '';

  // Normalize escaped braces \{ \} → { }
  let s = input.replace(/\\\{|\\\}/g, (m) => (m[1] === '{' ? '{' : '}'));

  // Ensure even number of single-dollar delimiters
  const singleDollarCount = (s.match(/(^|[^$])\$(?!\$)/g) || []).length;
  if (singleDollarCount % 2 === 1) {
    const lastIdx = s.lastIndexOf('$');
    if (lastIdx !== -1) {
      s = s.substring(0, lastIdx) + '\\$' + s.substring(lastIdx + 1);
    }
  }

  // Strip stray $ characters inside already-delimited math blocks
  {
    let out = '';
    let i = 0;
    let inSingle = false;
    let inDouble = false;

    while (i < s.length) {
      if (!inSingle && !inDouble && s[i] === '$' && s[i + 1] === '$') {
        inDouble = true; out += '$$'; i += 2; continue;
      }
      if (inDouble && s[i] === '$' && s[i + 1] === '$') {
        inDouble = false; out += '$$'; i += 2; continue;
      }
      if (!inSingle && !inDouble && s[i] === '$') {
        inSingle = true; out += '$'; i++; continue;
      }
      if (inSingle && s[i] === '$') {
        inSingle = false; out += '$'; i++; continue;
      }
      // Drop raw $ inside math blocks
      if ((inSingle || inDouble) && s[i] === '$') {
        i++; continue;
      }
      out += s[i];
      i++;
    }

    s = out;
  }

  // Strip dollar signs from inside LaTeX command groups: \cmd{$x$} → \cmd{x}
  try {
    s = s.replace(/\\([a-zA-Z]+)\{([^}]*)\}/g, (_m, cmd, inner) => {
      return `\\${cmd}{${inner.replace(/\$/g, '')}}`;
    });
  } catch { /* ignore */ }

  // Convert unbraced integral/sum limits: \int_0^1 → \int_{0}^{1}
  try {
    s = s.replace(
      /\\(int|sum|prod|lim)\s*_\s*([^\s\\{}()[\]_]+)/g,
      (_m, cmd, sub) => `\\${cmd}_{${sub}}`
    );
    s = s.replace(
      /\\(int|sum|prod|lim)\s*\^\s*([^\s\\{}()[\]_]+)/g,
      (_m, cmd, sup) => `\\${cmd}^{${sup}}`
    );
  } catch { /* ignore */ }

  // Brace bare superscripts/subscripts outside commands: x^2 → x^{2}
  try {
    s = s.replace(/(^|[^\\\w])([A-Za-z0-9)\]}])\^([A-Za-z0-9])/g, '$1$2^{$3}');
    s = s.replace(/(^|[^\\\w])([A-Za-z0-9)\]}])_([A-Za-z0-9])/g, '$1$2_{$3}');
  } catch { /* ignore */ }

  // Balance unmatched \left … \right pairs
  try {
    const leftCount = (s.match(/\\left/g) || []).length;
    const rightCount = (s.match(/\\right/g) || []).length;
    if (leftCount > rightCount) {
      s += ' \\right.'.repeat(leftCount - rightCount);
    }
  } catch { /* ignore */ }

  // Balance unmatched braces
  try {
    const open = (s.match(/\{/g) || []).length;
    const close = (s.match(/\}/g) || []).length;
    if (open > close) s += '}'.repeat(open - close);
  } catch { /* ignore */ }

  // Escape bare percent signs outside math (% starts a comment in LaTeX)
  try {
    let out = '';
    let i = 0;
    let inSingle = false;
    let inDouble = false;

    while (i < s.length) {
      if (!inSingle && !inDouble && s[i] === '$' && s[i + 1] === '$') {
        inDouble = true; out += '$$'; i += 2; continue;
      }
      if (inDouble && s[i] === '$' && s[i + 1] === '$') {
        inDouble = false; out += '$$'; i += 2; continue;
      }
      if (!inSingle && !inDouble && s[i] === '$') {
        inSingle = true; out += '$'; i++; continue;
      }
      if (inSingle && s[i] === '$') {
        inSingle = false; out += '$'; i++; continue;
      }
      if (!inSingle && !inDouble && s[i] === '%') {
        out += '\\%'; i++; continue;
      }
      out += s[i];
      i++;
    }

    s = out;
  } catch { /* ignore */ }

  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildScript
// Returns the browser-side JS as a plain string to avoid template-literal
// escaping issues with nested backticks and regex.
// ─────────────────────────────────────────────────────────────────────────────

function buildScript(encodedContent: string): string {
  return [
    'var rawContent = decodeURIComponent("' + encodedContent + '");',
    '',
    'function formatContent(text) {',
    '  if (!text) return "";',
    '  var clean = text.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");',
    '  clean = clean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");',
    '  // Force line break between a label and a display math block on the same line',
    '  clean = clean.replace(/^(.+?):\\s*(\\$\\$.+?\\$\\$)/gm, "$1:\\n$2");',
    '  var blocks = clean.split(/\\n\\n+/);',
    '  var out = "";',
    '  for (var b = 0; b < blocks.length; b++) {',
    '    var block = blocks[b].trim();',
    '    if (!block) continue;',
    '    var lines = block.split(/\\n/);',
    '    for (var i = 0; i < lines.length; i++) {',
    '      var line = lines[i].trim();',
    '      if (!line) continue;',
    '      var hMatch = line.match(/^(#{1,6})\\s+(.*)/);',
    '      if (hMatch) {',
    '        var level = hMatch[1].length;',
    '        var hSize = level === 1 ? "1.4em" : level === 2 ? "1.3em" : "1.2em";',
    '        out += "<div style=\\"font-weight:800;font-size:" + hSize + ";margin:0.8em 0 0.4em 0;\\">"',
    '             + formatInline(hMatch[2]) + "</div>";',
    '        continue;',
    '      }',
    '      var numMatch    = line.match(/^(\\d+)[.):]\\s+(.*)/);',
    '      var letterMatch = line.match(/^([a-zA-Z])[.):]\\s+(.*)/);',
    '      var bulletMatch = line.match(/^[\\-\\*\\u2022]\\s+(.*)/);',
    '      if (numMatch) {',
    '        out += \'<div class="list-item"><div class="list-index">\' + numMatch[1]',
    '             + \'</div><div class="list-content">\' + formatInline(numMatch[2]) + \'</div></div>\';',
    '      } else if (letterMatch && line.length < 200) {',
    '        out += \'<div class="list-item"><div class="list-index">\' + letterMatch[1]',
    '             + \'</div><div class="list-content">\' + formatInline(letterMatch[2]) + \'</div></div>\';',
    '      } else if (bulletMatch) {',
    '        out += \'<div class="list-item"><div class="bullet-dot">\\u2022</div><div class="list-content">\' + formatInline(bulletMatch[1]) + \'</div></div>\';',
    '      } else if (line.startsWith("$$") && line.endsWith("$$")) {',
    '        out += \'<div style="margin:0.8em 0;">\' + line + \'</div>\';',
    '      } else {',
    '        out += \'<div class="para">\' + formatInline(line) + \'</div>\';',
    '      }',
    '    }',
    '  }',
    '  return out;',
    '}',
    '',
    'function formatInline(t) {',
    '  if (!t) return "";',
    '  t = t.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");',
    '  t = t.replace(/\\*([^*]+?)\\*/g, "<em>$1</em>");',
    '  return t;',
    '}',
    '',
    'document.getElementById("math-container").innerHTML = formatContent(rawContent);',
    '',
    'var lastH = 0;',
    'function sendHeight() {',
    '  var c = document.getElementById("math-container");',
    '  if (!c) return;',
    '  var h = c.offsetHeight;',
    '  if (Math.abs(h - lastH) > 1 && h > 0) {',
    '    lastH = h;',
    '    window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));',
    '  }',
    '}',
    '',
    'sendHeight();',
    '',
    'document.addEventListener("DOMContentLoaded", function () {',
    '  if (window.renderMathInElement) {',
    '    renderMathInElement(document.getElementById("math-container"), {',
    '      delimiters: [',
    '        { left: "$$", right: "$$", display: true },',
    '        { left: "\\\\[", right: "\\\\]", display: true },',
    '        { left: "$", right: "$", display: false },',
    '        { left: "\\\\(", right: "\\\\)", display: false }',
    '      ],',
    '      throwOnError: false',
    '    });',
    '    setTimeout(sendHeight, 150);',
    '    setTimeout(sendHeight, 600);',
    '  }',
    '});',
    '',
    'var obs = new MutationObserver(sendHeight);',
    'obs.observe(document.getElementById("math-container"), {',
    '  childList: true, subtree: true, characterData: true',
    '});',
    'window.addEventListener("load", function () { setTimeout(sendHeight, 300); });',
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// buildHtml
// Assembles the full WebView HTML document.
// ─────────────────────────────────────────────────────────────────────────────

function buildHtml(params: {
  encodedContent: string;
  color: string;
  fontSize: number;
  strongColor: string;
}): string {
  const { encodedContent, color, fontSize, strongColor } = params;

  return (
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">' +
    '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>' +
    '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>' +
    '<style>' +
    'html, body { margin: 0; padding: 0; background-color: transparent; }' +
    'body {' +
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;' +
    '  color: ' + color + ';' +
    '  font-size: ' + fontSize + 'px;' +
    '  word-wrap: break-word;' +
    '  overflow: hidden;' +
    '  line-height: 1.75;' +
    '}' +
    '#math-container { padding: 4px 0; }' +
    '.para { margin: 0 0 0.9em 0; }' +
    '.para:last-child { margin-bottom: 0; }' +
    '.list-item { display: flex; align-items: flex-start; margin: 0.6em 0; }' +
    '.list-index {' +
    '  flex-shrink: 0; width: 22px; height: 22px; border-radius: 11px;' +
    '  background-color: rgba(0, 122, 255, 0.1); color: #007AFF;' +
    '  font-size: 11px; font-weight: 800;' +
    '  display: flex; align-items: center; justify-content: center;' +
    '  margin-right: 10px; margin-top: 2px;' +
    '}' +
    '.bullet-dot {' +
    '  flex-shrink: 0; width: 22px; text-align: center;' +
    '  font-weight: 900; color: ' + color + '; opacity: 0.5; margin-right: 10px;' +
    '}' +
    '.list-content { flex: 1; line-height: 1.7; }' +
    '.katex { font-size: 1.05em; }' +
    '.katex-display { text-align: left !important; margin: 0.8em 0; padding-left: 0; }' +
    '.katex-display > .katex { text-align: left !important; display: inline-block; }' +
    'strong, b { font-weight: 700; color: ' + strongColor + '; }' +
    'em, i { font-style: italic; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div id="math-container"></div>' +
    '<script>' + buildScript(encodedContent) + '</script>' +
    '</body>' +
    '</html>'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MathText component
// ─────────────────────────────────────────────────────────────────────────────

const DARK_COLORS = new Set(['#121212', '#0f172a', '#334155']);

export function MathText({
  content = '',
  color = '#121212',
  fontSize = 16,
  containerStyle,
}: MathTextProps) {
  const [height, setHeight] = React.useState(24);

  const processedContent = React.useMemo(
    () => wrapBareLaTeX(sanitizeMathContent(content)),
    [content]
  );

  const encodedContent = React.useMemo(
    () => encodeURIComponent(processedContent),
    [processedContent]
  );

  const strongColor = DARK_COLORS.has(color) ? '#000000' : '#FFFFFF';

  const html = React.useMemo(
    () => buildHtml({ encodedContent, color, fontSize, strongColor }),
    [encodedContent, color, fontSize, strongColor]
  );

  const handleMessage = React.useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (typeof data.height === 'number') {
          setHeight(Math.ceil(data.height) + 8);
        }
      } catch { /* ignore malformed messages */ }
    },
    []
  );

  return (
    <View style={[{ height: Math.max(height, 24), width: '100%' }, containerStyle]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        onMessage={handleMessage}
      />
    </View>
  );
}