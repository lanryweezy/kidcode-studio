import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  common: {
    play: "Play", stop: "Stop", pause: "Pause", save: "Save", load: "Load",
    export: "Export", import: "Import", settings: "Settings", help: "Help",
    back: "Back", next: "Next", cancel: "Cancel", confirm: "Confirm",
    delete: "Delete", duplicate: "Duplicate", undo: "Undo", redo: "Redo"
  },
  editor: {
    blocks: "Blocks", workspace: "Workspace", canvas: "Canvas",
    addBlock: "Add Block", removeBlock: "Remove Block", moveBlock: "Move Block",
    runCode: "Run Code", stopCode: "Stop Code", clearWorkspace: "Clear Workspace"
  },
  blocks: {
    motion: "Motion", events: "Events", control: "Control", sensing: "Sensing",
    operators: "Operators", variables: "Variables", myBlocks: "My Blocks",
    moveForward: "Move Forward", turnLeft: "Turn Left", turnRight: "Turn Right",
    if: "If", ifElse: "If Else", repeat: "Repeat", forever: "Forever", wait: "Wait"
  },
  menu: {
    home: "Home", gallery: "Gallery", missions: "Missions",
    musicStudio: "Music Studio", pixelEditor: "Pixel Editor",
    soundEditor: "Sound Editor", marketplace: "Marketplace",
    profile: "Profile", pricing: "Pricing"
  },
  accessibility: {
    highContrast: "High Contrast Mode", screenReader: "Screen Reader Support",
    keyboardNav: "Keyboard Navigation", skipToContent: "Skip to Content"
  },
  export: {
    standaloneHTML: "Export as HTML", zipPackage: "Export as ZIP",
    androidAPK: "Export for Android", printWorksheet: "Print Worksheet"
  },
  ai: {
    chatWithAI: "Chat with AI", askQuestion: "Ask a question...",
    thinking: "AI is thinking...", error: "AI encountered an error",
    moderated: "This message cannot be sent"
  }
};

const es = {
  common: {
    play: "Jugar", stop: "Detener", pause: "Pausar", save: "Guardar", load: "Cargar",
    export: "Exportar", import: "Importar", settings: "Ajustes", help: "Ayuda",
    back: "Atrás", next: "Siguiente", cancel: "Cancelar", confirm: "Confirmar",
    delete: "Eliminar", duplicate: "Duplicar", undo: "Deshacer", redo: "Rehacer"
  },
  editor: {
    blocks: "Bloques", workspace: "Área de trabajo", canvas: "Lienzo",
    addBlock: "Agregar Bloque", removeBlock: "Quitar Bloque", moveBlock: "Mover Bloque",
    runCode: "Ejecutar Código", stopCode: "Detener Código", clearWorkspace: "Limpiar Área"
  },
  blocks: {
    motion: "Movimiento", events: "Eventos", control: "Control", sensing: "Sensores",
    operators: "Operadores", variables: "Variables", myBlocks: "Mis Bloques",
    moveForward: "Mover Adelante", turnLeft: "Girar Izquierda", turnRight: "Girar Derecha",
    if: "Si", ifElse: "Si Sino", repeat: "Repetir", forever: "Para Siempre", wait: "Esperar"
  },
  menu: {
    home: "Inicio", gallery: "Galería", missions: "Misiones",
    musicStudio: "Estudio de Música", pixelEditor: "Editor de Píxeles",
    soundEditor: "Editor de Sonido", marketplace: "Mercado",
    profile: "Perfil", pricing: "Precios"
  },
  accessibility: {
    highContrast: "Alto Contraste", screenReader: "Lector de Pantalla",
    keyboardNav: "Navegación por Teclado", skipToContent: "Saltar al Contenido"
  },
  export: {
    standaloneHTML: "Exportar como HTML", zipPackage: "Exportar como ZIP",
    androidAPK: "Exportar para Android", printWorksheet: "Imprimir Hoja de Trabajo"
  },
  ai: {
    chatWithAI: "Chat con IA", askQuestion: "Haz una pregunta...",
    thinking: "IA pensando...", error: "La IA encontró un error",
    moderated: "Este mensaje no se puede enviar"
  }
};

const fr = {
  common: {
    play: "Jouer", stop: "Arrêter", pause: "Pause", save: "Enregistrer", load: "Charger",
    export: "Exporter", import: "Importer", settings: "Paramètres", help: "Aide",
    back: "Retour", next: "Suivant", cancel: "Annuler", confirm: "Confirmer",
    delete: "Supprimer", duplicate: "Dupliquer", undo: "Annuler", redo: "Rétablir"
  },
  editor: {
    blocks: "Blocs", workspace: "Espace de travail", canvas: "Canevas",
    addBlock: "Ajouter un Bloc", removeBlock: "Supprimer un Bloc", moveBlock: "Déplacer un Bloc",
    runCode: "Exécuter le Code", stopCode: "Arrêter le Code", clearWorkspace: "Effacer l'Espace"
  },
  blocks: {
    motion: "Mouvement", events: "Événements", control: "Contrôle", sensing: "Détection",
    operators: "Opérateurs", variables: "Variables", myBlocks: "Mes Blocs",
    moveForward: "Avancer", turnLeft: "Tourner à Gauche", turnRight: "Tourner à Droite",
    if: "Si", ifElse: "Si Sinon", repeat: "Répéter", forever: "Pour Toujours", wait: "Attendre"
  },
  menu: {
    home: "Accueil", gallery: "Galerie", missions: "Missions",
    musicStudio: "Studio de Musique", pixelEditor: "Éditeur de Pixels",
    soundEditor: "Éditeur de Son", marketplace: "Marché",
    profile: "Profil", pricing: "Tarifs"
  },
  accessibility: {
    highContrast: "Contraste Élevé", screenReader: "Lecteur d'Écran",
    keyboardNav: "Navigation Clavier", skipToContent: "Aller au Contenu"
  },
  export: {
    standaloneHTML: "Exporter en HTML", zipPackage: "Exporter en ZIP",
    androidAPK: "Exporter pour Android", printWorksheet: "Imprimer la Fiche"
  },
  ai: {
    chatWithAI: "Chat avec l'IA", askQuestion: "Posez une question...",
    thinking: "L'IA réfléchit...", error: "L'IA a rencontré une erreur",
    moderated: "Ce message ne peut pas être envoyé"
  }
};

const zh = {
  common: {
    play: "播放", stop: "停止", pause: "暂停", save: "保存", load: "加载",
    export: "导出", import: "导入", settings: "设置", help: "帮助",
    back: "返回", next: "下一步", cancel: "取消", confirm: "确认",
    delete: "删除", duplicate: "复制", undo: "撤销", redo: "重做"
  },
  editor: {
    blocks: "积木", workspace: "工作区", canvas: "画布",
    addBlock: "添加积木", removeBlock: "移除积木", moveBlock: "移动积木",
    runCode: "运行代码", stopCode: "停止代码", clearWorkspace: "清空工作区"
  },
  blocks: {
    motion: "运动", events: "事件", control: "控制", sensing: "侦测",
    operators: "运算", variables: "变量", myBlocks: "我的积木",
    moveForward: "向前移动", turnLeft: "向左转", turnRight: "向右转",
    if: "如果", ifElse: "如果否则", repeat: "重复", forever: "永远", wait: "等待"
  },
  menu: {
    home: "首页", gallery: "画廊", missions: "任务",
    musicStudio: "音乐工作室", pixelEditor: "像素编辑器",
    soundEditor: "声音编辑器", marketplace: "市场",
    profile: "个人资料", pricing: "价格"
  },
  accessibility: {
    highContrast: "高对比度", screenReader: "屏幕阅读器",
    keyboardNav: "键盘导航", skipToContent: "跳到内容"
  },
  export: {
    standaloneHTML: "导出为HTML", zipPackage: "导出为ZIP",
    androidAPK: "导出到Android", printWorksheet: "打印工作表"
  },
  ai: {
    chatWithAI: "与AI聊天", askQuestion: "提出问题...",
    thinking: "AI正在思考...", error: "AI遇到了错误",
    moderated: "此消息无法发送"
  }
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  zh: { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;