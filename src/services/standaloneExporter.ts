
import { SavedProject } from './storageService';

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
        console.log("Project Loaded:", PROJECT_DATA);
    </script>
</body>
</html>
  `;
};
