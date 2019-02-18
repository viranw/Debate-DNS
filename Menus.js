function onOpen() {
    var ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Send SMS')
    .addItem('Round 1', 'send_1')
    .addItem('Round 2', 'send_2')
    .addItem('Round 3', 'send_3')
    .addItem('Round 4', 'send_4')
    .addItem('Round 5', 'send_5')
    .addItem('Round 6', 'send_6')
    .addItem('Octofinals', 'send_of')
    .addItem('Quarterfinals', 'send_qf')
    .addItem('Semifinals', 'send_sf')
    .addItem('Grand Final', 'send_gf')
    .addToUi();
    
}


function send_1() {
    smsDraw_3v3("Round 1")
}

function send_2() {
    smsDraw_3v3("Round 2")
}

function send_3() {
    smsDraw_3v3("Round 3")
}

function send_4() {
    smsDraw_3v3("Round 4")
}

function send_5() {
    smsDraw_3v3("Round 5")
}

function send_6() {
    smsDraw_3v3("Round 6")
}

function send_of() {
    smsDraw_3v3("Octofinals")
}

function send_qf() {
    smsDraw_3v3("Quarterfinals")
}

function send_sf() {
    smsDraw_3v3("Semifinals")
}

function send_gf() {
    smsDraw_3v3("Grand Final")
}
