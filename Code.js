function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- FEATURE 1: Get Webinar Title from 'Config' Sheet ---
  var configSheet = ss.getSheetByName('Config');
  var title = "Webinar Pulse Checker"; // Default fallback if tab is missing
  
  if (configSheet) {
    var cellVal = configSheet.getRange("A1").getValue();
    if (cellVal !== "") title = cellVal;
  }
  template.webinarTitle = title;

  // --- FEATURE 2: Check Login Status ---
  // If deployed as "Anyone", this is usually blank. 
  // If deployed as "Anyone with Google Account", this captures the email.
  var email = Session.getActiveUser().getEmail();
  template.userEmail = email; 

  return template.evaluate()
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Updated to accept 'name' from the frontend
function submitPulse(name, vibe) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Data');
    
    if (!sheet) throw new Error("Tab named 'Data' is missing.");

    // Logic: Use Manual Name -> If empty, use Email -> If empty, use "Guest"
    var finalName = name;
    
    if (!finalName || finalName.trim() === "") {
      var email = Session.getActiveUser().getEmail();
      finalName = email ? email : "Unknown Guest";
    }

    sheet.appendRow([new Date(), finalName, vibe]);
    
    return getChartData(); 
    
  } catch (e) {
    throw new Error(e.toString());
  }
}

function getChartData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Data');
  
  if (!sheet) return { "On Fire": 0, "Good": 0, "Okay": 0, "Overwhelmed": 0 };
  
  var data = sheet.getDataRange().getValues();
  data.shift(); 
  
  let counts = { "On Fire": 0, "Good": 0, "Okay": 0, "Overwhelmed": 0 };
  
  data.forEach(row => {
    let v = row[2]; 
    if (counts.hasOwnProperty(v)) counts[v]++;
  });
  
  return counts;
}
