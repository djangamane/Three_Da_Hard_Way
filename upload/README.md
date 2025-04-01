# News Data Upload Guide

## Current Implementation

The app currently feeds news stories using two methods:

1. **Sample Email Content**: Default method that loads predefined news data from the `getSampleEmailContent` function in `services/NewsEmailExtractor.ts`.

2. **RSS Feed Simulation**: A mock implementation in `services/RssService.ts` that returns predefined news items.

3. **Backend API Integration**: The app now attempts to fetch news items from the backend API first, falling back to sample data if the API is unavailable.

## Backend Implementation Options

Instead of exposing upload functionality to users directly, we've implemented the following backend approaches:

### Option 1: Admin Dashboard (Implemented)

A secure admin-only dashboard accessible through the settings page:
- Allows administrators to manually enter email content for processing
- Processes email content using the existing extraction logic
- Updates the app's news feed with the extracted content
- Provides clear feedback on the processing status

### Option 2: Email Forwarding Service (Implemented)

The backend includes an email forwarding system that:
- Connects to a designated email address (configured in .env)
- Automatically processes incoming White Supremacy Alert emails
- Updates the MongoDB database with extracted news items
- Sends confirmation notifications to admins
- Runs on a configurable schedule

### Option 3: API Integration (Implemented)

The server provides REST endpoints for:
- Fetching all news items (`GET /api/news`)
- Creating new news items (`POST /api/news`)
- Updating existing items (`PUT /api/news/:id`)
- Deleting items (`DELETE /api/news/:id`)
- Processing email content (`POST /api/news/process-email`)

## Current Deployment Setup

1. The frontend app communicates with the backend through the `fetchNewsFromApi` function in `hooks/useNewsStore.ts`
2. The server authenticates admin users with JWT tokens
3. News data is persisted in MongoDB for reliability
4. The email processor runs as a background service to keep news fresh

## Next Steps

1. Deploy the backend server to a secure hosting environment
2. Set up MongoDB Atlas for cloud database hosting
3. Configure the email account for production use
4. Set the `EXPO_PUBLIC_API_URL` environment variable in your app to point to the deployed server

For more information on the backend implementation, see the detailed instructions in `server/README.md`.

## Implementation Timeline

1. Admin dashboard (highest priority)
2. Email forwarding service (second phase)
3. Headless CMS integration (long-term solution)

## Current Data Flow

For now, you can modify the `getSampleEmailContent` function in `services/NewsEmailExtractor.ts` to add or update news items. The parser extracts:
- Headlines
- Severity scores
- URLs
- Content

The app categorizes news based on keyword matching in the `categorizeHeadline` function. 