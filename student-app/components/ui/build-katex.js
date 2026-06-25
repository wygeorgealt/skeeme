/* global Buffer */
const fs = require('fs');
const https = require('https');

const fetchUrl = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
    }).on('error', reject);
});

async function run() {
    console.log('Downloading KaTeX CSS...');
    let css = await fetchUrl('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
    
    console.log('Downloading KaTeX JS...');
    const js = await fetchUrl('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js');
    
    console.log('Downloading auto-render JS...');
    const autoRender = await fetchUrl('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js');

    // Extract fonts from CSS
    const fontUrls = [...css.matchAll(/url\(([^)]*?\.woff2)\)/g)].map(m => m[1]);
    const uniqueFonts = [...new Set(fontUrls)];
    
    console.log('Found fonts:', uniqueFonts);
    
    for (const fontUrl of uniqueFonts) {
        const fullUrl = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/' + fontUrl;
        console.log('Downloading font:', fullUrl);
        const fontBuffer = await new Promise((resolve, reject) => {
            https.get(fullUrl, (res) => {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            }).on('error', reject);
        });
        
        const b64 = fontBuffer.toString('base64');
        const dataUri = `data:font/woff2;charset=utf-8;base64,${b64}`;
        
        // Replace all instances of this font in CSS
        css = css.replace(new RegExp('url\\(' + fontUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\)', 'g'), `url('${dataUri}')`);
    }

    // Remove woff and ttf references as we only need woff2 for modern webviews
    css = css.replace(/url\((.*?\.woff)\) format\('woff'\),?/g, '');
    css = css.replace(/url\((.*?\.ttf)\) format\('truetype'\),?/g, '');
    
    const out = `
export const KATEX_CSS = \`${css}\`;
export const KATEX_JS = \`${js.replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/`/g, '\\`')}\`;
export const KATEX_AUTO_RENDER = \`${autoRender.replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/`/g, '\\`')}\`;
`;

    fs.writeFileSync('./katex-assets.ts', out);
    console.log('Done!');
}
run();
