# MindStudio Dashboard - Production Ready

A production-ready React dashboard integrating with MindStudio AI agents. Features 5 live AI agents with real-time data processing, responsive design, and comprehensive error handling.

## 🚀 Features

### Live AI Agents
- **News Search** - Real-time article search with images and summaries
- **People Extraction** - Extract people data from URLs with photos and details
- **Content Analysis** - AI-powered text analysis and insights
- **Market Research** - Company analysis and competitive research
- **Email Assistant** - AI email generation and assistance

### Technical Features
- React 18 + Vite + Tailwind CSS
- Live MindStudio API v2 integration
- Advanced CSV parsing with quote-aware logic
- Responsive design (mobile-first)
- Real-time error handling and loading states
- Request deduplication and abort control

## 🛠️ Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/lekkerit/mindstudio-dashboard-prd.git
   cd mindstudio-dashboard-prd
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your MindStudio API credentials:
   ```env
   VITE_MS_API_KEY=your-mindstudio-api-key
   VITE_APP_ID_NEWS=your-news-agent-app-id
   VITE_APP_ID_PEOPLE=your-people-extraction-app-id
   # ... other agent IDs
   ```

3. **Development**
   ```bash
   npm run dev    # Start development server
   npm run build  # Build for production
   ```

## 📋 Agent Configuration

Each agent uses `webhookParams` for input:
- **News Search**: `webhookParams.keyword`
- **Extract People**: `webhookParams.url`
- **Content Analysis**: `webhookParams.text`
- **Market Research**: `webhookParams.company`
- **Email Assistant**: `webhookParams.context`

## 🏗️ Architecture

Built as a single-page application with:
- **Frontend**: React 18 with functional components
- **Styling**: Tailwind CSS v4 with custom design system
- **Build**: Vite for fast development and optimized builds
- **API**: Direct MindStudio API v2 integration
- **State**: Component-level state with custom hooks

## 📖 Documentation

See `CLAUDE.md` for comprehensive development documentation, architecture patterns, and maintenance guidelines.

## 🎯 Production Status

✅ **Ready for Production**
- Live API integration tested
- Mobile-responsive design
- Comprehensive error handling
- Performance optimized
- Well documented
