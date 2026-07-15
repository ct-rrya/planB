Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "MESSENGER WEBHOOK TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test 1: GET Verification (Valid Token)" -ForegroundColor Yellow
Write-Host "Expected: 12345" -ForegroundColor Green
Write-Host ""
$response1 = Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345" -UseBasicParsing
Write-Host "Response: $($response1.Content)" -ForegroundColor White
Write-Host "Status: $($response1.StatusCode)" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test 2: GET Verification (Invalid Token)" -ForegroundColor Yellow
Write-Host "Expected: 403 Forbidden" -ForegroundColor Green
Write-Host ""
try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345" -UseBasicParsing
    Write-Host "Response: $($response2.Content)" -ForegroundColor White
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test 3: POST Webhook Event" -ForegroundColor Yellow
Write-Host "Expected: EVENT_RECEIVED" -ForegroundColor Green
Write-Host ""
$body = @{
    object = "page"
    entry = @(
        @{
            messaging = @(
                @{
                    sender = @{ id = "123" }
                    message = @{ text = "test" }
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$response3 = Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot/webhook" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
Write-Host "Response: $($response3.Content)" -ForegroundColor White
Write-Host "Status: $($response3.StatusCode)" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TESTING COMPLETE" -ForegroundColor Green
Write-Host "Check server logs for detailed diagnostics" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
