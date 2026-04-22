/**
 * SkillBridge Arabia — Demo Request Google Apps Script
 * ────────────────────────────────────────────────────
 * Receives demo requests from skillbridgearabia.com
 * and saves them to your Google Sheet.
 *
 * SETUP (10 minutes):
 *
 * 1. Go to sheets.google.com → create new sheet
 *    Name it: "SkillBridge Arabia - Demo Requests"
 *
 * 2. Add these headers in Row 1:
 *    A1: Timestamp
 *    B1: Name
 *    C1: Email
 *    D1: Company
 *    E1: Role
 *    F1: Message
 *    G1: Source
 *    H1: Date
 *
 * 3. Extensions → Apps Script → paste this file → Save
 *
 * 4. Deploy → New deployment
 *    Type: Web app
 *    Execute as: Me
 *    Who has access: Anyone
 *    → Deploy → Copy Web App URL
 *
 * 5. In Render → Environment → Add:
 *    GOOGLE_SCRIPT_URL = (your Web App URL)
 *
 * Done! Every demo request now appears live in your sheet.
 */

function doPost(e) {
  try {
    const data      = JSON.parse(e.postData.contents);
    const name      = data.name      || '';
    const email     = data.email     || '';
    const company   = data.company   || '';
    const role      = data.role      || '';
    const message   = data.message   || '';
    const timestamp = data.timestamp || new Date().toISOString();
    const source    = data.source    || 'landing-demo-request';

    if (!email || !email.includes('@')) {
      return jsonResponse({ ok: false, error: 'Invalid email' });
    }

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    const formattedDate = Utilities.formatDate(
      new Date(timestamp),
      Session.getScriptTimeZone(),
      'dd/MM/yyyy HH:mm'
    );

    sheet.appendRow([timestamp, name, email, company, role, message, source, formattedDate]);

    // ── Email notification to yourself ──
    // Uncomment and add your email below:
    // MailApp.sendEmail({
    //   to: 'your@email.com',
    //   subject: 'New demo request: ' + name + ' from ' + company,
    //   body: [
    //     'New demo request on SkillBridge Arabia!',
    //     '',
    //     'Name:    ' + name,
    //     'Email:   ' + email,
    //     'Company: ' + company,
    //     'Role:    ' + role,
    //     'Message: ' + message,
    //     '',
    //     'Time: ' + formattedDate,
    //   ].join('\n')
    // });

    return jsonResponse({ ok: true });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({
    ok: true,
    message: 'SkillBridge Arabia demo request endpoint is live',
    timestamp: new Date().toISOString()
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
