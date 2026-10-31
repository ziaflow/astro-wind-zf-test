# Email Configuration Guide

This project supports two email backends for the contact form:

## 1. Web3Forms (Default, Recommended for Quick Setup)

**Pros:**

- No server configuration needed
- Built-in spam protection
- Reliable delivery
- Free tier available

**Cons:**

- Requires third-party service
- Access key visible in client-side code

### Setup:

```env
EMAIL_BACKEND=web3forms
WEB3FORMS_ACCESS_KEY=your-key-here
```

Get your free access key at: https://web3forms.com

---

## 2. Nodemailer (Full Control)

**Pros:**

- Complete control over email delivery
- No third-party dependencies
- Custom SMTP server

**Cons:**

- Requires SMTP server configuration
- Need to manage credentials securely

### Setup:

```env
EMAIL_BACKEND=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ziaflow.com
SMTP_TO=info@ziaflow.com
```

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password in `SMTP_PASS`

**Other Providers:**

- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.region.amazonaws.com:587

---

## Testing

### Test with Web3Forms:

1. Set `EMAIL_BACKEND=web3forms` in `.env`
2. Add your Web3Forms access key
3. Run `npm run dev`
4. Fill out contact form
5. Check Web3Forms dashboard for submissions

### Test with Nodemailer:

1. Set `EMAIL_BACKEND=nodemailer` in `.env`
2. Configure SMTP credentials
3. Run `npm run dev`
4. Fill out contact form
5. Check your inbox at the `SMTP_TO` address

---

## Switching Between Backends

Simply change the `EMAIL_BACKEND` environment variable:

- `EMAIL_BACKEND=web3forms` → Uses Web3Forms API
- `EMAIL_BACKEND=nodemailer` → Uses your SMTP server

No code changes required!
