# see acceptance-tests/README.txt

echo "Setting up selenium and drivers..."
selenium-standalone install --silent

echo "Starting selenium (FYI: output directed to /dev/null)..."
selenium-standalone start &>/dev/null &
bg_pid=$!

sleep 5s

echo "Running tests..."
nodeunit acceptance-tests/all-tests.js

kill $bg_pid