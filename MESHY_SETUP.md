# 🎨 AI 3D Generator - Meshy API Setup Guide

## Step 1: Get Your Meshy AI API Key

### Option A: Free Tier (Recommended for Testing)

1. **Visit Meshy AI**: Go to https://www.meshy.ai/

2. **Sign Up**: Click "Sign Up" and create a free account
   - You can sign up with Google, Discord, or email
   - Free tier includes **10 generations per month**

3. **Get API Key**:
   - After signing in, click your profile icon
   - Go to "Settings" → "API Keys"
   - Click "Create New API Key"
   - Copy your API key (starts with `msy_`)

### Option B: Paid Plans (For Production)

- **Pro Plan**: $29/month - 100 generations/month
- **Business Plan**: $99/month - 500 generations/month
- **Enterprise**: Custom pricing - Unlimited generations

---

## Step 2: Configure KidCode Studio

1. **Create .env.local file** in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your API key** to `.env.local`:
   ```env
   VITE_MESHY_API_KEY=msy_your_actual_api_key_here
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

---

## Step 3: Test the Integration

1. **Open KidCode Studio** in your browser

2. **Click "AI 3D Creator"** in the Sidebar (cyan/blue button with box icon)

3. **Enter a prompt** like:
   - "A cute robot with rainbow arms"
   - "A treasure chest with gold coins"
   - "A magical sword with glowing runes"

4. **Select Style**: Choose Cartoon, Realistic, Low Poly, etc.

5. **Click "Generate 3D Model"**

6. **Wait 60 seconds** for generation

7. **Preview and Import** your 3D model!

---

## 📊 API Usage & Costs

### Free Tier (Testing)
- **10 generations/month**
- Standard quality
- ~60 second generation time
- Perfect for testing and learning

### Maker Plan ($9.99/mo in KidCode Studio)
- **50 generations/month**
- High quality
- Priority queue
- Auto-rigging included

### Inventor Plan ($19.99/mo in KidCode Studio)
- **Unlimited generations**
- Ultra quality
- Fastest generation
- Commercial license

---

## 🔧 Troubleshooting

### Error: "Meshy API key not configured"
**Solution**: Make sure `.env.local` exists and contains your API key:
```env
VITE_MESHY_API_KEY=msy_your_key_here
```

### Error: "Generation failed"
**Possible causes**:
- API key is invalid
- You've used all free generations
- Network connection issue

**Solution**: Check your Meshy dashboard at https://www.meshy.ai/dashboard

### Generation is slow
**Normal generation time**: 30-90 seconds
- Text-to-3D: ~60 seconds
- Image-to-3D: ~90 seconds
- Auto-rigging: ~30 seconds

---

## 🎯 Best Practices

### Good Prompts:
✅ "A cute cartoon dragon with purple scales and green wings"
✅ "A medieval sword with glowing blue runes"
✅ "A treasure chest made of gold with ruby decorations"

### Bad Prompts:
❌ "dragon" (too vague)
❌ "something cool" (not descriptive)
❌ "car vehicle automobile" (redundant)

### Tips for Best Results:
1. **Be specific** - Include colors, materials, style
2. **Keep it simple** - One object per generation
3. **Use style keywords** - "cartoon", "realistic", "low poly"
4. **Specify materials** - "gold", "wood", "crystal"

---

## 📚 Additional Resources

- **Meshy Documentation**: https://docs.meshy.ai/
- **API Reference**: https://docs.meshy.ai/api
- **Example Gallery**: https://www.meshy.ai/explore
- **Discord Community**: https://discord.gg/meshy

---

## 🚀 Next Steps

Once you have Meshy working, you can also integrate:

1. **Luma Genie** - Faster generation (30 seconds)
2. **Tripo AI** - Cheaper alternative
3. **Microsoft TRELLIS** - Best quality (self-hosted)

See `.env.example` for all available API integrations!

---

## 💡 Pro Tips

### Save API Credits:
- Use **image-to-3D** for more control (upload your own drawing)
- Start with **standard quality** for testing
- Use **low poly style** for game-ready assets
- **Reuse models** from your library instead of regenerating

### Optimize for Games:
- Enable **"Optimize for Games"** in settings
- Use **auto-rigging** for characters
- Download as **GLB format** (best for web)
- Keep vertex count under **10,000** for mobile

---

**Need Help?** Join our Discord or check the FAQ at https://kidcode.studio/help

**Happy Creating!** 🎨✨
