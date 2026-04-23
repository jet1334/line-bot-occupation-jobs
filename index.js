require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const commands = require('./commands');

// ─── Config ─────────────────────────────────────────────────────────
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const PREFIX = process.env.BOT_PREFIX || '!';
const PORT = process.env.PORT || 3000;

// ─── LINE Client ────────────────────────────────────────────────────
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

// ─── Express App ────────────────────────────────────────────────────
const app = express();

// Webhook endpoint — LINE SDK middleware validates signatures
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((results) => res.json(results))
    .catch((err) => {
      console.error('Error handling events:', err);
      res.status(500).end();
    });
});

// Health check
app.get('/', (_req, res) => {
  res.send('LINE Bot is running 🤖');
});

// ─── Event Handler ──────────────────────────────────────────────────
async function handleEvent(event) {
  // Only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const text = event.message.text.trim();

  // Check if the message starts with the prefix
  if (!text.startsWith(PREFIX)) {
    return null;
  }

  // Parse command and arguments
  const withoutPrefix = text.slice(PREFIX.length);
  const parts = withoutPrefix.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Look up the command handler
  const handler = commands[commandName];
  if (!handler) {
    return null; // Unknown command — silently ignore
  }

  // Build context object for the handler
  const context = {
    prefix: PREFIX,
    commands,
    event,
    source: event.source,
  };

  // Execute handler
  let reply;
  try {
    reply = await handler(args, context);
  } catch (err) {
    console.error(`Error in command "${commandName}":`, err);
    reply = '⚠️ An error occurred while processing the command.';
  }

  // Normalize reply to LINE message format
  const replyMessage =
    typeof reply === 'string' ? { type: 'text', text: reply } : reply;

  // Send reply
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [replyMessage],
  });
}

// ─── Start Server ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🤖 LINE Bot is running!               ║
║   📍 Port     : ${String(PORT).padEnd(23)}║
║   🔤 Prefix   : ${PREFIX.padEnd(23)}║
║   📦 Commands : ${String(Object.keys(commands).length).padEnd(23)}║
╚══════════════════════════════════════════╝
  `);
});
