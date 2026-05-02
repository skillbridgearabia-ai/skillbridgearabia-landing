// SkillBridge Arabia — Google Apps Script FINAL
// No template literals anywhere - pure string concatenation
// Works on all Google Apps Script versions

var FOUNDER_EMAIL = 'elias.hashem.eh@gmail.com';
var SHEET_NAME    = 'Submissions';
var INVESTOR_PASS = 'investor2026';
var INVESTOR_USER = 'skillbridge';
var PLATFORM_URL  = 'https://app.skillbridgearabia.com';
var INVESTOR_URL  = 'https://skillbridgearabia.com/investor';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    saveToSheet(data);
    sendAutoReply(data);
    notifyFounder(data);
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error',message:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok',message:'FINAL version running'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function isInvestor(data) {
  var source = data.source ? data.source.toLowerCase() : '';
  var role   = data.role   ? data.role.toLowerCase()   : '';
  if (source.indexOf('investor') !== -1) return true;
  if (role.indexOf('investor')   !== -1) return true;
  return false;
}

function saveToSheet(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp','Name','Email','Phone','Organisation','Role','Message','Source','Date']);
    sheet.getRange(1,1,1,9).setBackground('#B78A2A').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date().toISOString(),
    data.name    || '',
    data.email   || '',
    data.phone   || '',
    data.company || '',
    data.role    || '',
    data.message || '',
    data.source  || '',
    Utilities.formatDate(new Date(), 'Asia/Riyadh', 'dd MMM yyyy HH:mm')
  ]);
}

function sendAutoReply(data) {
  if (!data.email) return;
  var firstName   = data.name ? data.name.split(' ')[0] : 'there';
  var inv         = isInvestor(data);
  var subject     = inv ? 'Your SkillBridge Arabia investor access' : 'We received your message — SkillBridge Arabia';

  var headerHtml =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#F5F2EC;margin:0;padding:0">' +
    '<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">' +
    '<div style="background:#1C1C1A;padding:28px 32px 22px">' +
    '<div style="font-size:20px;color:#ffffff;font-weight:600;font-family:Georgia,serif">' +
    '<span style="color:#ffffff">Skill</span><span style="color:#D4B860;font-style:italic">Bridge</span><span style="color:#ffffff"> Arabia</span></div>' +
    '<div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:5px">From Origin to Excellence</div>' +
    '</div>' +
    '<div style="height:4px;background:#B78A2A"></div>' +
    '<div style="padding:32px">' +
    '<h2 style="font-size:20px;color:#1A1714;margin-bottom:10px;font-family:Georgia,serif">Hello ' + firstName + ',</h2>';

  var bodyHtml = '';
  if (inv) {
    var credsHtml =
      '<div style="margin:24px 0;padding:22px 24px;background:#FBF5E6;border:1px solid #D4B860;border-left:4px solid #B78A2A;border-radius:8px">' +
      '<div style="font-size:12px;font-weight:700;color:#8C6315;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">YOUR INVESTOR ACCESS CREDENTIALS</div>' +
      '<table style="width:100%;border-collapse:collapse">' +
      '<tr>' +
      '<td style="padding:10px 14px;background:#ffffff;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830;width:40%">Username</td>' +
      '<td style="padding:10px 14px;background:#ffffff;border:1px solid #D4B860;font-size:15px;font-weight:700;color:#B78A2A;font-family:monospace">' + INVESTOR_USER + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td style="padding:10px 14px;background:#F3F0E8;border:1px solid #D4B860;font-size:13px;font-weight:600;color:#3D3830">Password</td>' +
      '<td style="padding:10px 14px;background:#F3F0E8;border:1px solid #D4B860;font-size:15px;font-weight:700;color:#B78A2A;font-family:monospace">' + INVESTOR_PASS + '</td>' +
      '</tr>' +
      '</table>' +
      '<div style="margin-top:14px;font-size:12px;color:#6B6560;line-height:1.6">' +
      'Go to <a href="' + INVESTOR_URL + '" style="color:#B78A2A;font-weight:600">' + INVESTOR_URL + '</a> ' +
      'and enter these credentials to access the full investor deck.' +
      '</div>' +
      '</div>';

    bodyHtml =
      '<p style="font-size:14px;color:#3D3830;line-height:1.8">Thank you for your interest in SkillBridge Arabia.</p>' +
      '<p style="font-size:14px;color:#3D3830;line-height:1.8">Our seed round of <strong>SAR 375,000 for 15% equity</strong> is currently open. Here are your credentials to access the full investor deck:</p>' +
      credsHtml +
      '<p style="font-size:14px;color:#3D3830;line-height:1.8">We are happy to arrange a call. Simply reply to this email.</p>';
  } else {
    bodyHtml =
      '<p style="font-size:14px;color:#3D3830;line-height:1.8">Thank you for reaching out to SkillBridge Arabia. We have received your message and will respond within <strong>24 hours</strong>.</p>';
  }

  var footerHtml =
    '<a href="' + PLATFORM_URL + '" style="display:inline-block;margin:8px 0 16px;padding:11px 26px;background:#B78A2A;color:#ffffff;border-radius:7px;font-size:13px;font-weight:600;text-decoration:none">Try the live platform</a>' +
    '</div>' +
    '<div style="padding:18px 32px;background:#F5F2EC;border-top:1px solid #EAE6DC;font-size:11px;color:#A09890">' +
    '&copy; 2026 SkillBridge Arabia &middot; Riyadh, Saudi Arabia &middot; Vision 2030 Aligned' +
    '</div></div></body></html>';

  var fullBody = headerHtml + bodyHtml + footerHtml;

  GmailApp.sendEmail(data.email, subject, '', {
    htmlBody: fullBody,
    name: 'SkillBridge Arabia',
    replyTo: FOUNDER_EMAIL
  });
}

function notifyFounder(data) {
  var inv     = isInvestor(data);
  var subject = (inv ? 'INVESTOR: ' : 'Enquiry: ') + (data.name || 'Unknown') + ' — ' + (data.source || 'website');
  var body    =
    'NAME:    ' + (data.name    || '') + '\n' +
    'EMAIL:   ' + (data.email   || '') + '\n' +
    'PHONE:   ' + (data.phone   || 'not provided') + '\n' +
    'ORG:     ' + (data.company || 'not provided') + '\n' +
    'ROLE:    ' + (data.role    || '') + '\n' +
    'SOURCE:  ' + (data.source  || '') + '\n' +
    'MESSAGE: ' + (data.message || '') + '\n\n' +
    (inv ? 'Credentials sent: ' + INVESTOR_USER + ' / ' + INVESTOR_PASS : '');
  GmailApp.sendEmail(FOUNDER_EMAIL, subject, body, {name:'SkillBridge Arabia Forms'});
}
