/**
 * Command Definitions
 *
 * Each key is a command name (matched after the prefix).
 * Each value is a handler function: (args, context) => string | object
 *
 * - args:    string[] — the words after the command name
 * - context: { prefix, commands, event, source }
 *
 * Return a string for a simple text reply,
 * or a LINE message object for rich messages.
 *
 * Example:  If prefix is "!" and user sends "!echo hello world"
 *           -> command = "echo", args = ["hello", "world"]
 */

const commands = {
  /**
   * Simple ping/pong to check if the bot is alive.
   */
  ping: () => 'pong 🏓',

  /**
   * Lists all available commands.
   */
  help: (_args, { prefix, commands: cmds }) => {
    const list = Object.keys(cmds)
      .map((cmd) => `${prefix}${cmd}`)
      .join('\n• ');
    return `📋 Available commands:\n• ${list}`;
  },

  /**
   * Echoes back whatever the user typed after the command.
   */
  echo: (args) => {
    const text = args.join(' ');
    return text || '🤔 Nothing to echo! Usage: echo <message>';
  },

  /**
   * Shows info about the current chat source.
   */
  info: (_args, { event }) => {
    const src = event.source;
    const type = src.type; // "user" | "group" | "room"
    const id =
      type === 'group'
        ? src.groupId
        : type === 'room'
          ? src.roomId
          : src.userId;
    return `ℹ️ Chat type: ${type}\n🆔 ID: ${id}`;
  },
};

module.exports = commands;
