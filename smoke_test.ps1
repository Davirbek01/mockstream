$centers = @("mockstream","bek","global","niners","muzaffars","general")
$skills  = @("reading","listening","writing","speaking","full_mock")
$url = "https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/send-to-telegram"
$results = @()
foreach ($c in $centers) {
  foreach ($s in $skills) {
    $caption = "Smoke test - $c/$s - please ignore"
    $body = "testIdentifier=$c&skill=$s&caption=$([uri]::EscapeDataString($caption))"
    try {
      $r = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
      $results += [pscustomobject]@{ Center=$c; Skill=$s; Status="OK"; Detail=$r.routedTo.title }
    } catch {
      $detail = $_.Exception.Message
      if ($_.Exception.Response) {
        try { $stream = $_.Exception.Response.GetResponseStream(); $reader = New-Object System.IO.StreamReader($stream); $detail = $reader.ReadToEnd() } catch {}
      }
      $results += [pscustomobject]@{ Center=$c; Skill=$s; Status="FAIL"; Detail=$detail }
    }
    Start-Sleep -Milliseconds 250
  }
}
$results | Format-Table -AutoSize | Out-String -Width 200
$ok = ($results | Where-Object Status -eq "OK").Count
$fail = ($results | Where-Object Status -eq "FAIL").Count
Write-Host "TOTAL: $ok OK / $fail FAIL of $($results.Count)"
$results | Where-Object Status -eq "FAIL" | ForEach-Object { Write-Host "FAIL: $($_.Center)/$($_.Skill) -> $($_.Detail)" }
