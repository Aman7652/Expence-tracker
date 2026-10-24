/**
 * Google Apps Script Web App for Supabase Daily Expense Tracker Sync
 *
 * Setup Instructions:
 * 1. Open Google Sheets (https://sheets.new) and create a new blank spreadsheet.
 * 2. In Google Sheets menu, click Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs, paste this entire file content, and click Save (Cmd+S / Ctrl+S).
 * 4. Click 'Deploy' -> 'New deployment'.
 * 5. Under 'Select type', choose 'Web app'.
 * 6. Set Description: "Expense Tracker Webhook".
 * 7. Set 'Execute as': "Me" (your Google account).
 * 8. Set 'Who has access': "Anyone" (allows Next.js backend to POST webhook payloads).
 * 9. Click 'Deploy', authorize access if prompted, and copy the Web App URL (ends with /exec).
 * 10. Paste this URL into your .env.local and Vercel Environment Variables as GOOGLE_SHEET_WEBHOOK_URL.
 */

const HEADERS = ["id", "date", "category", "amount", "note"];

function setupSheetIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2563eb");
    headerRange.setFontColor("#ffffff");
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const rawData = e.postData && e.postData.contents ? e.postData.contents : "{}";
    const payload = JSON.parse(rawData);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    setupSheetIfNeeded(sheet);

    const action = (payload.action || "add").toLowerCase();

    // Support single item or batch sync
    if (action === "batch_sync" || action === "sync_all") {
      const expenses = payload.expenses || [];
      // Clear data rows but keep headers
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      if (expenses.length > 0) {
        const rows = expenses.map(function (item) {
          return [
            item.id || "",
            item.expense_date || item.date || "",
            item.category || "Other",
            Number(item.amount || 0),
            item.note || ""
          ];
        });
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Successfully synchronized " + expenses.length + " expenses to Google Sheet."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const expenseId = String(payload.id || payload.expenseId || "");
    const date = payload.date || payload.expense_date || "";
    const category = payload.category || "";
    const amount = Number(payload.amount || 0);
    const note = payload.note || "";

    if (!expenseId && action !== "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required expense id."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === expenseId) {
        rowIndex = i + 1; // 1-indexed for Sheet rows
        break;
      }
    }

    if (action === "delete") {
      if (rowIndex !== -1) {
        sheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Deleted expense row " + expenseId
        })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Expense not found for deletion, nothing changed."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update" || action === "edit") {
      if (rowIndex !== -1) {
        sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([[expenseId, date, category, amount, note]]);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Updated expense row " + expenseId
        })).setMimeType(ContentService.MimeType.JSON);
      }
      // If not found, fallthrough to append
    }

    // Default: Add / Insert
    sheet.appendRow([expenseId, date, category, amount, note]);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Added expense row " + expenseId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script Webhook is active and listening for POST requests."
  })).setMimeType(ContentService.MimeType.JSON);
}
