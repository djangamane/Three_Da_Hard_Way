# Scholar Insights Backend Server

A secure backend server for managing news data in the Scholar Insights application. This server provides administrative endpoints for managing news content and includes an automated email processor for extracting news from White Supremacy Alert emails.

## Features

- **Secure Admin API**: REST endpoints for managing news items, protected by JWT authentication
- **Automated Email Processing**: Background service that checks for new emails and extracts news items
- **Database Integration**: Stores all news items in MongoDB for persistence
- **Notification System**: Sends email notifications when new content is processed

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Email account for receiving White Supremacy Alert emails

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and update it with your settings:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your configuration details:
   - MongoDB connection string
   - JWT secret key
   - Email account credentials
   - Notification settings

### Running the Server

Start the admin API server:
```
npm start
```

Start the development server with auto-reload:
```
npm run dev
```

Run the email processor separately:
```
npm run email-processor
```

## Integrating with the Frontend

To connect your React Native app with the backend API:

1. Set the API URL in your app's environment:
   - For development, create or edit `.env.local` in your app root
   - Add: `EXPO_PUBLIC_API_URL=http://your-server-ip:5000/api`
   - For production, use your deployed server URL

2. Update your `app.config.js` to load the environment variable:
   ```js
   module.exports = {
     expo: {
       // ... other config
       extra: {
         apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
       }
     }
   };
   ```

3. The app's `useNewsStore` hook is already configured to fetch data from the API using `fetchNewsFromApi()`. This function:
   - Attempts to load news from the server
   - Falls back to sample data if the API is unavailable
   - Formats the data according to the app's expected structure

4. For local testing:
   - Run both the backend server and React Native app
   - Use localhost (or 10.0.2.2 for Android emulator)
   - Make sure your firewall allows connections to the server port

## API Endpoints

### Authentication

- `POST /api/login`: Authenticate admin user and receive JWT token

### News Management

- `GET /api/news`: Get all news items
- `POST /api/news`: Create a new news item (admin only)
- `PUT /api/news/:id`: Update a news item (admin only)
- `DELETE /api/news/:id`: Delete a news item (admin only)

### Email Processing

- `POST /api/news/process-email`: Manually process email content (admin only)

## Email Processor

The email processor runs on a schedule and:

1. Connects to the configured email account
2. Searches for unread emails with "White Supremacy Alert" in the subject
3. Extracts news items using the parsing logic
4. Saves them to the database
5. Marks the emails as read
6. Sends a notification to the admin

## Security Considerations

- Use HTTPS in production
- Set a strong JWT secret
- Use app-specific passwords for email accounts
- Restrict CORS origins to your frontend domain
- Deploy on a secure server with firewall rules

## Production Deployment

For production deployment, consider using:

- PM2 process manager for running the server
- NGINX as a reverse proxy
- Let's Encrypt for SSL certificates
- MongoDB Atlas for database hosting
- Scheduled backups for your database

## License

ISC 