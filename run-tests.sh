# see acceptance-tests/README.txt

echo "This doesn't start the server so if you haven't already run: npm start"

echo "Setting up selenium and drivers..."
node_modules/selenium-standalone/bin/selenium-standalone install --silent

echo "Starting selenium (FYI: output directed to /dev/null)..."
node_modules/selenium-standalone/bin/selenium-standalone start &>/dev/null &
bg_pid=$!

sleep 5s

echo "Running tests..."
node_modules/nodeunit/bin/nodeunit acceptance-tests/all-tests.js

kill $bg_pid