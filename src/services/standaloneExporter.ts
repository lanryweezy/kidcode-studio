import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SavedProject } from './storageService';
import { CommandBlock, CommandType } from '../types';

export const exportToStandaloneHTML = (project: SavedProject): string => {
    const projectData = JSON.stringify(project);
    const siteUrl = 'https://kidcode-studio.vercel.app';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} — Built with KidCode Studio</title>
    <meta name="description" content="${project.name} — A project created with KidCode Studio, the next-gen block coding platform for kids.">
    <meta property="og:title" content="${project.name} — Built with KidCode Studio">
    <meta property="og:description" content="Check out this awesome project! Build your own games, apps, and inventions at KidCode Studio.">
    <meta property="og:image" content="${siteUrl}/og-preview.png">
    <meta property="og:url" content="${siteUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f172a; color: white; font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
        .main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        #player-container { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 2rem; padding: 2.5rem; box-shadow: 0 25px 60px -15px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.1); text-align: center; max-width: 500px; width: 100%; }
        .project-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 0.25rem; background: linear-gradient(135deg, #a78bfa, #818cf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .creator-tag { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
        #stage { width: 100%; aspect-ratio: 1; background: #000; border-radius: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; font-style: italic; color: #475569; border: 2px solid #1e293b; overflow: hidden; }
        .play-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.875rem 2.5rem; border-radius: 999px; font-weight: 800; font-size: 1rem; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
        .play-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 25px rgba(99,102,241,0.5); }
        .play-btn:active { transform: scale(0.97); }
        .watermark { background: linear-gradient(90deg, #6366f1, #8b5cf6); padding: 0.75rem 1.5rem; text-align: center; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; }
        .watermark a { color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
        .watermark a:hover { text-decoration: underline; }
        .watermark .cta { background: white; color: #6366f1; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.7rem; font-weight: 800; margin-left: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
    </style>
</head>
<body>
    <div class="main">
        <div id="player-container">
            <div class="project-title">${project.name}</div>
            <p class="creator-tag">by a KidCode Creator ⚡</p>
            <div id="stage">Loading Project...</div>
            <button class="play-btn" onclick="alert('In a full export, this starts the game loop!')">▶ PLAY PROJECT</button>
        </div>
    </div>

    <!-- VIRAL WATERMARK BANNER -->
    <div class="watermark">
        <a href="${siteUrl}" target="_blank" rel="noopener">
            ⚡ Built with <strong>KidCode Studio</strong>
            <span class="cta">Start Building Free →</span>
        </a>
    </div>

    <script>
        const PROJECT_DATA = ${projectData};
    </script>
</body>
</html>
  `;
};

export const exportToZIP = async (project: SavedProject): Promise<void> => {
  const zip = new JSZip();
  const html = exportToStandaloneHTML(project);
  zip.file('index.html', html);

  const readme = [
    `# ${project.name}`,
    '',
    'This project was exported from KidCode Studio.',
    '',
    '## How to run',
    '',
    '1. Open `index.html` in any modern web browser.',
    '2. No server required — everything is self-contained.',
    '',
    '## Files',
    '',
    '- `index.html` — The complete application',
    '',
    `Built with KidCode Studio ⚡`,
  ].join('\n');
  zip.file('README.md', readme);

  if (project.thumbnail) {
    const base64Data = project.thumbnail.split(',')[1];
    if (base64Data) {
      zip.file('thumbnail.jpg', base64Data, { base64: true });
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  saveAs(blob, `${safeName}.zip`);
};

const formatBlockForPrint = (block: CommandBlock, indent: number = 0): string => {
  const prefix = '  '.repeat(indent);
  const p = block.params;

  switch (block.type) {
    case CommandType.MOVE_X:
      return `${prefix}[Move X: ${p.value ?? 0}]`;
    case CommandType.MOVE_Y:
      return `${prefix}[Move Y: ${p.value ?? 0}]`;
    case CommandType.MOVE_Z:
      return `${prefix}[Move Z: ${p.value ?? 0}]`;
    case CommandType.ROTATE_X:
      return `${prefix}[Rotate X: ${p.value ?? 0}]`;
    case CommandType.ROTATE_Y:
      return `${prefix}[Rotate Y: ${p.value ?? 0}]`;
    case CommandType.ROTATE_Z:
      return `${prefix}[Rotate Z: ${p.value ?? 0}]`;
    case CommandType.SAY:
      return `${prefix}[Say "${p.message || p.text || ''}"]`;
    case CommandType.WAIT:
      return `${prefix}[Wait ${p.duration ?? p.value ?? 1} seconds]`;
    case CommandType.REPEAT:
      return `${prefix}[Repeat ${p.value ?? 10} times]`;
    case CommandType.END_REPEAT:
      return `${prefix}[End Repeat]`;
    case CommandType.FOREVER:
      return `${prefix}[Forever]`;
    case CommandType.END_FOREVER:
      return `${prefix}[End Forever]`;
    case CommandType.IF:
      return `${prefix}[If ${p.condition || 'condition'}]`;
    case CommandType.ELSE:
      return `${prefix}[Else]`;
    case CommandType.END_IF:
      return `${prefix}[End If]`;
    case CommandType.SET_VAR:
      return `${prefix}[Set ${p.varName || 'var'} = ${p.value ?? p.text ?? ''}]`;
    case CommandType.CHANGE_VAR:
      return `${prefix}[Change ${p.varName || 'var'} by ${p.value ?? 1}]`;
    case CommandType.ADD_BUTTON:
      return `${prefix}[Add Button "${p.text || ''}"]`;
    case CommandType.ADD_TEXT_BLOCK:
      return `${prefix}[Add Text "${p.text || ''}"]`;
    case CommandType.ADD_INPUT:
      return `${prefix}[Add Input "${p.text || ''}"]`;
    case CommandType.SET_TITLE:
      return `${prefix}[Set Title "${p.text || ''}"]`;
    case CommandType.SET_BACKGROUND:
      return `${prefix}[Set Background "${p.color || p.text || ''}"]`;
    case CommandType.COMMENT:
      return `${prefix}// ${p.text || ''}`;
    case CommandType.BROADCAST:
      return `${prefix}[Broadcast "${p.message || ''}"]`;
    case CommandType.WHEN_I_RECEIVE:
      return `${prefix}[When I receive "${p.message || ''}"]`;
    case CommandType.PLAY_TONE:
      return `${prefix}[Play Tone ${p.value ?? 440}Hz]`;
    case CommandType.PLAY_SOUND:
      return `${prefix}[Play Sound "${p.text || ''}"]`;
    case CommandType.LED_ON:
      return `${prefix}[LED ON pin ${p.pin ?? 0}]`;
    case CommandType.LED_OFF:
      return `${prefix}[LED OFF pin ${p.pin ?? 0}]`;
    default:
      return `${prefix}[${block.type}]`;
  }
};

export const generatePrintableWorksheet = (project: SavedProject): string => {
  const blockLines: string[] = [];
  if (project.data.commands) {
    project.data.commands.forEach(block => {
      blockLines.push(formatBlockForPrint(block));
    });
  }

  const blocksText = blockLines.length > 0 ? blockLines.join('\n\n') : 'No blocks in project.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.name} - Block Script Worksheet</title>
  <style>
    @media print {
      body { font-family: 'Courier New', monospace; margin: 2cm; }
      h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
      h2 { font-size: 18px; margin-top: 24px; }
      .blocks { white-space: pre-wrap; font-size: 14px; line-height: 1.6; background: #f5f5f5; padding: 16px; border-radius: 8px; }
      .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
      .no-print { display: none; }
    }
    @page { margin: 2cm; }
    body { font-family: 'Courier New', monospace; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; }
    h2 { font-size: 18px; margin-top: 24px; }
    .blocks { white-space: pre-wrap; font-size: 14px; line-height: 1.6; background: #f5f5f5; padding: 16px; border-radius: 8px; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
    .print-btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 16px 0; }
    .print-btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>${project.name}</h1>
  <p><strong>Block Script Worksheet</strong></p>
  <p>Project Type: ${project.mode || 'Game'}</p>

  <h2>Block Script</h2>
  <div class="blocks">${blocksText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

  <div class="footer">
    Generated by KidCode Studio | ${new Date().toLocaleDateString()}
  </div>

  <div class="no-print">
    <button class="print-btn" onclick="window.print()">Print Worksheet</button>
  </div>
</body>
</html>`;
};

export const exportPrintableWorksheet = (project: SavedProject): void => {
  const html = generatePrintableWorksheet(project);
  const blob = new Blob([html], { type: 'text/html' });
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  saveAs(blob, `${safeName}_worksheet.html`);
};
