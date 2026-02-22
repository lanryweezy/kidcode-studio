
import { SavedProject } from './storageService';

export const exportToStandaloneHTML = (project: SavedProject): string => {
  const projectData = JSON.stringify(project);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Built with KidCode Studio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; background: #0f172a; color: white; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
        #player-container { background: #1e293b; border-radius: 2rem; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 4px solid #334155; text-align: center; }
        .btn { background: #6366f1; color: white; border: none; padding: 1rem 2rem; border-radius: 1rem; font-weight: bold; cursor: pointer; margin-top: 1rem; }
    </style>
</head>
<body>
    <div id="player-container">
        <h1 class="text-3xl font-black mb-2">${project.name}</h1>
        <p class="text-slate-400 mb-6">By a KidCode Creator</p>
        <div id="stage-placeholder" class="w-[400px] h-[400px] bg-black rounded-xl mb-4 flex items-center justify-center italic text-slate-600 border-2 border-dashed border-slate-700">
            Runtime Loading...
        </div>
        <button class="btn" onclick="alert('In a real export, this would start the game loop!')">PLAY PROJECT</button>
        <p class="mt-4 text-[10px] text-slate-500 uppercase tracking-widest">Standalone Player v1.0</p>
    </div>

    <script>
        const PROJECT_DATA = ${projectData};
        console.log("Project Loaded:", PROJECT_DATA);
        // Note: In a production version, we would bundle the minified 'useCodeInterpreter' and 'Stage' logic here.
    </script>
</body>
</html>
  `;
};
