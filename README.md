<div align="center">
<img width="1200" height="475" alt="KidCode Studio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KidCode Studio

KidCode Studio is an educational platform that allows children (ages 8-12) to learn programming through visual block-based coding. The platform offers three distinct modes:

- 🎮 **Game Maker**: Create interactive video games with sprites, physics, and sound
- 📱 **App Builder**: Build mobile applications with drag-and-drop UI components
- ⚡ **Circuit Lab**: Design and simulate electronic circuits with various components

## Features

- **Visual Block Programming**: Intuitive drag-and-drop interface for coding
- **AI Integration**: Built-in AI tutor that helps with coding concepts
- **Three Coding Modes**: Game development, app building, and electronics
- **Real-time Preview**: See your creations come to life instantly
- **Progressive Learning**: Missions and challenges to guide learning
- **Creative Tools**: Sprite designer, sound editor, and pixel art editor

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kidcode-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory with your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   To get an API key:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an account or sign in
   - Create a new API key
   - Copy and paste it into your `.env.local` file

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Navigate to `http://localhost:5173` to start using KidCode Studio

## Building for Production

To create a production build of the application:

```bash
npm run build
```

The build files will be created in the `dist` directory.

## Project Structure

```
kidcode-studio/
├── components/          # React UI components
├── services/            # Business logic and API services
├── src/                 # Main source files
├── public/              # Static assets
├── types.ts             # Type definitions
├── constants.ts         # App constants and configurations
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── ...
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key for AI features

## API Integration

The application uses Google's Generative AI API for:
- Code generation based on natural language prompts
- AI-powered coding assistance
- Sprite image generation

## Deployment

The application is ready for deployment to platforms like Vercel, Netlify, or any Node.js hosting service.

For Vercel deployment:
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on pushes to main branch

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.
