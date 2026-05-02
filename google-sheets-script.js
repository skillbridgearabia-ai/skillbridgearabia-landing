// SkillBridge Arabia — Google Apps Script v4
// Fixed: replaced nested template literals with string concatenation
// Compatible with Google Apps Script Rhino engine

const FOUNDER_EMAIL = 'elias.hashem.eh@gmail.com';
const SHEET_NAME    = 'Submissions';
const INVESTOR_PASS = 'investor2026';
const INVESTOR_USER = 'skillbridge';
const PLATFORM_URL  = 'https://app.skillbridgearabia.com';
const INVESTOR_URL  = 'https://skillbridgearabia.com/investor';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
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
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'SkillBridge Arabia script running v4' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Save to Google Sheet ───────────────────────────────────────────────────
function saveToSheet(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Phone',
      'Organisation', 'Role', 'Message', 'Source', 'Date (Riyadh)'
    ]);
    sheet.getRange(1, 1, 1, 9)
      .setBackground('#B78A2A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.name         || '',
    data.email        || '',
    data.phone        || '',
    data.company      || data.organisation || '',
    data.role         || '',
    data.message      || '',
    data.source       || 'website',
    Utilities.formatDate(new Date(), 'Asia/Riyadh', 'dd MMM yyyy HH:mm')
  ]);
}

// ── Detect investor submission ─────────────────────────────────────────────
function isInvestorSubmission(data) {
  var source = (data.source || '').toLowerCase();
  var role   = (data.role   || '').toLowerCase();
  return source.indexOf('investor') !== -1 || role.indexOf('investor') !== -1;
}

// ── Send auto-reply ────────────────────────────────────────────────────────
function sendAutoReply(data) {
  if (!data.email) return;

  var firstName  = data.name ? data.name.split(' ')[0] : 'there';
  var isInvestor = isInvestorSubmission(data);

  var subject = isInvestor
    ? 'Your SkillBridge Arabia investor access — credentials inside'
    : 'We received your message — SkillBridge Arabia';

  // Build credentials block separately using concatenation (no nested template literals)
  var credentialsBlock = '';
  if (isInvestor) {
    credentialsBlock =
      '<div style="margin:24px 0;padding:22px 24px;background:#FBF5E6;border:1px solid #D4B860;border-left:4px solid #B78A2A;border-radius:8px">' +
        '<div style="font-size:12px;font-weight:700;color:#8C6315;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Your Investor Access Credentials</div>' +
        '<table style="width:100%;border-collapse:collapse">' +
          '<tr>' +
            '<td style="padding:8px 12px;background:#fff;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830;width:40%">Username</td>' +
            '<td style="padding:8px 12px;background:#fff;border:1px solid #D4B860;font-size:14px;font-weight:700;color:#B78A2A;font-family:monospace">' + INVESTOR_USER + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td style="padding:8px 12px;background:#F3F0E8;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830">Password</td>' +
            '<td style="padding:8px 12px;background:#F3F0E8;border:1px solid #D4B860;font-size:14px;font-weight:700;color:#B78A2A;font-family:monospace">' + INVESTOR_PASS + '</td>' +
          '</tr>' +
        '</table>' +
        '<div style="margin-top:14px;font-size:12px;color:#6B6560;line-height:1.6">' +
          'Visit <a href="' + INVESTOR_URL + '" style="color:#B78A2A;font-weight:600">' + INVESTOR_URL + '</a> ' +
          'and enter these credentials to access the full investor deck including financial projections, market analysis and the investment ask.' +
        '</div>' +
      '</div>';
  }

  // Build main content block using concatenation
  var mainContent = '';
  if (isInvestor) {
    mainContent =
      '<p>Thank you for your interest in SkillBridge Arabia. We are excited to share our investor materials with you.</p>' +
      '<p>SkillBridge Arabia is building the GCC\'s most skilled frontline workforce — certifying expat F&B workers before they arrive in Saudi Arabia. Our seed round of <strong>SAR 375,000 for 15% equity</strong> is currently open.</p>' +
      credentialsBlock +
      '<p>We are also happy to arrange a call to walk you through the model and answer any questions. Simply reply to this email to schedule a time.</p>';
  } else {
    mainContent =
      '<p>Thank you for reaching out to SkillBridge Arabia. We have received your message and will respond within <strong>24 hours</strong>.</p>' +
      '<p>In the meantime, you are welcome to explore the live platform.</p>';
  }

  // Build full email body using concatenation — no nested backticks
  var body =
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>' +
      'body{font-family:\'Segoe UI\',Arial,sans-serif;background:#F5F2EC;margin:0;padding:0}' +
      '.wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}' +
      '.hdr{background:#1C1C1A;padding:28px 32px 22px}' +
      '.hdr-logo{font-size:20px;color:#fff;font-weight:600;font-family:Georgia,serif}' +
      '.gold-bar{height:4px;background:#B78A2A}' +
      '.bd{padding:32px}' +
      '.bd h2{font-size:20px;color:#1A1714;margin-bottom:10px;font-weight:600;font-family:Georgia,serif}' +
      '.bd p{font-size:14px;color:#3D3830;line-height:1.8;margin-bottom:13px}' +
      '.cta{display:inline-block;margin:6px 0 14px;padding:11px 26px;background:#B78A2A;color:#fff;border-radius:7px;font-size:13px;font-weight:600;text-decoration:none}' +
      '.ftr{padding:18px 32px;background:#F5F2EC;border-top:1px solid #EAE6DC;font-size:11px;color:#A09890}' +
    '</style></head><body>' +
    '<div class="wrap">' +
      '<div class="hdr">' +
        '<div class="hdr-logo"><span style="color:#fff;font-weight:600">Skill</span><span style="color:#D4B860;font-style:italic">Bridge</span><span style="color:#fff;font-weight:600"> Arabia</span></div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.15em;text-transform:uppercase;margin-top:5px">From Origin to Excellence</div>' +
      '</div>' +
      '<div class="gold-bar"></div>' +
      '<div class="bd">' +
        '<h2>Hello ' + firstName + ',</h2>' +
        mainContent +
        '<a href="' + PLATFORM_URL + '" class="cta">Try the live platform &#8594;</a>' +
        '<p style="font-size:12px;color:#A09890">Questions? Reply to this email or contact us at hello@skillbridgearabia.com</p>' +
      '</div>' +
      '<div class="ftr">' +
        '&copy; 2026 SkillBridge Arabia &nbsp;&middot;&nbsp; Riyadh, Saudi Arabia &nbsp;&middot;&nbsp; Vision 2030 Aligned' +
      '</div>' +
    '</div></body></html>';

  GmailApp.sendEmail(data.email, subject, '', {
    htmlBody: body,
    name: 'SkillBridge Arabia',
    replyTo: FOUNDER_EMAIL
  });
}

// ── Notify founder ─────────────────────────────────────────────────────────
function notifyFounder(data) {
  var isInvestor = isInvestorSubmission(data);
  var source     = data.source || 'website';
  var prefix     = isInvestor ? 'INVESTOR' : 'New enquiry';
  var subject    = prefix + ': ' + (data.name || 'Unknown') + ' (' + (data.role || 'no role') + ') — ' + source;

  var body =
    (isInvestor ? 'INVESTOR ENQUIRY — Credentials sent automatically\n' : 'New contact form submission\n') +
    '\nNAME:         ' + (data.name || '') +
    '\nEMAIL:        ' + (data.email || '') +
    '\nPHONE:        ' + (data.phone || 'Not provided') +
    '\nORGANISATION: ' + (data.company || data.organisation || 'Not provided') +
    '\nROLE:         ' + (data.role || 'Not selected') +
    '\nSOURCE:       ' + source +
    '\nTIME:         ' + Utilities.formatDate(new Date(), 'Asia/Riyadh', 'dd MMM yyyy HH:mm') + ' (Riyadh)' +
    '\n\nMESSAGE:\n' + (data.message || '(no message)') +
    '\n\n---' +
    (isInvestor
      ? '\nCredentials sent to ' + data.email + ':\nUsername: ' + INVESTOR_USER + '\nPassword: ' + INVESTOR_PASS
      : '') +
    '\nView all submissions: Check your Google Sheet';

  GmailApp.sendEmail(FOUNDER_EMAIL, subject, body, {
    name: 'SkillBridge Arabia Forms'
  });
}
