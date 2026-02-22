# 📱 KidCode Studio Mobile App

React Native mobile version of KidCode Studio for iOS and Android!

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### **Installation:**

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Press:
# - 'a' to open on Android
# - 'i' to open on iOS
# - Scan QR code with Expo Go app on your phone
```

---

## 📲 Features

### **Mobile-Optimized:**
- ✅ Touch-friendly block editor
- ✅ Larger blocks for easy dragging
- ✅ Optimized for phones & tablets
- ✅ Offline mode support
- ✅ Camera integration for sprite extraction
- ✅ Accelerometer for tilt controls

### **Same Great Features:**
- 🎮 Create 2D & 3D games
- 🤖 AI 3D generator
- 🎵 AI music generator
- ✂️ Sprite extractor
- 🌍 Procedural terrain
- 📤 Export projects

---

## 🎨 Mobile-Specific Features

### **Touch Controls:**
- Drag blocks with one finger
- Pinch to zoom workspace
- Double-tap to edit block
- Swipe to delete

### **Camera Integration:**
```javascript
// Extract sprites from photos
const { status } = await Camera.requestCameraPermissionsAsync();
const photo = await takePictureAsync();
const sprite = await extractSprite(photo.uri);
```

### **Accelerometer:**
```javascript
// Tilt to control character
useEffect(() => {
  const subscription = Accelerometer.addListener(data => {
    setTiltX(data.x);
    setTiltY(data.y);
  });
  return () => subscription.remove();
}, []);
```

### **Offline Mode:**
- Projects saved locally
- Works without internet
- Syncs when online

---

## 📁 Project Structure

```
mobile/
├── App.js                 # Main app entry
├── screens/
│   ├── HomeScreen.js      # Home with mode selection
│   ├── BlockEditorScreen.js  # Block-based editor
│   ├── ProjectScreen.js   # Project list
│   └── ProfileScreen.js   # User profile
├── components/
│   ├── Block.js           # Touch-optimized block
│   ├── Toolbox.js         # Block categories
│   └── Preview.js         # Game preview
├── services/
│   ├── storage.js         # Local storage
│   └── api.js             # API calls
└── assets/                # Images, fonts
```

---

## 🔧 Configuration

### **app.json:**
```json
{
  "expo": {
    "name": "KidCode Studio",
    "slug": "kidcode-studio",
    "version": "1.0.0",
    "orientation": "landscape",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#667eea"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.kidcode.studio"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667eea"
      },
      "package": "com.kidcode.studio"
    }
  }
}
```

---

## 📤 Build for Production

### **iOS:**
```bash
# Build IPA
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### **Android:**
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

---

## 🎯 Optimization Tips

### **Performance:**
1. Use `React.memo()` for block components
2. Virtualize long block lists
3. Lazy load AI tools
4. Cache generated assets

### **Touch Targets:**
- Minimum 44x44 points
- Add padding around blocks
- Use `hitSlop` for small buttons

### **Battery:**
- Pause game loop when backgrounded
- Reduce AI polling frequency
- Optimize screen brightness

---

## 📊 Screenshots

### **Home Screen:**
```
┌─────────────────────────────────┐
│  🚀 KidCode Studio              │
│  Create Games with AI Magic!    │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ 🎮       │  │ 📱       │    │
│  │ Game     │  │ App      │    │
│  │ Maker    │  │ Builder  │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ ⚡       │  │ 📁       │    │
│  │ Circuit  │  │ Projects │    │
│  │ Lab      │  │          │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  🤖 FREE AI Tools               │
│  🧊 🎵 ✂️ 💻                    │
└─────────────────────────────────┘
```

---

## 🐛 Known Issues

1. **AI tools slower on mobile** - Use WiFi for best results
2. **Large projects lag** - Split into smaller scenes
3. **3D mode battery drain** - Use 2D for longer sessions

---

## 🚀 Roadmap

### **Phase 1 (Current):**
- ✅ Basic block editor
- ✅ Project management
- ✅ Touch optimization

### **Phase 2 (Next):**
- [ ] Camera sprite extraction
- [ ] Accelerometer controls
- [ ] Offline mode

### **Phase 3 (Future):**
- [ ] Multiplayer on mobile
- [ ] AR mode
- [ ] Voice commands

---

## 📞 Support

**Issues:** https://github.com/kidcode-studio/mobile/issues

**Discord:** https://discord.gg/kidcode

**Email:** support@kidcode.studio

---

## 📄 License

Same as main KidCode Studio project.

---

**Happy Mobile Coding!** 📱✨
