@echo off
echo =====================================
echo MESSENGER WEBHOOK TESTING SCRIPT
echo =====================================
echo.

echo Testing GET /api/chatbot/webhook (Verification)
echo Expected: 12345
echo.
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
echo.
echo.

echo =====================================
echo Testing with WRONG token (should fail with 403)
echo.
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345"
echo.
echo.

echo =====================================
echo Testing POST /api/chatbot/webhook (Receive Event)
echo Expected: EVENT_RECEIVED
echo.
curl -X POST http://localhost:3000/api/chatbot/webhook -H "Content-Type: application/json" -d "{\"object\":\"page\",\"entry\":[{\"messaging\":[{\"sender\":{\"id\":\"123\"},\"message\":{\"text\":\"test\"}}]}]}"
echo.
echo.

echo =====================================
echo TESTING COMPLETE
echo Check server logs for detailed diagnostics
echo =====================================
pause
