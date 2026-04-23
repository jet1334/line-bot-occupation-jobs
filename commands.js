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
 * or a LINE message object for rich messages (image, sticker, etc.)
 *
 * ═══════════════════════════════════════════════════════════════
 *  วิธีเพิ่ม Command ใหม่:
 *
 *  1. ตอบกลับข้อความ:
 *     ชื่อcommand: () => 'ข้อความที่ต้องการตอบ',
 *
 *  2. ส่งรูปภาพ:
 *     ชื่อcommand: () => ({
 *       type: 'image',
 *       originalContentUrl: 'URL รูปเต็ม (HTTPS เท่านั้น)',
 *       previewImageUrl: 'URL รูป preview (HTTPS เท่านั้น)',
 *     }),
 *
 *  3. ส่งหลายข้อความ (ใช้ array):
 *     → ดูตัวอย่าง command "เมนู" ด้านล่าง
 *
 *  หมายเหตุ: URL รูปต้องเป็น HTTPS และเข้าถึงได้สาธารณะ
 * ═══════════════════════════════════════════════════════════════
 */

const commands = {
  // ─── System Commands ──────────────────────────────────────────

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

  // ─── Custom Commands (เพิ่ม command ของคุณด้านล่างนี้!) ─────

  /**
   * !หมอ → ส่งรูปหมอกลับไป
   * เปลี่ยน URL เป็นรูปที่ต้องการ (ต้องเป็น HTTPS)
   */
  หมอ: () => ({
    type: 'image',
    originalContentUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Doctors_stethoscope_2.jpg/800px-Doctors_stethoscope_2.jpg',
    previewImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Doctors_stethoscope_2.jpg/240px-Doctors_stethoscope_2.jpg',
  }),

  /**
   * !สวัสดี → ตอบกลับข้อความ
   */
  สวัสดี: () => 'สวัสดีครับ! 👋 มีอะไรให้ช่วยไหม?',

  // ─── ตัวอย่างเพิ่มเติม (ลบ comment ออกเพื่อเปิดใช้งาน) ────

  // /**
  //  * !เมนู → ส่งรูปเมนูอาหาร
  //  */
  // เมนู: () => ({
  //   type: 'image',
  //   originalContentUrl: 'https://example.com/menu-full.jpg',
  //   previewImageUrl: 'https://example.com/menu-preview.jpg',
  // }),

  // /**
  //  * !ราคา → ตอบกลับข้อความราคา
  //  */
  // ราคา: () => '💰 ราคาสินค้า:\n• สินค้า A - 100 บาท\n• สินค้า B - 200 บาท\n• สินค้า C - 300 บาท',

  // /**
  //  * !sticker → ส่ง sticker
  //  */
  // sticker: () => ({
  //   type: 'sticker',
  //   packageId: '446',
  //   stickerId: '1988',
  // }),
};

module.exports = commands;
