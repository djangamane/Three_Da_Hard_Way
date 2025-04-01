# Scholar Trends Deployment Guide

This guide will walk you through deploying the Scholar Trends app to Render.com and linking it to your Durable website.

## Building for Web

Before deploying, you need to create a web build of your Expo app:

1. Install expo-cli globally if you haven't already:
   ```bash
   npm install -g expo-cli
   ```

2. Build the web version:
   ```bash
   npx expo export --platform web
   ```

3. The build output will be in the `dist/` directory.

## Deploying to Render.com

1. Go to [Render.com](https://render.com/) and sign up or log in.

2. Click on "New" in the top right and select "Static Site".

3. Connect your GitHub repository or upload your `dist/` directory directly.

4. Configure your static site with the following settings:
   - **Name**: scholar-trends (or your preferred name)
   - **Branch**: main (or your preferred branch)
   - **Build Command**: Leave blank if uploading directly, or use `npx expo export --platform web` if deploying from GitHub
   - **Publish Directory**: `dist`

5. Click "Create Static Site".

6. Your site will be available at a URL like `https://scholar-trends.onrender.com`.

## Adding Custom Domain (Optional)

1. In the Render dashboard, go to your static site settings.

2. Click on "Custom Domain".

3. Add your domain (e.g., `scholar-trends.yourdomain.com`) and follow the instructions to verify ownership.

## Linking from Your Durable Website

1. Log in to your Durable website builder.

2. Create a new page or section for Scholar Trends.

3. Add a button with text like "Try Scholar Trends App" that links to your Render.com URL.

4. To embed the app directly on your Durable page (optional):
   ```html
   <iframe 
     src="https://your-render-app-url.onrender.com" 
     width="100%" 
     height="600px" 
     style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
     title="Scholar Trends App">
   </iframe>
   ```

## Updating the App

Whenever you make changes to your app:

1. Rebuild the web version:
   ```bash
   npx expo export --platform web
   ```

2. If using direct upload on Render:
   - Go to your static site on Render
   - Click "Upload"
   - Select your new `dist/` directory

3. If using GitHub deployment:
   - Commit and push your changes
   - Render will automatically rebuild and deploy

## Manually Updating Email Content

To update the news items from your "State of White Supremacy Alerts" emails:

1. In the app, add an admin section or use the console to call:
   ```javascript
   import { useNewsStore } from '@/hooks/useNewsStore';
   
   // Your email content as a string
   const emailContent = `# Article Title
   
   [Read more](https://example.com/article)
   
   # Another Article Title
   ...`;
   
   const { fetchNewsFromEmail } = useNewsStore.getState();
   fetchNewsFromEmail(emailContent);
   ```

2. For a more permanent solution, consider building a serverless function that:
   - Connects to your email account via IMAP/POP3
   - Extracts the latest "State of White Supremacy Alerts" email
   - Parses the content
   - Stores it in a simple database or JSON file
   - Serves it via an API endpoint that your app can fetch from

## Future Enhancements

1. **Automated Email Processing**:
   - Set up a daily serverless function on Render to process emails automatically
   - Store extracted news items in a database

2. **User Authentication**:
   - Add user accounts to track which articles users have read

3. **Analytics Integration**:
   - Add Google Analytics or a similar tool to track usage and engagement 