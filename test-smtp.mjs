import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('=== SMTP Test Script ===\n');

console.log('Environment Variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('SMTP_FROM:', process.env.SMTP_FROM || 'NOT SET');
console.log('SMTP_TO:', process.env.SMTP_TO || 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ SET (hidden)' : 'NOT SET');
console.log('\n--- Creating Transporter ---\n');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
});

console.log('--- Sending Test Email ---\n');

try {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_TO,
    subject: 'SMTP Test Email',
    text: 'This is a test email from the SMTP diagnostic script.',
    html: '<p>This is a test email from the SMTP diagnostic script.</p>',
  });

  console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
} catch (error) {
  console.error('\n❌ EMAIL SEND FAILED!');
  console.error('Error:', error.message);
  console.error('\nFull error details:');
  console.error(error);
}
