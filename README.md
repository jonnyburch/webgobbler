# How to use

## 1. Add the google sheet and script
- Add code.gs to a google apps script
- create a gsheet and add SPREADSHEET_ID (section between d/ and /edit in url) as a Script Property
- publish and save url

## 2. Add the chrome extension
- Open chrome extensions, toggle on developer mode
- copy config.template.js to config.js and add the url and spreadsheet id
- click 'load unpacked' and add the contents of the extension folder

## Test
- go to a new tab in chrome or arc and click the extension icon
- Check google sheets for your entry
- not worked? Check
  1. console in browser to ensure data was sent correctly
  2. executions tab in google scripts for errors