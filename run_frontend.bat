@echo off
echo Starting Frontend...
cd patent\frontend
if not exist "node_modules\" (
    echo Installing node modules...
    call npm install
)
call npm start
