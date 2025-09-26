# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (hot reload enabled)
npm run build    # Create production build in dist/
npm run preview  # Preview production build locally
```

## Project Architecture

### Core Technology Stack
- **Frontend Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite (fast development server and optimized builds)
- **Styling**: Tailwind CSS v4 with custom design system
- **API Integration**: MindStudio API v2 for AI agent functionality

### Environment Configuration
The app uses environment variables prefixed with `VITE_` to expose values to the frontend:

```
VITE_MS_API_KEY=<your-mindstudio-api-key>
VITE_APP_ID_NEWS=<news-agent-app-id>
VITE_APP_ID_PEOPLE=<people-extraction-app-id>
VITE_WORKFLOW_NAME_NEWS=news
VITE_WORKFLOW_NAME_PEOPLE=extract_people
VITE_MS_API_BASE=https://api.mindstudio.ai/developer/v2/apps/run
```

**Important**: Restart the dev server after changing environment variables.

### Application Structure

#### Single-File Architecture
The entire application is contained in `src/App.jsx` with the following component hierarchy:

```
App (Main container)
├── ErrorBoundary (Error handling wrapper)
├── NewsTile (News search functionality)
├── PeopleTile (People extraction functionality)
├── ContentAnalysisTile (Text analysis)
├── MarketResearchTile (Company research)
└── EmailAssistantTile (Email generation)
```

#### State Management Pattern
Each agent tile follows the same state management pattern:
- **Input state**: User input values
- **Loading state**: API request status
- **Results state**: Processed API responses
- **Error state**: Error messages and handling
- **UI state**: Focus, hover, and interaction states

#### API Integration Architecture
The `useAgentRunner` hook provides:
- **Request deduplication**: Prevents multiple simultaneous requests
- **Abort control**: Cancels previous requests when new ones are made
- **Error handling**: Standardized error processing
- **Loading management**: Tracks request lifecycle

### MindStudio API Integration

#### Request Structure
All agent requests use this format:
```javascript
{
  appId: "agent-specific-id",
  workflow: "workflow-name",
  variables: { webhookParams: { ...inputs } },
  includeBillingCost: true
}
```

#### Response Processing Strategy
The app handles multiple response formats from MindStudio:
1. **Direct arrays**: `result.people`, `result.news`, etc.
2. **Nested results**: `result.thread.result`
3. **CSV strings**: Parsed using custom CSV parser
4. **Generic objects**: Converted to single-item arrays

#### Error Recovery
- Network errors show user-friendly messages
- API errors display specific error content
- Missing configuration shows setup instructions
- Failed parsing attempts fallback strategies

### Design System

#### Responsive Grid Layout
- **Mobile**: Single column grid
- **Tablet**: Two column grid (768px+)
- **Desktop**: Three column grid (1200px+)

#### Component Styling Strategy
Uses object-based styles with:
- **Base styles**: Default appearance
- **Interactive states**: Hover, focus, disabled
- **Responsive breakpoints**: Adaptive layouts
- **Animation system**: Smooth transitions

### Key Development Patterns

#### Agent Tile Pattern
Each agent tile implements:
1. **Input validation**: Real-time validation with visual feedback
2. **API integration**: Standardized request/response handling
3. **Result display**: Formatted output with interactive elements
4. **Error boundaries**: Graceful failure handling

#### Debugging Strategy
Console logging uses emoji prefixes for easy filtering:
- 🔍 Raw API responses
- 📊 Processed results
- 👥 People extraction data
- 📰 News search results
- ❌ Error conditions

### Common Maintenance Tasks

#### Adding New Agent Tiles
1. Create component following the established pattern
2. Add environment variables for app ID and workflow
3. Implement response parsing for expected data format
4. Add component to main grid in App component
5. Test with actual MindStudio API responses

#### Debugging API Issues
1. Check browser console for emoji-prefixed debug logs
2. Verify environment variables are loaded (restart dev server)
3. Test API endpoints directly in MindStudio dashboard
4. Validate response format matches parsing logic

#### UI Enhancement Guidelines
- Follow existing interactive state patterns
- Use established color palette and spacing
- Maintain responsive design across breakpoints
- Test hover/focus states on all interactive elements