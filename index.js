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
  console.log('=== Webhook received ===');
  console.log('Events count:', req.body.events.length);
  console.log('Events:', JSON.stringify(req.body.events, null, 2));

  Promise.all(req.body.events.map(handleEvent))
    .then((results) => {
      console.log('Results:', JSON.stringify(results, null, 2));
      res.json(results);
    })
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
  console.log('--- handleEvent ---');
  console.log('Event type:', event.type);

  // Only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('Skipped: not a text message');
    return null;
  }

  const text = event.message.text.trim();
  console.log('Message text:', text);
  console.log('Prefix:', JSON.stringify(PREFIX));
  console.log('Starts with prefix:', text.startsWith(PREFIX));

  // Check if the message starts with the prefix
  if (!text.startsWith(PREFIX)) {
    console.log('Skipped: no prefix match');
    return null;
  }

  // Parse command and arguments
  const withoutPrefix = text.slice(PREFIX.length);
  const parts = withoutPrefix.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Look up the command handler
  console.log('Command:', commandName, '| Args:', args);
  const handler = commands[commandName];
  if (!handler) {
    console.log('Skipped: unknown command', commandName);
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
  console.log('Replying with:', JSON.stringify(replyMessage));
  try {
    const result = await client.replyMessage({
      replyToken: event.replyToken,
      messages: [replyMessage],
    });
    console.log('Reply SUCCESS');
    return result;
  } catch (replyErr) {
    console.error('Reply FAILED:', replyErr.message || replyErr);
    throw replyErr;
  }
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
