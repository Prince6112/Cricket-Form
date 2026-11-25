/**
 * Majestique Colours Cricket League 2027 — registration receiver.
 *
 * Paste this into a Google Sheet: Extensions → Apps Script, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into config.js (SCRIPT_URL).
 *
 * Boys and girls go to separate tabs: "Boys" and "Girls".
 * Run setup() once from the editor to create both tabs with headers.
 * File → Download → Microsoft Excel (.xlsx) gives you the Excel file (both tabs) any time.
 */

// category sent by the form → [tab name, ID prefix]
var CATEGORIES = {
  Boys: ["Boys", "CCL27-B-"],
  Girls: ["Girls", "CCL27-G-"]
};

// [column header, key sent by the form]
var COLUMNS = [
  ["Reg ID", "_id"],
  ["Submitted At", "_ts"],
  ["Full Name", "name"],
  ["WhatsApp", "mobile"],
  ["Email", "email"],
  ["Date of Birth", "dob"],
  ["Age (on 6 Feb 2027)", "_age"],
  ["Area", "area"],
  ["Role", "role"],
  ["Batting Hand", "batHand"],
  ["Bowling Style", "bowlStyle"],
  ["Jersey Name", "jerseyName"],
  ["Jersey No", "jerseyNo"],
  ["T-shirt Size", "tshirt"],
  ["Declaration", "agree"]
];
var COL_MOBILE = colOf("mobile");
var COL_JERSEY_NO = colOf("jerseyNo");
var CONTACT = "Rohit Jethale – 93733 13346";

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.website) return json({ ok: true, id: "CCL27-0000" }); // honeypot: bots

    var err = validate(d);
    if (err) return json({ ok: false, error: err });

    var cat = CATEGORIES[d.category];
    var sheet = getSheet(cat[0]);
    var mobile = clean(d.mobile);

    // one registration per WhatsApp number, across both tabs
    for (var k in CATEGORIES) {
      var found = findMobile(getSheet(CATEGORIES[k][0]), mobile);
      if (found) {
        return json({ ok: false, error: "This WhatsApp number is already registered (ID " + found + "). To change details, contact " + CONTACT + "." });
      }
    }

    var id = cat[1] + ("000" + nextNumber(sheet, cat[1])).slice(-4);
    d._id = id;
    d._ts = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy HH:mm:ss");
    d._age = ageOn(d.dob, new Date(2027, 1, 6));

    var row = COLUMNS.map(function (c) {
      var v = c[1].charAt(0) === "_" ? d[c[1]] : clean(d[c[1]]);
      return v === undefined ? "" : v;
    });
    sheet.appendRow(row);
    // keep mobile / jersey no as text so Excel doesn't strip zeros
    var r = sheet.getLastRow();
    sheet.getRange(r, COL_MOBILE).setNumberFormat("@").setValue(mobile);
    sheet.getRange(r, COL_JERSEY_NO).setNumberFormat("@").setValue(clean(d.jerseyNo));

    return json({ ok: true, id: id });
  } catch (ex) {
    return json({ ok: false, error: "Server busy, please try again in a minute." });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: "CCL 2027 registration" });
}

// Run once from the Apps Script editor (select "setup" → Run) to create both tabs.
function setup() {
  for (var k in CATEGORIES) getSheet(CATEGORIES[k][0]);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

function validate(d) {
  if (!CATEGORIES[d.category]) return "Please open the Boys or Girls registration link";
  if (!clean(d.name)) return "Name is required";
  if (!/^[6-9]\d{9}$/.test(clean(d.mobile))) return "Invalid mobile number";
  var req = ["dob", "area", "role", "batHand", "jerseyName", "jerseyNo", "tshirt"];
  for (var i = 0; i < req.length; i++) if (!clean(d[req[i]])) return "Missing: " + req[i];
  if (d.agree !== "Yes") return "Please accept the declaration";
  return "";
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#142c6e").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

// returns the Reg ID already using this mobile, or ""
function findMobile(sheet, mobile) {
  var last = sheet.getLastRow();
  if (last < 2) return "";
  var mobiles = sheet.getRange(2, COL_MOBILE, last - 1, 1).getDisplayValues();
  for (var i = 0; i < mobiles.length; i++) {
    if (String(mobiles[i][0]).replace(/\D/g, "").slice(-10) === mobile) {
      return sheet.getRange(i + 2, 1).getDisplayValue();
    }
  }
  return "";
}

// highest existing number + 1, so deleting test rows restarts numbering cleanly
function nextNumber(sheet, prefix) {
  var last = sheet.getLastRow();
  var max = 0;
  if (last >= 2) {
    sheet.getRange(2, 1, last - 1, 1).getDisplayValues().forEach(function (r) {
      var s = String(r[0]);
      if (s.indexOf(prefix) === 0) max = Math.max(max, parseInt(s.slice(prefix.length), 10) || 0);
    });
  }
  return max + 1;
}

function colOf(key) {
  for (var i = 0; i < COLUMNS.length; i++) if (COLUMNS[i][1] === key) return i + 1;
  throw new Error("No column for " + key);
}

function ageOn(dob, ref) {
  var b = new Date(dob);
  if (isNaN(b)) return "";
  var a = ref.getFullYear() - b.getFullYear();
  if (ref.getMonth() < b.getMonth() || (ref.getMonth() === b.getMonth() && ref.getDate() < b.getDate())) a--;
  return a;
}

// trims, caps length, and blocks spreadsheet formula injection (=, +, -, @)
function clean(v) {
  v = String(v == null ? "" : v).trim().slice(0, 100);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
