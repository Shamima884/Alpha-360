$root = 'c:\Users\USER\Documents\Project\Fourth project'
$dom  = Join-Path $root '_facultyui.dom.txt'
$err  = Join-Path $root '_facultyui.err.txt'
$out  = Join-Path $root '_facultyui.result.txt'
$lines = New-Object System.Collections.Generic.List[string]

$chromeArgs = @(
  '--headless=new','--disable-gpu','--no-sandbox','--no-first-run',
  '--user-data-dir=C:\Users\USER\AppData\Local\Temp\cst_facultyui',
  '--virtual-time-budget=20000','--dump-dom','http://localhost:8000/faculty/'
)
try {
  $p = Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
       -ArgumentList $chromeArgs -RedirectStandardOutput $dom -RedirectStandardError $err `
       -PassThru -Wait
  $lines.Add('chromeExit = ' + $p.ExitCode)
} catch { $lines.Add('chromeLaunchFailed = ' + $_.Exception.Message) }

$t = ''
if (Test-Path $dom) { $t = Get-Content $dom -Raw }
$lines.Add('domBytes = ' + $t.Length)
foreach ($n in @('sidebar','topbar','nav-item','Sarah Mitchell','Meridian','main')) {
  $lines.Add(('rendered contains "{0}" = {1}' -f $n, ($t -match [regex]::Escape($n))))
}
$lines.Add('navItems = ' + ([regex]::Matches($t, 'nav-item').Count))
$lines.Add('no JS crash text = ' + (-not ($t -match 'ReferenceError|is not defined')))
$m = [regex]::Match($t, '(?s)<title>(.*?)</title>')
$lines.Add('title = ' + $m.Groups[1].Value)
$lines | Out-File -FilePath $out -Encoding utf8
Write-Output 'done'