# Scholar Trends (SLIM) - State of White Supremacy Analysis App

A mobile and web application that provides scholar insights on current news related to white supremacy, MAGA, and systemic racism through the lens of three scholars: Dr. Frances Cress Welsing, Dr. Amos Wilson, and Dr. Ishakamusa Barashango (Scholars as Leaders for the Individual Movement - SLIM).

## Features

- **News Feed**: Display news articles extracted from "State of White Supremacy Alerts" emails
- **Scholar Analysis**: AI-generated insights based on the works of Black scholars
- **Email Integration**: Manual updates of news content from email content
- **Category Filtering**: View articles by categories (White Supremacy, MAGA, Systemic Racism)
- **Interactive UI**: Modern, responsive interface for both mobile and web platforms

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **UI**: Custom components with Linear Gradients
- **API Integration**: OpenAI for scholar analysis
- **Data Extraction**: Custom email parsing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd scholar-trends
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Choose your platform:
   - Press `w` to open in web
   - Press `a` for Android
   - Press `i` for iOS

## Updating News Content

The app provides an admin interface to update news content from your "State of White Supremacy Alerts" emails:

1. Navigate to Settings > Admin Tools
2. Select "Update News from Email"
3. Paste your email content into the text area
4. Click "Process Email"

## Building for Web Deployment

To build the web version for deployment to Render.com:

```bash
npm run deploy:render
```

This will create a static build in the `dist/` directory that can be uploaded to Render.com or any static hosting service.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
scholar-trends/
├── app/                  # Main application screens
│   ├── (tabs)/           # Tab-based screens
│   ├── news-detail.tsx   # News article detail screen
│   └── admin-tools.tsx   # Admin tools for updating content
├── assets/               # Images and static assets
├── components/           # Reusable UI components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── services/             # API and utility services
└── scripts/              # Helper scripts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About SLIM

Scholars as Leaders for the Individual Movement (SLIM) is an initiative that aims to bring the insights of revolutionary Black scholars to contemporary issues. The system uses AI to generate perspectives based on the collected works and ideologies of these scholars, providing a unique lens through which to view current events.

## Author

Your Name - [Your Website or Contact Information]

# Scholar Analysis Application - Production Deployment Guide

## Overview
This application features scholar analysis powered by OpenAI's API. For production deployments, a valid OpenAI API key is required.

## Setting Up Your OpenAI API Key

### 1. Obtain an OpenAI API Key
If you don't already have an API key:
1. Create an account at [OpenAI](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new secret key
4. Copy the key (you won't be able to see it again)

### 2. Configure the Environment Variable

#### For Development:
Create a `.env` file in the root directory with:
```
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

#### For Production Deployment:

##### Expo/EAS Build:
Set the environment variable in your EAS build configuration:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

##### Vercel Deployment:
Add the environment variable in your Vercel project settings:
1. Navigate to your project
2. Go to Settings > Environment Variables
3. Add `EXPO_PUBLIC_OPENAI_API_KEY` with your API key value

##### Netlify Deployment:
Add the environment variable in your Netlify site settings:
1. Navigate to your site
2. Go to Site settings > Build & deploy > Environment
3. Add `EXPO_PUBLIC_OPENAI_API_KEY` with your API key value

## Important Notes:
- NEVER commit your API key to the repository
- For web deployments, be aware that the key will be visible in the client-side code. Consider implementing a backend proxy to secure your API key
- Monitor your OpenAI usage to control costs

## Troubleshooting Common Issues

### "OpenAI API key format appears invalid or not set in environment variables!"
This error indicates that the application cannot find a valid API key. Make sure:
1. The environment variable is properly set
2. The key starts with "sk-" and is the correct length
3. The application is properly loading the environment variable

### "Failed to initialize OpenAI model"
This could indicate an issue with your API key or the OpenAI service:
1. Verify your API key is valid
2. Check OpenAI service status
3. Ensure your account has sufficient quota/credits

## Support
For additional help, please contact the development team. 