function doPost(e) {
  console.log("doPost function called");

  var spreadsheetId = getSpreadsheetId();
  var sheet;

  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log("Spreadsheet opened: " + spreadsheet.getName());
    sheet = spreadsheet.getSheets()[0]; // Get the first sheet
    console.log("Active sheet name: " + sheet.getName());
  } catch (error) {
    console.error("Error accessing spreadsheet: " + error);
    return ContentService.createTextOutput("Error: Unable to access spreadsheet").setMimeType(ContentService.MimeType.TEXT);
  }

  var data;
  try {
    data = JSON.parse(e.postData.contents);
    console.log("Received data: " + JSON.stringify(data));
  } catch (error) {
    console.error("Error parsing JSON: " + error);
    return ContentService.createTextOutput("Error: Invalid JSON data").setMimeType(ContentService.MimeType.TEXT);
  }

  // Check if it's a test connection
  if (data.test === 'connection') {
    sheet.appendRow([new Date(), "Test connection", JSON.stringify(data)]);
    console.log("Test connection logged to spreadsheet");
    return ContentService.createTextOutput("Connection successful").setMimeType(ContentService.MimeType.TEXT);
  }

  // Validate required fields
  if (!data.url) {
    console.error("Error: URL is required");
    return ContentService.createTextOutput("Error: URL is required").setMimeType(ContentService.MimeType.TEXT);
  }

  // Scrape additional content
  var scrapedContent = "";
  try {
    scrapedContent = scrapeContent(data.url);
    console.log("Scraped content length: " + scrapedContent.length);
  } catch (error) {
    console.error("Error scraping content: " + error);
    scrapedContent = "Error scraping content: " + error.message;
  }

  // Append data to sheet
  try {
    var newRow = [
      new Date(),
      data.url || "",
      data.title || "",
      data.description || "",
      data.image || "",
      data.favicon || "",
      data.note || "",
      data.tags || "",
      scrapedContent
    ];
    console.log("Attempting to append row: " + JSON.stringify(newRow));
    sheet.appendRow(newRow);
    console.log("Row appended successfully");
  } catch (error) {
    console.error("Error appending row: " + error);
    return ContentService.createTextOutput("Error: Failed to append data to sheet").setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

function scrapeContent(url) {
  if (!url) {
    throw new Error("URL is required for scraping");
  }

  var response;
  try {
    response = UrlFetchApp.fetch(url);
  } catch (error) {
    console.error("Error fetching URL: " + error);
    return "Error fetching URL";
  }

  var content = response.getContentText();

  // Example: Extract all paragraph text
  var paragraphs = content.match(/<p>(.*?)<\/p>/g);
  if (paragraphs) {
    paragraphs = paragraphs.map(p => p.replace(/<\/?p>/g, ''));
    return paragraphs.join('\n\n');
  }

  return "No content scraped";
}

function scrapeContent(url) {
  if (!url) {
    throw new Error("URL is required for scraping");
  }

  var response;
  try {
    response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  } catch (error) {
    console.error("Error fetching URL: " + error);
    return "Error fetching URL";
  }

  var content = response.getContentText();
  var scrapedContent = [];

  // Try to extract main content
  var mainContent = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainContent) {
    scrapedContent.push(cleanHtml(mainContent[1]));
  }

  // If no main content, try to extract article content
  if (scrapedContent.length === 0) {
    var articleContent = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleContent) {
      scrapedContent.push(cleanHtml(articleContent[1]));
    }
  }

  // Extract all paragraph text
  var paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (paragraphs) {
    scrapedContent = scrapedContent.concat(paragraphs.map(p => cleanHtml(p)));
  }

  // Extract header text
  var headers = content.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi);
  if (headers) {
    scrapedContent = scrapedContent.concat(headers.map(h => cleanHtml(h)));
  }

  // If still no content, try to extract body content
  if (scrapedContent.length === 0) {
    var bodyContent = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyContent) {
      scrapedContent.push(cleanHtml(bodyContent[1]));
    }
  }

  if (scrapedContent.length > 0) {
    return scrapedContent.join('\n\n');
  }

  return "No content scraped";
}

function cleanHtml(html) {
  // Remove HTML tags
  var text = html.replace(/<[^>]*>/g, " ");
  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, " ");
  // Trim leading and trailing spaces
  text = text.trim();
  // Decode HTML entities
  text = text.replace(/&amp;/g, "&")
             .replace(/&lt;/g, "<")
             .replace(/&gt;/g, ">")
             .replace(/&quot;/g, "\"")
             .replace(/&#039;/g, "'");
  return text;
}

function sendWeeklySummary() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  var data = sheet.getDataRange().getValues();
  var recentPages = data.filter(row => row[0] >= lastWeek);

  if (recentPages.length > 0) {
    var summaryHtml = '<h1>Your Weekly Webgobbler Summary</h1>';
    recentPages.forEach(page => {
      summaryHtml += `
        <h2><a href="${page[1]}">${page[2]}</a></h2>
        <p>${page[3]}</p>
        <p>Tags: ${page[7]}</p>
      `;
    });

    MailApp.sendEmail({
      to: "your-email@example.com",
      subject: "Weekly Webgobbler Summary",
      htmlBody: summaryHtml
    });
  }
}

// Set up a trigger to run sendWeeklySummary() every week
function createWeeklyTrigger() {
  ScriptApp.newTrigger('sendWeeklySummary')
      .timeBased()
      .everyWeeks(1)
      .create();
}

function getSpreadsheetId() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in script properties");
  }
  return spreadsheetId;
}

function testSpreadsheetConnection() {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheets()[0];
    sheet.appendRow(["Test connection", new Date()]);
    console.log("Test row added successfully to sheet: " + sheet.getName());
  } catch (error) {
    console.error("Error in test connection: " + error);
  }
}