# Discord-WhatsApp Bridge

A Node.js application that bridges messages between Discord channels and WhatsApp.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your credentials:
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token
   WHATSAPP_TARGET_NUMBER=your_whatsapp_number
   ```
4. Update the channel IDs in `config/config.js`
5. Run the application:
   ```bash
   npm start
   ```

## Features

- Forward messages from specific Discord channels to WhatsApp
- Maintains message context and author information
- Easy configuration through environment variables

## Requirements

- Node.js v16 or higher
- Discord Bot Token
- WhatsApp account