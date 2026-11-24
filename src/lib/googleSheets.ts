export interface GoogleSheetsConfig {
  spreadsheetUrl: string;
  webAppUrl: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

export const initialGoogleSheetsConfig: GoogleSheetsConfig = {
  spreadsheetUrl: '',
  webAppUrl: '',
  autoSync: false,
  lastSyncedAt: null,
  syncStatus: 'idle',
};

// Generate the complete Google Apps Script code for the user to paste into their Google Sheet
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * NODZO FINANCE — GOOGLE SHEETS DATABASE CONNECTOR
 * Turn your Google Sheet into a real-time REST API database for Nodzo Finance.
 *
 * HOW TO INSTALL (2 MINUTES):
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Delete all existing code and paste this script entirely.
 * 3. Click "Deploy" > "New deployment".
 * 4. Select type "Web app".
 * 5. Set Description: "Nodzo Finance DB API".
 * 6. Set "Execute as": "Me".
 * 7. Set "Who has access": "Anyone" (crucial for CORS web app access).
 * 8. Click "Deploy", copy the Web App URL, and paste it into Nodzo Finance Settings!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    status: 'success',
    timestamp: new Date().toISOString(),
    expenses: getSheetData(ss, 'Expenses'),
    revenue: getSheetData(ss, 'Revenue'),
    subscriptions: getSheetData(ss, 'Subscriptions'),
    accounts: getSheetData(ss, 'Accounts')
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Sync Expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      writeExpenses(ss, data.expenses);
    }

    // 2. Sync Revenue Invoices
    if (data.invoices && Array.isArray(data.invoices)) {
      writeRevenue(ss, data.invoices);
    }

    // 3. Sync Subscriptions
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      writeSubscriptions(ss, data.subscriptions);
    }

    // 4. Sync Financial Accounts
    if (data.accounts && Array.isArray(data.accounts)) {
      writeAccounts(ss, data.accounts);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Google Sheet database synchronized successfully',
      recordsSynced: {
        expenses: data.expenses ? data.expenses.length : 0,
        invoices: data.invoices ? data.invoices.length : 0,
        subscriptions: data.subscriptions ? data.subscriptions.length : 0,
        accounts: data.accounts ? data.accounts.length : 0
      },
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function writeExpenses(ss, expenses) {
  var sheet = getOrCreateSheet(ss, 'Expenses');
  sheet.clear();
  var headers = [
    'Expense #', 'Date', 'Title', 'Vendor', 'Category', 'Subcategory',
    'Amount', 'Currency', 'Exchange Rate', 'Total Amount INR', 'Base Amount',
    'GST %', 'GST Amount', 'CGST', 'SGST', 'IGST', 'ITC Eligible',
    'Payment Method', 'Payment Status', 'Invoice #'
  ];
  sheet.appendRow(headers);
  formatHeader(sheet, headers.length);

  var rows = expenses.map(function(e) {
    return [
      e.expenseNumber || '',
      e.expenseDate || '',
      e.title || '',
      e.vendor || '',
      e.category || '',
      e.subcategory || '',
      e.amount || 0,
      e.currency || 'INR',
      e.exchangeRate || 1,
      e.totalAmountInr || 0,
      e.baseAmount || 0,
      e.gstPercentage || 0,
      e.gstAmount || 0,
      e.cgstAmount || 0,
      e.sgstAmount || 0,
      e.igstAmount || 0,
      e.itcEligible ? 'YES' : 'NO',
      e.paymentMethod || '',
      e.paymentStatus || '',
      e.invoiceNumber || ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function writeRevenue(ss, invoices) {
  var sheet = getOrCreateSheet(ss, 'Revenue');
  sheet.clear();
  var headers = [
    'Invoice #', 'Customer Name', 'Plan', 'Seats', 'Contract Base (MRR)',
    'AI Usage Overage', 'Discount', 'Subtotal (Excl GST)', 'GST %', 'GST Amount',
    'Total Amount', 'Currency', 'Invoice Date', 'Due Date', 'Payment Status'
  ];
  sheet.appendRow(headers);
  formatHeader(sheet, headers.length);

  var rows = invoices.map(function(i) {
    return [
      i.invoiceNumber || '',
      i.customerName || '',
      i.subscriptionPlan || '',
      i.agentSeats || 1,
      i.subscriptionAmount || 0,
      i.aiUsageCharges || 0,
      i.discount || 0,
      i.subtotal || 0,
      i.gstPercentage || 18,
      i.gstAmount || 0,
      i.totalAmount || 0,
      i.currency || 'INR',
      i.invoiceDate || '',
      i.paymentDueDate || '',
      i.paymentStatus || ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function writeSubscriptions(ss, subs) {
  var sheet = getOrCreateSheet(ss, 'Subscriptions');
  sheet.clear();
  var headers = [
    'Service Name', 'Vendor', 'Category', 'Amount', 'Currency',
    'Billing Frequency', 'Next Billing Date', 'Subscription Owner', 'Status'
  ];
  sheet.appendRow(headers);
  formatHeader(sheet, headers.length);

  var rows = subs.map(function(s) {
    return [
      s.serviceName || '',
      s.vendor || '',
      s.category || '',
      s.amount || 0,
      s.currency || 'USD',
      s.billingFrequency || 'monthly',
      s.nextBillingDate || '',
      s.subscriptionOwner || '',
      s.status || 'active'
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function writeAccounts(ss, accounts) {
  var sheet = getOrCreateSheet(ss, 'Accounts');
  sheet.clear();
  var headers = ['Account Name', 'Type', 'Account Mask', 'Currency', 'Opening Balance', 'Current Balance', 'Active'];
  sheet.appendRow(headers);
  formatHeader(sheet, headers.length);

  var rows = accounts.map(function(a) {
    return [
      a.name || '',
      a.type || '',
      a.accountNumberMask || '',
      a.currency || 'INR',
      a.openingBalance || 0,
      a.currentBalance || 0,
      a.isActive ? 'YES' : 'NO'
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeader(sheet, numCols) {
  var range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground('#4f46e5');
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function getSheetData(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}
`;
}

// Push all current application records to the Google Sheet web app endpoint
export async function pushToGoogleSheets(
  webAppUrl: string,
  payload: {
    expenses: any[];
    invoices: any[];
    subscriptions: any[];
    accounts: any[];
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // In web browsers, Apps Script redirect/CORS needs text/plain or no-cors handling, or normal fetch with json
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { status: 'success', raw: text };
    }

    return {
      success: true,
      message: 'Google Sheets database synchronized successfully!',
      data,
    };
  } catch (error: any) {
    console.error('Error pushing to Google Sheets:', error);
    return {
      success: false,
      message: error?.message || 'Failed to connect to Google Sheets Web App',
    };
  }
}

// Fetch records from the Google Sheet web app endpoint
export async function pullFromGoogleSheets(
  webAppUrl: string
): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    const response = await fetch(webAppUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Data successfully loaded from Google Sheets',
    };
  } catch (error: any) {
    console.error('Error pulling from Google Sheets:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch from Google Sheets',
    };
  }
}
