
$tcp = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($tcp) {
    Write-Host "Found process $($tcp.OwningProcess) on port 5000. Killing it..."
    Stop-Process -Id $tcp.OwningProcess -Force
    Write-Host "Process killed."
} else {
    Write-Host "No process found on port 5000."
}
