1) Install required node packages: 
	npm install wd assert q
	npm install -g nodeunit selenium-standalone

2) Setup selenium-standalone, and then start it:
	selenium-standalone install
	selenium-standalone start

3) Start the dev server (or edit lib/browser-singleton.js to use REMOTE_URL if you want to test prod server):
	cd .. && node server.js

4) Run the tests:
	nodeunit all-tests.js
OR run a specific test:
	nodeunit tests\agree-disagree.js

LICENSE: deep-equal-epsilon.js is derived from nodeunit, and is under the MIT license. See deep-equal-epsilon.js for details.