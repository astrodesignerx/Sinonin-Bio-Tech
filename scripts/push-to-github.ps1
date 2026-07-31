# Pushes this project to a new GitHub repository on the account you're
# signed in to with the GitHub CLI (gh). Run once from the project root:
#
#   .\scripts\push-to-github.ps1                          # default name + public
#   .\scripts\push-to-github.ps1 -Name sinonin-biotech    # explicit name
#   .\scripts\push-to-github.ps1 -Private                 # private repo
#   .\scripts\push-to-github.ps1 -Description "..."       # custom description
#
# On first run gh will open a browser for you to sign in. After that the
# script creates the repo and pushes.

[CmdletBinding()]
param(
  [string]$Name = "sinonin-biotech",
  [switch]$Private,
  [string]$Description = "Sinonin Biotech website — Next.js 16 + Tailwind v4 + next-intl (EN/DE). Hero, Expertise, Training, Market Reports, About, Contact, Blog, Impressum, Datenschutz."
)

$ErrorActionPreference = "Stop"

# 1. Verify gh CLI is available
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  $candidates = @(
    "C:\Program Files\GitHub CLI\gh.exe",
    "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { $gh = (Get-Command $p); break }
  }
}
if (-not $gh) {
  Write-Host "GitHub CLI (gh) is not installed." -ForegroundColor Red
  Write-Host "Install it with:  winget install --id GitHub.cli"
  exit 1
}

# 2. Verify we're in a git repo with at least one commit
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not inside a git repository. Run this from the project root." -ForegroundColor Red
  exit 1
}
$commitCount = (git rev-list --count HEAD).Trim()
if ($commitCount -lt 1) {
  Write-Host "No commits yet. Commit first, then re-run." -ForegroundColor Red
  exit 1
}

# 3. Check auth; if not logged in, run the browser flow
$authStatus = & $gh.Source auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "You're not signed in to gh. Opening the browser for sign-in..." -ForegroundColor Cyan
  & $gh.Source auth login --web
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Sign-in did not complete." -ForegroundColor Red
    exit 1
 }
}

# 4. Detect current remote (don't clobber if user already has origin)
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
  Write-Host "This repo already has an 'origin' remote: $existingRemote" -ForegroundColor Yellow
  Write-Host "Remove it with:  git remote remove origin"
  exit 1
}

# 5. Create the repo and push
$visibility = if ($Private) { "--private" } else { "--public" }
Write-Host ""
Write-Host "Creating GitHub repo: $Name ($(if ($Private) {'private'} else {'public'}))" -ForegroundColor Cyan
Write-Host "Pushing current branch to it..." -ForegroundColor Cyan
Write-Host ""

& $gh.Source repo create $Name $visibility --source=. --remote=origin --description="$Description" --push
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Repo creation failed. See gh output above." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Green
Write-Host "  1. Open the new repo (URL printed above) on GitHub."
Write-Host "  2. Verify the files are there."
Write-Host "  3. Follow DEPLOY.md to import the repo into Vercel and add the custom domain."
