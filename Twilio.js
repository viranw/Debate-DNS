// Demo function, with account data removed
function sendSms(to, body) {
    var messages_url = "https://api.twilio.com/2010-04-01/Accounts/YOURACCOUNTSID/Messages.json"; // MARK: Sub your account ID in the appropriate part
    var from = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange("B2:B2").getCell(1,1).getValue() // Delete this line if you're not using alphanumeric sender IDs
    
    var payload = {
        "To": to,
        "Body" : body,
        "From" : from // Replace with a string containing your Twilio phone number if you're not using alphanumeric sender IDs
    };
    
    var options = {
        "method" : "post",
        "payload" : payload
    };
    
    options.headers = {
        "Authorization" : "Basic " + Utilities.base64Encode("YOURACCOUNTSID:YOURAUTHTOKEN") // MARK: Sub your account details here
    };
    
    UrlFetchApp.fetch(messages_url, options);
}

function sendAll() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SMS - Staging")
    var startRow = 2;
    var numRows = sheet.getLastRow() - 1;
    var dataRange = sheet.getRange(startRow, 1, numRows, 2)
    var data = dataRange.getValues();
    
    for (i in data) {
        var row = data[i];
        try {
            response_data = sendSms(row[0], row[1]);
            status = "sent";
            Logger.log("Message sent to "+row[0]);
        } catch(err) {
            Logger.log(err);
            status = "error";
        }
        sheet.getRange(startRow + Number(i), 3).setValue(status);
    }
}
