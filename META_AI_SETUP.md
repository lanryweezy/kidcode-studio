# 🤖 Meta AI Tools - Setup Guide

This guide will help you set up all Meta AI integrations for KidCode Studio.

---

## 📋 OVERVIEW

KidCode Studio now includes **FREE** Meta AI tools:

| Tool | What It Does | API Required |
|------|--------------|--------------|
| **🎵 MusicGen** | Generate game music from text | Hugging Face |
| **✂️ SAM** | Extract sprites from photos | Hugging Face |
| **💻 Code Llama** | AI code helper & tutor | Hugging Face |

**All tools are FREE** using Hugging Face's Inference API!

---

## 🔑 STEP 1: Get Hugging Face Token

### Create Account

1. **Visit**: https://huggingface.co/
2. **Click**: "Sign Up" (top right)
3. **Choose**: Sign up with Google, GitHub, or email
4. **Verify**: Check your email for verification link

### Get API Token

1. **Go to**: https://huggingface.co/settings/tokens
2. **Click**: "Create new token"
3. **Name**: `KidCode Studio`
4. **Type**: Select "Read" (write not needed)
5. **Copy**: Your token (starts with `hf_`)

**Important:** Keep your token secret! Never share it publicly.

---

## 🔧 STEP 2: Configure KidCode Studio

### Create .env.local File

1. In project root, create file: `.env.local`
2. Add your Hugging Face token:

```env
# Hugging Face Token (Required for Meta AI tools)
VITE_HUGGINGFACE_TOKEN=hf_your_actual_token_here

# Optional: Other AI services
VITE_MESHY_API_KEY=your_meshy_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## ✅ STEP 3: Test the Integration

### Test Music Generator

1. **Open KidCode Studio**
2. **Click**: "AI Music Gen" button (purple/pink, headphones icon)
3. **Select**: A preset (e.g., "Epic Battle")
4. **Click**: "Generate Music"
5. **Wait**: 30-60 seconds
6. **Result**: Your custom music track! 🎵

### Test Sprite Extractor

1. **Open KidCode Studio**
2. **Click**: "Sprite Extractor" button (cyan/blue, scissors icon)
3. **Upload**: A photo (character, object, etc.)
4. **Click**: On the object you want to extract
5. **Click**: "Extract Sprite"
6. **Wait**: 10-30 seconds
7. **Result**: Transparent sprite ready to use! ✂️

### Test Code Helper

1. **Open AI Chat** (in Sidebar)
2. **Type**: "How do I make my character jump?"
3. **Result**: Code Llama explains with block suggestions! 💻

---

## 📊 API LIMITS & USAGE

### Hugging Face Free Tier

| Feature | Limit | Notes |
|---------|-------|-------|
| **MusicGen** | ~100 gens/day | Rate limited during peak |
| **SAM** | ~500 requests/day | Very generous limit |
| **Code Llama** | ~200 requests/day | Good for learning |

### Tips to Stay Within Limits

1. **Use presets** - Faster than custom generation
2. **Save results** - Don't regenerate same asset
3. **Test locally** - Use dev mode before deploying
4. **Cache music** - Reuse generated tracks

---

## 🚀 PRODUCTION DEPLOYMENT

### Option A: Hugging Face Pro ($9/month)

**Benefits:**
- Higher rate limits
- Faster inference
- Priority queue
- Commercial use allowed

**Upgrade**: https://huggingface.co/pricing

### Option B: Self-Host Models

**For advanced users:**

```bash
# MusicGen (requires 8GB+ GPU)
pip install audiocraft
python -m audiocraft.musicgen

# SAM (requires 4GB+ GPU)
pip install segment-anything
python sam_demo.py

# Code Llama (requires 16GB+ GPU)
pip install transformers
python code_llama_server.py
```

**Benefits:**
- Unlimited usage
- Full control
- No API costs

**Requirements:**
- NVIDIA GPU (RTX 3060 or better)
- 16GB+ RAM
- 50GB+ storage

---

## 🛠️ TROUBLESHOOTING

### Error: "Hugging Face token not configured"

**Solution:**
1. Check `.env.local` exists
2. Verify token starts with `hf_`
3. Restart dev server
4. Clear browser cache

### Error: "Model is loading"

**Cause:** Model is being loaded into memory (first request only)

**Solution:** Wait 2-3 minutes, then try again. Subsequent requests are fast!

### Error: "Rate limit exceeded"

**Cause:** Too many requests in short time

**Solution:**
1. Wait 5-10 minutes
2. Try again
3. Consider Hugging Face Pro upgrade

### Music generation is slow

**Normal times:**
- MusicGen Small: 30-60 seconds
- MusicGen Medium: 60-90 seconds
- MusicGen Large: 90-120 seconds

**To speed up:**
- Use "small" model in settings
- Generate shorter durations (30s vs 60s)
- Use presets (optimized prompts)

### Sprite extraction not accurate

**Tips for better results:**
1. **Use high-contrast images**
2. **Click multiple points** on the object
3. **Try different presets** (Character vs Prop)
4. **Use "Precise Cutout"** mode for detailed edges

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- **MusicGen**: https://github.com/facebookresearch/audiocraft
- **SAM**: https://github.com/facebookresearch/segment-anything
- **Code Llama**: https://github.com/facebookresearch/codellama
- **Hugging Face API**: https://huggingface.co/docs/api-inference

### Tutorials

- **MusicGen Demo**: https://huggingface.co/spaces/facebook/MusicGen
- **SAM Demo**: https://huggingface.co/spaces/fffiloni/SAM
- **Code Llama Demo**: https://huggingface.co/spaces/codellama/CodeLlama-34b-Instruct

### Community

- **Discord**: https://discord.gg/huggingface
- **Forum**: https://discuss.huggingface.co/
- **GitHub Issues**: Report bugs to respective repos

---

## 💡 BEST PRACTICES

### Music Generation

✅ **DO:**
- Use specific prompts ("epic orchestral battle" vs "music")
- Start with presets to learn
- Generate 30s loops for gameplay
- Layer multiple tracks

❌ **DON'T:**
- Use vague prompts
- Generate 120s tracks unnecessarily
- Forget to save your favorites

### Sprite Extraction

✅ **DO:**
- Use clear, well-lit photos
- Click on multiple points of the object
- Try different presets
- Download extracted sprites

❌ **DON'T:**
- Use blurry or dark images
- Expect perfect results on first try
- Forget to check transparency

### Code Helper

✅ **DO:**
- Ask specific questions
- Include context (game mode, current blocks)
- Use suggestions as learning opportunities

❌ **DON'T:**
- Ask for complete games (too complex)
- Copy code without understanding
- Rely solely on AI (learn the concepts!)

---

## 🎯 NEXT STEPS

Once you have Meta AI tools working:

1. **Explore all presets** - Try every music style
2. **Create asset library** - Build collection of sprites/music
3. **Share with community** - Show off your creations
4. **Learn from AI** - Use Code Llama to understand coding
5. **Experiment!** - Try unusual combinations

---

## 🆘 NEED HELP?

### Check These First:

1. ✅ Is `.env.local` configured correctly?
2. ✅ Is dev server restarted after config changes?
3. ✅ Is Hugging Face token valid?
4. ✅ Are you within rate limits?

### Still Stuck?

1. **Check Console** - F12 → Console for errors
2. **Read Logs** - Server logs show API responses
3. **Ask Community** - Discord, forums, GitHub
4. **Contact Support** - support@kidcode.studio

---

**Happy Creating with Meta AI!** 🤖✨
