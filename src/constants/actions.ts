export const DEFAULT_SCREEN = 'main';

export const SCENES = {
    GRID: 'grid',
    SPACE: 'space',
    FOREST: 'forest',
    UNDERWATER: 'underwater',
    DESERT: 'desert',
} as const;

export type SceneType = typeof SCENES[keyof typeof SCENES];

export const WEATHER_TYPES = {
    NONE: 'none',
    RAIN: 'rain',
    SNOW: 'snow',
} as const;

export type WeatherType = typeof WEATHER_TYPES[keyof typeof WEATHER_TYPES];

export const PHYSICS_BODY_TYPES = {
    STATIC: 'static',
    DYNAMIC: 'dynamic',
    KINEMATIC: 'kinematic',
    BOUNCY: 'bouncy',
} as const;

export type PhysicsBodyType = typeof PHYSICS_BODY_TYPES[keyof typeof PHYSICS_BODY_TYPES];

export const CAMERA_MODES = {
    FIRST_PERSON: 'first_person',
    THIRD_PERSON: 'third_person',
    TOP_DOWN: 'top_down',
} as const;

export type CameraMode = typeof CAMERA_MODES[keyof typeof CAMERA_MODES];

export const CONDITION_VALUES = {
    TRUE: 'true',
    FALSE: 'false',
} as const;

export const STORAGE_KEYS = {
    ONBOARDING_DISMISSED: 'kidcode_onboarding_dismissed',
    SOUND_PRESETS: 'kidcode-sound-presets',
    CLOUD: 'kidcode_cloud',
    TUTORIAL_SHOWN: 'tutorial_shown',
    ACHIEVEMENTS: 'kidcode_achievements',
    LAST_LOGIN: 'kidcode_last_login',
    USER_PROFILE: 'kidcode_user_profile',
    COMPONENTS: 'kidcode_components',
    WEEKLY_QUESTS: 'kidcode_weekly_quests',
} as const;

export const BLOCK_CATEGORIES = {
    NAVIGATION: 'Navigation',
    DESIGN: 'Design',
    WIDGETS: 'Widgets',
    ACTIONS: 'Actions',
    DATA: 'Data',
    MATH: 'Math',
    CONTROL: 'Control',
    OTHER: 'Other',
    MOTION: 'Motion',
    PHYSICS: 'Physics',
    LOOKS: 'Looks',
    SOUND: 'Sound',
    EVENTS: 'Events',
    DIALOGUE: 'Dialogue',
    INVENTORY: 'Inventory',
    AUDIO: 'Audio',
    CUTSCENE: 'Cutscene',
    BOSS: 'Boss',
    PROGRESS: 'Progress',
    THREE_D: '3D',
    OUTPUT: 'Output',
    INPUT: 'Input',
    DISPLAY: 'Display',
    LOGIC: 'Logic',
    SYSTEM: 'System',
    PROTOCOLS: 'Protocols',
    SOCIAL: 'Social',
    PLUGINS: 'Plugins',
} as const;

export const TEXT_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl',
} as const;

export const LCD_LINES = {
    LINE_1: 0,
    LINE_2: 1,
} as const;

export const DEBOUNCE_DELAY = 300;

export const ANIMATION_DURATIONS = {
    DELETE_FLASH: 400,
    DELETE_DELAY: 300,
} as const;
