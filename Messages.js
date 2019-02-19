function smsDraw_3v3(rd) {
    
    // Define SpreadsheetApp modules and load in key information sets
    /**
     Draw Range = Draw Table
     Team Range = 2-column table of team names with and without leading emoji
     Info Range = Base list of names, phone numbers, roles and team affiliations
     Output Range (No Values) = Range object of the SMS staging table
     Output Range = Values of the range object
     Tournament Name = Name of the tournament as defined in Settings
     **/
    
    var ui = SpreadsheetApp.getUi()
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var drawRange = ss.getSheetByName("Draw").getRange("A2:F1000").getValues() // Vary for BP
    var teamRange = ss.getSheetByName("Team Decoder").getRange("A2:B1000").getValues()
    var infoRange = ss.getSheetByName("SMS - Base").getRange("A2:D1000").getValues()
    var outputRangeNoVal = ss.getSheetByName("SMS - Staging").getRange("A2:C1000")
    var outputRange = outputRangeNoVal.getValues()
    var tournamentName = ss.getSheetByName("Settings").getRange("B1:B1").getCell(1,1).getValue()
    
    // If this method is invoked without a round heading, ask the user for a round heading - If one is not provided, the function exits.
    if (rd==undefined) {
        var rdPrompt = ui.prompt("Round", "Enter the round's full name, including 'Round' at the front if necessary.",ui.ButtonSet.OK_CANCEL)
        rd = rdPrompt.getResponseText()
        
        if (rdPrompt.getSelectedButton() == ui.Button.CANCEL) {
            return
        }
    }
    
    // Read the draw for the round
    var pairings = []
    
    for (var r=0;r<drawRange.length;r++) {
        var row = drawRange[r]
        var venue = row[1]
        var aff = row[2]
        var neg = row[3]
        var adjs = row[4]
        
        // Chair/Trainee symbols don't send well in the standard SMS format, so replace those with full works
        adjs = adjs.replace("ⓒ"," (Chair)")
        adjs = adjs.replace("ⓣ"," (Trainee)")
        
        // Check to determine if a pairing exists at the row - If it does, push an array of [venue,teams,adjs] to the main pairing array
        if (aff != "" && neg != "") {
            // A pairing exists here
            pairings.push([venue,aff,neg,adjs])
        }
    }
    
    // Teams
    // Emoji don't send well in the standard SMS format, so team names used in the actual construction of messages do not include their emoji (aka. 'cleaned teams')
    var fullTeams = []
    var cleanedTeams = []
    
    // Read the team range and record the team's name, with and without emoji
    for (var r=0;r<teamRange.length;r++) {
        var row = teamRange[r]
        fullTeams.push(row[0])
        cleanedTeams.push(row[1])
    }
    
    var drawnTeams = []
    var teamMessages = {}
    var adjMessages = {}
    var drawnAdjs = []
    
    // For each pairing, mark that the teams in it are on the draw for the round, and construct the message for those teams
    for (var p=0;p<pairings.length;p++) {
        var pairing = pairings[p]
        var cleanedAff = cleanedTeams[fullTeams.indexOf(pairing[1])]
        var cleanedNeg = cleanedTeams[fullTeams.indexOf(pairing[2])]
        var msg = tournamentName + " - " + rd + "\n-----\nYour Venue: "+ pairing[0] + "\nAFF: "+ cleanedAff + "\nNEG: "+cleanedNeg+"\nAdjs: "+pairing[3]
        
        teamMessages[pairing[1]] = msg
        teamMessages[pairing[2]] = msg
        drawnTeams.push(pairing[1])
        drawnTeams.push(pairing[2])
        
        
        // Repeat the above process for adjudicators on the panel
        var adjsNoFlags = pairing[3].replace(" (Chair)","")
        adjsNoFlags = adjsNoFlags.replace(" (Trainee)","")
        
        var adjArray = adjsNoFlags.split(", ")
        for (var a=0;a<adjArray.length;a++) {
            drawnAdjs.push(adjArray[a])
            adjMessages[adjArray[a]] = msg
        }
    }
    
    var msgno = 0
    var output = []
    for (var r=0;r<infoRange.length;r++) {
        
        /**
         For each person, check if their team (debaters) or if their name (adjudicators) appears in the relevant list of teams/adjudicators on the draw
         - If it does, they are participating in the round, and their message is the one tied to either their team (debaters) or themselves (adjudicators)
         - If it doesn't, they aren't participating in the round, and a message to that effect is constructed.
         Add the number of SMSs required for each message to the total sum (1 message per 160 characters, rounded up to the nearest multiple of 160)
         **/
        
        var row = infoRange[r]
        var name = row[0]
        var number = row[1]
        var type = row[2]
        var fullTeam = row[3]
        
        if (type=="debater") {
            var cleanedTeam = cleanedTeams[fullTeams.indexOf(row[3])]
            if (drawnTeams.indexOf(fullTeam) == -1) {
                var noDebateString = tournamentName + " - " + rd + "\n'"+cleanedTeam+"' does not have a debate this round."
                output.push([number,noDebateString,""])
            } else {
                var debateString = teamMessages[fullTeam]
                output.push([number,debateString,""])
                msgno += Math.ceil(debateString.length / 160)
            }
        } else if (type=="adjudicator") {
            if (drawnAdjs.indexOf(name) == -1) {
                var noAdjString = tournamentName + " - " + rd + "\n'"+name+"' is not adjudicating this round."
                output.push([number,noAdjString,""])
            } else {
                var adjString = adjMessages[name]
                output.push([number,adjString,""])
                msgno += Math.ceil(adjString.length / 160)
            }
        }
    }
    
    /**
     When setting the values of a spreadsheet range, the 2D-array and the range must be of exactly the same dimensions.
     Given the output range (in SMS - Staging) has 1000 rows, and the output array will likely not have this many rows, it is necessary
     to 'pad out' the output array with empty rows before placing it over the top of the output range.
     Twilio doesn't care about these blank rows.
     **/
    
    for (var r=output.length;r<outputRange.length;r++) {
        output.push(["","",""])
    }
    
    // Overlay the output array on the output range (given the Twilio API reads from a spreadsheet range)
    outputRangeNoVal.setValues(output)
    
    // Invoke the Twilio API to send all of the messages set in the output range
    sendAll()
    
    // Use the standard rate of $0.055 USD per SMS to calculate and display the cost of the entire operation.
    var cost = msgno*0.055
    var cost = ui.alert("Confirmation", "Messages sent. The total cost for these messages was $"+cost+".",ui.ButtonSet.OK)
}
