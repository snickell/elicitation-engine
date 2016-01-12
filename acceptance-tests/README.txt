1) Setup WebDriver (aka Selenium 2.x), including the chromedriver. This is not included for License reasons (?).
   On Seth's desktop, this is "selenium-server" directory.
2) Run WebDriver, see selenium/selenium-server.bat for an example on windows

3) Install required node packages: 
npm install wd
npm install assert
4) Run the tests:
nodeunit all-tests.js
5) OR run a specific test:
nodeunit tests\agree-disagree.js

LICENSE: deep-equal-epsilon.js is derived from nodeunit, and is under the MIT license. See deep-equal-epsilon.js for details.