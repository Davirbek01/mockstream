$headers = @{
  "apikey" = "sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2"
  "Authorization" = "Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2"
}
$urls = @(
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/results?select=id&limit=1",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/premium_emails?select=email&limit=1",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/candidates?select=student_name&limit=1",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/mock_codes?select=code&limit=1",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/site_settings?select=key&limit=1",
  "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/writing_plus_submissions?select=id&limit=1"
)

foreach ($url in $urls) {
  Write-Host "--- PROBING: $url ---"
  try {
    $r = Invoke-WebRequest -Uri $url -Headers $headers -Method GET -ErrorAction Stop -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode)"
    $c = $r.Content
    if ($c.Length -gt 500) { $c = $c.Substring(0, 500) }
    Write-Host "BODY: $c"
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      Write-Host "STATUS: $([int]$resp.StatusCode)"
      $stream = $resp.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $c = $reader.ReadToEnd()
      if ($c.Length -gt 500) { $c = $c.Substring(0, 500) }
      Write-Host "BODY: $c"
    } else {
      Write-Host "ERROR: $_"
    }
  }
}

Write-Host "--- PROBING: No Headers ---"
$noHeaderUrl = "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/results?select=id&limit=1"
try {
  $r = Invoke-WebRequest -Uri $noHeaderUrl -Method GET -ErrorAction Stop -UseBasicParsing
  Write-Host "STATUS: $($r.StatusCode)"
  $c = $r.Content
  if ($c.Length -gt 500) { $c = $c.Substring(0, 500) }
  Write-Host "BODY: $c"
} catch {
   $resp = $_.Exception.Response
    if ($resp) {
      Write-Host "STATUS: $([int]$resp.StatusCode)"
      $stream = $resp.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $c = $reader.ReadToEnd()
      if ($c.Length -gt 500) { $c = $c.Substring(0, 500) }
      Write-Host "BODY: $c"
    } else {
      Write-Host "ERROR: $_"
    }
}
