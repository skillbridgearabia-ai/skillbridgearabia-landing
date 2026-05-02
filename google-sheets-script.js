// SkillBridge Arabia — Google Apps Script v3
// Handles all form submissions from company profile + investor page
// Saves to Google Sheet + sends auto-reply + notifies founder
// Investor submissions automatically receive access credentials in their email
//
// HOW TO DEPLOY:
// 1. Go to script.google.com
// 2. Open your existing SkillBridge Arabia project (or create new)
// 3. Select all → delete → paste this entire file
// 4. Click Save
// 5. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the deployment URL
// 7. Paste it in Render environment variable: GOOGLE_SCRIPT_URL

const FOUNDER_EMAIL  = 'elias.hashem.eh@gmail.com';
const SHEET_NAME     = 'Submissions';
const INVESTOR_PASS  = 'investor2026';
const INVESTOR_USER  = 'skillbridge';
const PLATFORM_URL   = 'https://app.skillbridgearabia.com';
const INVESTOR_URL   = 'https://skillbridgearabia.com/investor';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    saveToSheet(data);
    sendAutoReply(data);
    notifyFounder(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'SkillBridge Arabia script running v3' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Save to Google Sheet ───────────────────────────────────────────────────
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Phone',
      'Organisation', 'Role', 'Message', 'Source', 'Date (Riyadh)'
    ]);
    sheet.getRange(1,1,1,9)
      .setBackground('#B78A2A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.name     || '',
    data.email    || '',
    data.phone    || '',
    data.company  || data.organisation || '',
    data.role     || '',
    data.message  || '',
    data.source   || 'website',
    Utilities.formatDate(new Date(), 'Asia/Riyadh', 'dd MMM yyyy HH:mm')
  ]);
}

// ── Detect if submission is investor-related ───────────────────────────────
function isInvestorSubmission(data) {
  const source = (data.source || '').toLowerCase();
  const role   = (data.role   || '').toLowerCase();
  return source.includes('investor') || role.includes('investor');
}

// ── Send auto-reply ────────────────────────────────────────────────────────
function sendAutoReply(data) {
  if (!data.email) return;

  const firstName = data.name ? data.name.split(' ')[0] : 'there';
  const isInvestor = isInvestorSubmission(data);

  const subject = isInvestor
    ? 'Your SkillBridge Arabia investor access — credentials inside'
    : 'We received your message — SkillBridge Arabia';

  const credentialsSection = isInvestor ? `
    <div style="margin:24px 0;padding:22px 24px;background:#FBF5E6;border:1px solid #D4B860;border-left:4px solid #B78A2A;border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#8C6315;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Your Investor Access Credentials</div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 12px;background:#fff;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830;width:40%">Username</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #D4B860;font-size:14px;font-weight:700;color:#B78A2A;font-family:monospace">${INVESTOR_USER}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#F3F0E8;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830">Password</td>
          <td style="padding:8px 12px;background:#F3F0E8;border:1px solid #D4B860;font-size:14px;font-weight:700;color:#B78A2A;font-family:monospace">${INVESTOR_PASS}</td>
        </tr>
      </table>
      <div style="margin-top:14px;font-size:12px;color:#6B6560;line-height:1.6">
        Visit <a href="${INVESTOR_URL}" style="color:#B78A2A;font-weight:600">${INVESTOR_URL}</a> and enter these credentials to access the full investor deck including financial projections, market analysis and the investment ask.
      </div>
    </div>
  ` : '';

  const body = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#F5F2EC;margin:0;padding:0}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}
  .hdr{background:#1C1C1A;padding:28px 32px 22px}
  .hdr-logo{font-size:20px;color:#fff;font-weight:600;font-family:Georgia,serif}
  .hdr-logo em{color:#D4B860;font-style:italic}
  .hdr-tag{font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.15em;text-transform:uppercase;margin-top:5px}
  .gold-bar{height:4px;background:#B78A2A}
  .body{padding:32px}
  .body h2{font-size:20px;color:#1A1714;margin-bottom:10px;font-weight:600;font-family:Georgia,serif}
  .body p{font-size:14px;color:#3D3830;line-height:1.8;margin-bottom:13px}
  .cta{display:inline-block;margin:6px 0 14px;padding:11px 26px;background:#B78A2A;color:#fff;border-radius:7px;font-size:13px;font-weight:600;text-decoration:none}
  .footer{padding:18px 32px;background:#F5F2EC;border-top:1px solid #EAE6DC;font-size:11px;color:#A09890}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="hdr-logo">Skill<em>Bridge</em> Arabia</div>
    <div class="hdr-tag">From Origin to Excellence</div>
  </div>
  <div class="gold-bar"></div>
  <div class="body">
    <h2>Hello ${firstName},</h2>
    ${isInvestor ? `
    <p>Thank you for your interest in SkillBridge Arabia. We are excited to share our investor materials with you.</p>
    <p>SkillBridge Arabia is building the GCC's most skilled frontline workforce — certifying expat F&B workers before they arrive in Saudi Arabia. Our seed round of <strong>SAR 375,000 for 15% equity</strong> is currently open.</p>
    ${credentialsSection}
    <p>We are also happy to arrange a call to walk you through the model and answer any questions. Simply reply to this email to schedule a time.</p>
    ` : `
    <p>Thank you for reaching out to SkillBridge Arabia. We have received your message and will respond within <strong>24 hours</strong>.</p>
    <p>In the meantime, you are welcome to explore the live platform.</p>
    `}
    <a href="${PLATFORM_URL}" class="cta">Try the live platform →</a>
    <p style="font-size:12px;color:#A09890">Questions? Reply to this email or contact us at hello@skillbridgearabia.com</p>
  </div>
  <div class="footer">
    © 2026 SkillBridge Arabia &nbsp;·&nbsp; Riyadh, Saudi Arabia &nbsp;·&nbsp; Vision 2030 Aligned &nbsp;·&nbsp; Confidential
  </div>
</div>
</body>
</html>`.trim();

  GmailApp.sendEmail(data.email, subject, '', {
    htmlBody: body,
    name: 'SkillBridge Arabia',
    replyTo: FOUNDER_EMAIL
  });
}

// ── Notify founder ─────────────────────────────────────────────────────────
function notifyFounder(data) {
  const isInvestor = isInvestorSubmission(data);
  const source  = data.source || 'website';
  const prefix  = isInvestor ? '🎯 INVESTOR' : '📩 New enquiry';
  const subject = `${prefix}: ${data.name || 'Unknown'} (${data.role || 'no role'}) — ${source}`;

  const body = `
${isInvestor ? '🎯 INVESTOR ENQUIRY — Credentials have been sent automatically' : 'New contact form submission'}

NAME:         ${data.name || ''}
EMAIL:        ${data.email || ''}
PHONE:        ${data.phone || 'Not provided'}
ORGANISATION: ${data.company || data.organisation || 'Not provided'}
ROLE:         ${data.role || 'Not selected'}
SOURCE:       ${source}
TIME:         ${Utilities.formatDate(new Date(), 'Asia/Riyadh', 'dd MMM yyyy HH:mm')} (Riyadh)

MESSAGE:
${data.message || '(no message)'}

${isInvestor ? `---
Credentials sent to ${data.email}:
Username: ${INVESTOR_USER}
Password: ${INVESTOR_PASS}
` : '---'}
View all submissions: Check your Google Sheet
`.trim();

  GmailApp.sendEmail(FOUNDER_EMAIL, subject, body, {
    name: 'SkillBridge Arabia Forms'
  });
}
