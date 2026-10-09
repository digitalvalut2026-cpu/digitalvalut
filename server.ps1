$port = 5173
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Digital Vault server listening on http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        $url = $req.Url.LocalPath
        if ($url -eq "/" -or [string]::IsNullOrWhiteSpace($url)) {
            $url = "/index.html"
        }
        $decoded = [System.Uri]::UnescapeDataString($url.TrimStart('/'))
        $localFile = Join-Path (Get-Location) ($decoded.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

        if (Test-Path $localFile -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localFile)
            $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".ico"  { "image/x-icon" }
                ".woff2"{ "font/woff2" }
                ".woff" { "font/woff" }
                default { "application/octet-stream" }
            }
            $res.ContentType = $mime
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            $res.AddHeader("Pragma", "no-cache")
            $res.AddHeader("Expires", "0")
            $res.ContentLength64 = $bytes.Length
            if ($req.HttpMethod -ne "HEAD") {
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $res.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $res.ContentLength64 = $err.Length
            if ($req.HttpMethod -ne "HEAD") {
                $res.OutputStream.Write($err, 0, $err.Length)
            }
        }
    } catch {
        Write-Host "Request exception: $($_.Exception.Message)"
    } finally {
        if ($res) {
            try { $res.Close() } catch {}
        }
    }
}
