function smsDraw_3v3(rd) {
    var ui = SpreadsheetApp.getUi()
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var drawRange = ss.getSheetByName("Draw").getRange("A2:F1000").getValues()
    var teamRange = ss.getSheetByName("Team Decoder").getRange("A2:B1000").getValues()
    var infoRange = ss.getSheetByName("SMS - Base").getRange("A2:D1000").getValues()
    var outputRangeNoVal = ss.getSheetByName("SMS - Staging").getRange("A2:C1000")
    var outputRange = ss.getSheetByName("SMS - Staging").getRange("A2:C1000").getValues()
    var tournamentName = ss.getSheetByName("Settings").getRange("B1:B1").getCell(1,1).getValue()
    
    if (rd==undefined) {
        var rdPrompt = ui.prompt("Round", "Enter the round's full name, including 'Round' at the front if necessary.",ui.ButtonSet.OK_CANCEL)
        rd = rdPrompt.getResponseText()
        
        if (rdPrompt.getSelectedButton() == ui.Button.CANCEL) {
            return
        }
    }
    
    var pairings = []
    
    for (var r=0;r<drawRange.length;r++) {
        var row = drawRange[r]
        var venue = row[1]
        var aff = row[2]
        var neg = row[3]
        var adjs = row[4]
        
        adjs = adjs.replace("ⓒ"," (Chair)")
        adjs = adjs.replace("ⓣ"," (Trainee)")
        
        if (aff != "" && neg != "") {
            // A pairing exists here
            pairings.push([venue,aff,neg,adjs])
        }
    }
    
    // Teams
    var fullTeams = []
    var cleanedTeams = []
    
    for (var r=0;r<teamRange.length;r++) {
        var row = teamRange[r]
        fullTeams.push(row[0])
        cleanedTeams.push(row[1])
    }
    
    var test = []
    var drawnTeams = []
    var teamMessages = {}
    var adjMessages = {}
    var drawnAdjs = []
    
    for (var p=0;p<pairings.length;p++) {
        var pairing = pairings[p]
        var cleanedAff = cleanedTeams[fullTeams.indexOf(pairing[1])]
        var cleanedNeg = cleanedTeams[fullTeams.indexOf(pairing[2])]
        var msg = tournamentName + " - " + rd + "\n-----\nYour Venue: "+ pairing[0] + "\nAFF: "+ cleanedAff + "\nNEG: "+cleanedNeg+"\nAdjs: "+pairing[3]
        
        teamMessages[pairing[1]] = msg
        teamMessages[pairing[2]] = msg
        drawnTeams.push(pairing[1])
        drawnTeams.push(pairing[2])
        
        
        // Prep for adj appending
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
        // Check if the name appears in either teams or adjs
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
    
    for (var r=output.length;r<outputRange.length;r++) {
        output.push(["","",""])
    }
    
    outputRangeNoVal.setValues(output)
    sendAll()
    
    var cost = msgno*0.055
    var cost = ui.alert("Confirmation", "Messages sent. The total cost for these messages was $"+cost+".",ui.ButtonSet.OK)
}
