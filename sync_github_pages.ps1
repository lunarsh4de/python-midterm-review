$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $repoRoot

git add -- .gitignore .github/workflows/deploy-pages.yml output sync_github_pages.ps1

$stagedFiles = @(git diff --cached --name-only)
if ($stagedFiles.Count -eq 0) {
    Write-Host "No website changes to sync."
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Update review site ($timestamp)"
git push origin main

Write-Host "GitHub Pages sync pushed successfully."
