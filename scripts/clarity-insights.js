import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file directly since we are in a standalone script
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach((line) => {
    // Basic .env parsing
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
}

const CLARITY_TOKEN = process.env.CLARITY_API_TOKEN;

if (!CLARITY_TOKEN) {
  console.error('Error: CLARITY_API_TOKEN not found in environment variables.');
  console.log('Please ensure CLARITY_API_TOKEN is set in your .env file.');
  process.exit(1);
}

const sendEmail = async (content) => {
  if (!process.env.SMTP_HOST) {
    console.log('Skipping email report: SMTP_HOST not set in .env');
    return;
  }

  console.log('Sending email report...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ziaflow.com',
      to: process.env.SMTP_TO || 'info@ziaflow.com',
      subject: 'Daily Clarity Insights Report',
      text: content,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

const fetchInsights = async () => {
  console.log('Fetching Clarity Insights...');
  const url = 'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1&dimension1=URL&dimension2=Source';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLARITY_TOKEN}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
         console.error('Error: Unauthorized. Check your CLARITY_API_TOKEN.');
      }
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully retrieved data.');
    
    const summary = `Clarity Insights Data (Last 24h):\n${JSON.stringify(data, null, 2)}`;
    console.log(summary);
    
    await sendEmail(summary);
    
  } catch (error) {
    console.error('Failed to fetch Clarity insights:', error);
    process.exit(1);
  }
};

fetchInsights();
