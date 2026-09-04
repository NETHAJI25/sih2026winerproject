try{
  Invoke-WebRequest -Uri 'https://dummyimage.com/192x192/F5A623/fff&text=HC' -OutFile 'public/pwa-192.png' -UseBasicParsing
  Write-Host "ok192"
  Invoke-WebRequest -Uri 'https://dummyimage.com/512x512/F5A623/fff&text=HC' -OutFile 'public/pwa-512.png' -UseBasicParsing
  Write-Host "ok512"
  Get-ChildItem public/pwa*.png | Select-Object Name,Length | Format-Table -AutoSize
} catch {
  Write-Host "fail $($_.Exception.Message)"
  # fallback: create 1x1 png via base64
  $b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
  [IO.File]::WriteAllBytes("public/pwa-192.png", [Convert]::FromBase64String($b64))
  [IO.File]::WriteAllBytes("public/pwa-512.png", [Convert]::FromBase64String($b64))
  Write-Host "created fallback 1x1"
}
