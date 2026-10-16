# ERP Intelligence AI · Windows Companion Read-Only Discovery v0.1
# Windows PowerShell 5.1, same Windows account as SAP GUI. Never uses SAP scripting or SAP passwords.
[CmdletBinding()]
param([switch]$SaveJson)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
try {
  $processes = @(Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match '^(sapgui|saplogon|saplgpad)$'
  })
  $guiProcesses = @($processes | Where-Object {
    ($_.MainWindowHandle -ne [IntPtr]::Zero) -or ($_.ProcessName -eq 'sapgui')
  })
  $report = [ordered]@{
    schemaVersion=1; type='SAP_GUI_WINDOWS_DISCOVERY'
    capturedAtUtc=[DateTime]::UtcNow.ToString('o')
    localSapGuiProcessObserved=($processes.Count -gt 0)
    sapGuiProcessCount=[int]$processes.Count
    sapGuiWindowProcessCount=[int]$guiProcesses.Count
    sapSessionVerified=$false
    sidVerified=$false
    tcodeVerified=$false
    sapGuiScriptingUsed=$false
    sapWritesPerformed=$false
    screenshotsCaptured=$false
    dataUploaded=$false
    explanation='Windows process only; actual SAP server/session was not queried.'
  }
  $report | Format-List | Out-String | Write-Host
  if($SaveJson){
    $file=Join-Path $env:USERPROFILE 'Downloads\sap-gui-local-discovery.json'
    $report | ConvertTo-Json -Depth 4 | Set-Content -Path $file -Encoding UTF8
    Write-Host "Local report saved: $file"
  }
  if($processes.Count -eq 0){Write-Warning 'No SAP GUI processes running.'}
  else{Write-Host 'SAP GUI process observed; session and T-code NOT verified.' -ForegroundColor Green}
}catch{
 Write-Warning ('Read-only process discovery failed: ' + $_.Exception.Message)
 exit 1
}
