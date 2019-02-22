# Debate DNS

An automated SMS system that reads tournament draws and sends personalised SMS messages to participants. Currently only supports 2-team formats; support for formats with 3+ teams will be added soon.
Designed to work inside a Google Sheet, alongside a <a href="https://github.com/TabbycatDebate/tabbycat" target="_blank">Tabbycat</a> system, with the Twilio Programmable SMS API.
Developed by Viran Weerasekera (2019).

This repository includes the code running in the Sheets script editor, and samples of the various tables used.

A demo setup of a set-up Google Sheet running this system can be found here:

<a href="https://tinyurl.com/yxdj8fes" target="_blank">https://tinyurl.com/yxdj8fes</a>

## Requirements
- A non-trial (paid) Twilio account, with a purchased number and sufficient credit to send messages.
- A Google sheet set up in a manner similar to the demo sheet.

## Setup
- In `Settings`, add the tournament name and the Sender ID (the sender you want people to see when they receive your message instead of the Twilio phone number (restricted by country)).
- Add the names, phone numbers, roles (either `debater` or `adjudicator`) and their team if they're a debater (with the attached emoji) into the `SMS - Base` sheet.
- Add the list of teams with their <a href="https://github.com/TabbycatDebate/tabbycat" target="_blank">Tabbycat</a> emoji attached, and the teams without their emoji attached, in the appropriate columns under `Team Decoder`.
- Copy your draw into `Draw`. At a minimum it should include a venue, AFF/NEG teams, and the adjudication panel. This system is optimised for draws from <a href="https://github.com/TabbycatDebate/tabbycat" target="_blank">Tabbycat</a>; if you copy the draw from its Admin interface it will paste cleanly into `Draw`.
- Select 'Send SMS' in the menu bar, and pick the appropriate round title (this functionally just sets the heading of your messages, along with the defined tournament name). Messages will be sent to everyone defined in `SMS - Base`; if a team or an adjudicator doesn't have a debate that round (ie. if they don't appear in the draw), their message will reflect that.
- You'll be presented with the final cost incurred from those messages (charged by Twilio and deducted from your account balance).

If Twilio doesn't support alphanumeric sender IDs in the country you're using the system in, delete Line 6 and replace the value for the `From` key under `payload` in `sendSMS()` (`Twilio.js`) with a string containing your actual Twilio number. See the code files for more explanation.
