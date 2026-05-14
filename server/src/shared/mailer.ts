import nodemailer from 'nodemailer';
import { config } from '../../config';

export async function sendInquiryNotification(inquiry: {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  message: string;
}) {
  const { host, user, pass, notifyEmail } = config.email;

  if (!host || !user || !pass || !notifyEmail) {
    console.log(`📨 NEW INQUIRY from ${inquiry.name} <${inquiry.email}> — ${inquiry.message.slice(0, 80)}...`);
    console.log('   (Configure SMTP in .env for email notifications)');
    return;
  }

  const subject = `[STARK] New Inquiry from ${inquiry.name}`;
  const html = `
    <h2>New Inquiry Received</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0;width:120px">Name</td><td style="padding:8px 12px;border:1px solid #ddd">${inquiry.name}</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0">Email</td><td style="padding:8px 12px;border:1px solid #ddd">${inquiry.email}</td></tr>
      ${inquiry.phone ? `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0">Phone</td><td style="padding:8px 12px;border:1px solid #ddd">${inquiry.phone}</td></tr>` : ''}
      ${inquiry.country ? `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0">Country</td><td style="padding:8px 12px;border:1px solid #ddd">${inquiry.country}</td></tr>` : ''}
      ${inquiry.company ? `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0">Company</td><td style="padding:8px 12px;border:1px solid #ddd">${inquiry.company}</td></tr>` : ''}
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap;max-width:600px">${inquiry.message}</p>
    <hr style="max-width:600px;margin-left:0"/>
    <p style="color:#888;font-size:12px">This is an automated notification from STARK website.</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: config.email.port,
      secure: config.email.port === 465, // SSL for port 465, STARTTLS for 587
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: user,
      to: config.email.notifyEmail,
      subject,
      html,
    });
    console.log(`📧 Inquiry notification sent to ${config.email.notifyEmail}`);
  } catch (err) {
    console.error('Failed to send email:', (err as Error).message);
  }
}
