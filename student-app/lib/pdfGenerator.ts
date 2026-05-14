const parseMarkdown = (text: string) => {
    if (!text) return '';
    let html = text;
    
    // Headers (### Header)
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; margin-top: 20px; color: #0f172a; font-weight: 800; letter-spacing: -0.3px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 22px; margin-top: 25px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 26px; margin-top: 30px; color: #0f172a; font-weight: 900; letter-spacing: -0.8px;">$1</h1>');

    // Rule: Split "Label: $$math$$" into two lines
    html = html.replace(/^(.+?):\s*(\$\$.+?\$\$)/gm, "$1:<br/>$2");

    // Block Math ($$ ... $$) -> Wrap in a div with margins
    html = html.replace(/\$\$(.*?)\$\$/gs, '<div style="margin: 15px 0; text-align: left;">$$$1$$</div>');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists (- item)
    html = html.replace(/^- (.*$)/gim, '<div style="margin-left: 10px; margin-bottom: 8px; display: flex;"><span style="margin-right: 10px; color: #3b82f6;">•</span><span>$1</span></div>');

    // Numbered Lists (1. item)
    html = html.replace(/^[0-9]+\. (.*$)/gim, (match, content) => {
        const num = match.split('.')[0];
        return `<div style="margin-left: 10px; margin-bottom: 8px; display: flex;"><span style="margin-right: 10px; color: #3b82f6; font-weight: bold;">${num}.</span><span>${content}</span></div>`;
    });

    // Paragraphs (double newlines)
    html = html.split('\n\n').map(p => {
        if (p.includes('<h') || p.includes('<div') || p.includes('<p')) return p;
        return `<p style="margin-bottom: 12px;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
};

export const generateQuizHTML = (quizTitle: string, score: number, questions: any[]) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        @page {
            margin: 20mm;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 0; color: #1e293b; line-height: 1.5; background: #fff; margin: 0; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px; }
        .title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1px; }
        .score-bubble { display: inline-block; background: #3b82f6; color: white; padding: 8px 20px; border-radius: 30px; font-weight: 800; font-size: 18px; margin-top: 15px; }
        .question-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; margin-bottom: 30px; page-break-after: always; box-shadow: none; }
        .q-header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .q-num { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }
        .q-status { font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .correct { background: #dcfce7; color: #15803d; }
        .incorrect { background: #fee2e2; color: #b91c1c; }
        .q-text { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 15px; line-height: 1.4; }
        .answer-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 15px; }
        .label { font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .explanation { margin-top: 20px; font-size: 14px; color: #334155; background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 6px solid #3b82f6; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 30px; }
        
        p { margin: 0 0 15px 0; }
        strong { color: #0f172a; }
        
        /* MathJax adjustments */
        .MathJax { font-size: 1.15em !important; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${quizTitle}</h1>
        <div class="score-bubble">${Math.round(score)}% Score</div>
    </div>

    <div class="questions">
        ${questions.map((q, index) => {
            const isTheory = q.type === 'essay' || q.type === 'theory' || q.question_type === 'essay';
            const questionText = q.question || q.question_text || 'No text detected';
            const isCorrect = q.is_correct !== undefined ? q.is_correct : (isTheory ? q.user_answer : q.user_answer === q.correct_answer);
            
            let answerHtml = '';
            
            if (isTheory) {
                answerHtml = `
                    <div class="answer-box">
                        <div class="label">Model Answer</div>
                        <div style="font-size: 15px;">${parseMarkdown(q.correct_answer || '')}</div>
                    </div>
                `;
            } else {
                answerHtml = `
                    <div class="answer-box">
                        <div class="label">Your Answer</div>
                        <div style="font-weight: 700; color: ${isCorrect ? '#15803d' : '#b91c1c'}; font-size: 16px;">${q.user_answer || 'Skipped'}</div>
                        
                        ${!isCorrect ? `
                            <div class="label" style="margin-top: 15px;">Correct Answer</div>
                            <div style="font-weight: 700; color: #15803d; font-size: 16px;">${q.correct_answer}</div>
                        ` : ''}
                    </div>
                `;
            }

            return `
            <div class="question-card">
                <div class="q-header">
                    <span class="q-num">Question ${index + 1}</span>
                    <span class="q-status ${isCorrect ? 'correct' : 'incorrect'}">
                        ${isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                </div>
                <div class="q-text">${parseMarkdown(questionText)}</div>
                ${answerHtml}
                ${q.explanation ? `
                    <div class="explanation">
                        <div class="label" style="color: #3b82f6; margin-bottom: 12px;">Detailed Explanation</div>
                        ${parseMarkdown(q.explanation)}
                    </div>
                ` : ''}
            </div>
            `;
        }).join('')}
    </div>

    <div class="footer">
        Generated by <strong>Skeeme</strong> &mdash; AI Study Assistant<br>
        <a href="https://skeeme.com/students" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Join the community &rarr; skeeme.com/students</a>
    </div>
</body>
</html>
    `;
};

export const generateScanHTML = (results: any[]) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        @page {
            margin: 20mm;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 0; color: #1e293b; line-height: 1.5; background: #fff; margin: 0; }
        .container { padding: 0; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 25px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 5px 0; letter-spacing: -1px; }
        .subtitle { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }
        .question-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 30px; page-break-after: always; box-shadow: none; }
        .q-header { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .q-num { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }
        .q-type { font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .theory-tag { background: #eff6ff; color: #1d4ed8; }
        .calc-tag { background: #f0fdf4; color: #15803d; }
        
        .q-text-box { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 6px solid #cbd5e1; }
        .label { font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; }
        
        .steps-container { margin-bottom: 20px; }
        .step-item { font-size: 14px; margin-bottom: 10px; display: flex; gap: 12px; }
        .step-num { font-weight: 800; color: #3b82f6; min-width: 25px; }
        
        .solution-highlight { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-top: 25px; }
        .explanation-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-top: 20px; }
        
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 30px; }
        
        p { margin: 0 0 12px 0; }
        h3 { margin-top: 25px !important; margin-bottom: 12px !important; font-size: 16px !important; }
        strong { color: #0f172a; }
        
        /* Page break controls */
        .question-card { page-break-inside: auto; }
        h1, h2, h3 { page-break-after: avoid; }
        
        /* MathJax adjustments */
        .MathJax { font-size: 1.15em !important; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Study Solutions</h1>
        <div class="subtitle">AI-Powered Academic Breakdown</div>
    </div>

    <div class="questions">
        ${results.map((item, index) => {
            const isTheory = item.type === 'theory';
            return `
            <div class="question-card">
                <div class="q-header">
                    <span class="q-num">Question ${index + 1}</span>
                    <span class="q-type ${isTheory ? 'theory-tag' : 'calc-tag'}">${isTheory ? 'Theory' : 'Calculation'}</span>
                </div>
                
                <div class="q-text-box">
                    ${parseMarkdown(item.question || 'No text detected')}
                </div>
                
                ${!isTheory ? `
                    ${item.steps && item.steps.length > 0 ? `
                        <div class="steps-container">
                            <div class="label">Step-by-Step Solution</div>
                            ${item.steps.map((step: string, sIdx: number) => `
                                <div class="step-item">
                                    <span class="step-num">${sIdx + 1}.</span>
                                    <span>${parseMarkdown(step)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="solution-highlight">
                        <div class="label" style="color: #15803d;">Final Verified Answer</div>
                        <div style="font-weight: 800; color: #0f172a; font-size: 20px;">${item.solution}</div>
                    </div>
                ` : `
                    ${item.explanation ? `
                        <div class="explanation-box">
                            <div class="label" style="color: #3b82f6;">Detailed Academic Note</div>
                            <div style="font-size: 15px; color: #1e293b;">${parseMarkdown(item.explanation)}</div>
                        </div>
                    ` : ''}
                    ${item.summary ? `
                        <div style="margin-top: 25px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
                            <div class="label" style="color: #1d4ed8;">Key Summary</div>
                            <div style="font-weight: 700; color: #0f172a; font-size: 16px;">${item.summary}</div>
                        </div>
                    ` : ''}
                `}
            </div>
            `;
        }).join('')}
    </div>

    <div class="footer">
        Generated by <strong>Skeeme</strong> &mdash; AI Study Assistant<br>
        <a href="https://skeeme.com/students" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Unlock your potential &rarr; skeeme.com/students</a>
    </div>
</body>
</html>
    `;
};
