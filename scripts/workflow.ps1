<#
.SYNOPSIS
    Kolibri Unified Full-Stack Workflow Automation CLI (Windows PowerShell)

.DESCRIPTION
    Streamlines development workflow across the frontend (Vue 2.7, KDS, Webpack),
    backend (Django, DRF, ValuesViewset), and database (SQLite / PostgreSQL, Morango).

.EXAMPLE
    .\scripts\workflow.ps1 setup
    .\scripts\workflow.ps1 dev
    .\scripts\workflow.ps1 dev -Plugin learn
    .\scripts\workflow.ps1 dev -Database postgres
    .\scripts\workflow.ps1 db migrate
    .\scripts\workflow.ps1 db seed
    .\scripts\workflow.ps1 test backend
    .\scripts\workflow.ps1 lint
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("setup", "dev", "db", "test", "lint", "clean", "help")]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$Subcommand = "",

    [Parameter()]
    [string]$Plugin = "",

    [Parameter()]
    [switch]$Hot,

    [Parameter()]
    [ValidateSet("sqlite", "postgres")]
    [string]$Database = "sqlite",

    [Parameter()]
    [string]$App = "",

    [Parameter()]
    [string]$Filter = "",

    [Parameter()]
    [switch]$AllFiles,

    [Parameter()]
    [string]$Files = ""
)

$ErrorActionPreference = "Stop"

# Determine repository root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
Set-Location $RepoRoot

function Write-Header([string]$Message) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "========================================================`n" -ForegroundColor Cyan
}

function Write-Success([string]$Message) {
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Info([string]$Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg([string]$Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites() {
    Write-Info "Checking development toolchain..."
    $missing = @()

    if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
        $missing += "Python 3.10+ (https://www.python.org/downloads/)"
    }
    if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
        $missing += "Git (https://git-scm.com/)"
    }
    if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
        Write-Info "Note: pnpm was not found on PATH. Ensure Node 20.x and pnpm are installed."
    }
    if (-not (Get-Command "uv" -ErrorAction SilentlyContinue)) {
        Write-Info "Note: uv recommended for fast Python virtual environment sync (https://docs.astral.sh/uv/)."
    }

    if ($missing.Count -gt 0) {
        Write-ErrorMsg "Missing required prerequisites:"
        $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        return $false
    }
    return $true
}

function Invoke-Setup() {
    Write-Header "Kolibri Workspace Setup"

    if (-not (Test-Prerequisites)) {
        Write-ErrorMsg "Please install required prerequisites and rerun setup."
        return
    }

    # 1. Python virtualenv & dependencies via uv
    Write-Info "Step 1/4: Installing Python packages..."
    if (Get-Command "uv" -ErrorAction SilentlyContinue) {
        uv sync --group dev --all-packages
        Write-Success "Python environment synchronized via uv."
    } else {
        Write-Info "uv not detected; checking python virtual environment..."
        if (-not (Test-Path ".venv")) {
            python -m venv .venv
        }
        & .venv\Scripts\pip install -r requirements.txt
    }

    # 2. Node & frontend packages
    Write-Info "Step 2/4: Installing Node dependencies via pnpm..."
    if (Get-Command "pnpm" -ErrorAction SilentlyContinue) {
        pnpm install
        Write-Success "Node packages installed."
    } else {
        Write-ErrorMsg "pnpm is required. Please install Node 20.x and run: npm install -g pnpm"
    }

    # 3. Pre-commit hooks
    Write-Info "Step 3/4: Setting up pre-commit / prek hooks..."
    if (Get-Command "prek" -ErrorAction SilentlyContinue) {
        prek install
        Write-Success "prek hooks installed."
    } elseif (Get-Command "uv" -ErrorAction SilentlyContinue) {
        uv run prek install
        Write-Success "prek hooks installed via uv."
    } else {
        Write-Info "prek will run once installed in virtual environment."
    }

    # 4. Database initialization
    Write-Info "Step 4/4: Initializing Kolibri database migrations..."
    $env:KOLIBRI_RUN_MODE = "dev"
    if (Get-Command "uv" -ErrorAction SilentlyContinue) {
        uv run kolibri configure setup
        uv run kolibri manage migrate --settings=kolibri.deployment.default.settings.dev
    } else {
        kolibri configure setup
        kolibri manage migrate --settings=kolibri.deployment.default.settings.dev
    }
    Write-Success "Database initialized successfully (including dev profiler tables)!"
    Write-Success "Setup completed. Run '.\scripts\workflow.ps1 dev' to start developing."
}

function Setup-Postgres() {
    Write-Info "Configuring PostgreSQL environment..."
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-ErrorMsg "Docker is required for PostgreSQL mode. Please start Docker Desktop."
        exit 1
    }

    Write-Info "Starting PostgreSQL container on port 15432..."
    docker compose up -d postgres

    $containerId = docker compose ps -q postgres
    Write-Info "Waiting for PostgreSQL container ($containerId) to be healthy..."
    $healthy = $false
    for ($i = 0; $i -lt 30; $i++) {
        $status = docker inspect --format='{{.State.Health.Status}}' $containerId
        if ($status -eq "healthy") {
            $healthy = $true
            break
        }
        Start-Sleep -Seconds 1
    }

    if (-not $healthy) {
        Write-ErrorMsg "PostgreSQL failed to become healthy. Check docker logs."
        exit 1
    }

    $env:KOLIBRI_DATABASE_ENGINE = "postgres"
    $env:KOLIBRI_DATABASE_NAME = "default"
    $env:KOLIBRI_DATABASE_USER = "postgres"
    $env:KOLIBRI_DATABASE_PASSWORD = "postgres"
    $env:KOLIBRI_DATABASE_HOST = "127.0.0.1"
    $env:KOLIBRI_DATABASE_PORT = "15432"
    Write-Success "PostgreSQL configured and running."
}

function Invoke-Dev() {
    Write-Header "Starting Kolibri Development Server"
    $env:KOLIBRI_RUN_MODE = "dev"

    if ($Database -eq "postgres") {
        Setup-Postgres
    } else {
        Write-Info "Using SQLite database engine (default)."
        Remove-Item env:KOLIBRI_DATABASE_ENGINE -ErrorAction SilentlyContinue
    }

    $cmd = "devserver"
    if ($Hot) {
        $cmd = "devserver-hot"
    }

    if ($Plugin) {
        Write-Info "Scoped build enabled: Only bundling and watching plugin '$Plugin'"
        pnpm run $cmd $Plugin
    } else {
        Write-Info "Full build: Bundling all plugins (pass -Plugin <name> to limit resource usage)"
        pnpm run $cmd
    }
}

function Invoke-Db([string]$Action) {
    if (-not $Action) {
        $Action = $Subcommand
    }
    if (-not $Action) {
        $Action = "status"
    }

    $env:KOLIBRI_RUN_MODE = "dev"

    switch ($Action.ToLower()) {
        "migrate" {
            Write-Header "Applying Database Migrations"
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run kolibri manage migrate
            } else {
                kolibri manage migrate
            }
            Write-Success "Migrations applied."
        }
        "makemigrations" {
            Write-Header "Generating Database Migrations"
            $targetApp = if ($App) { $App } else { "" }
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run kolibri manage makemigrations $targetApp
            } else {
                kolibri manage makemigrations $targetApp
            }
            Write-Success "Migration files generated."
        }
        "seed" {
            Write-Header "Seeding Database with Development Data"
            Write-Info "Running generateuserdata for initial test users and facilities..."
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run kolibri manage generateuserdata
            } else {
                kolibri manage generateuserdata
            }
            Write-Success "User data seeded."
            Write-Info "To seed rich content/lessons, ensure server is running and run:"
            Write-Info "  python integration_testing\load_testing\loadtest.py --server http://localhost:8000 --username admin --password admin setup"
        }
        "reset" {
            Write-Header "Resetting Development Database"
            $confirm = Read-Host "Are you sure you want to reset the database? All local test data will be lost (y/N)"
            if ($confirm -ne "y" -and $confirm -ne "Y") {
                Write-Info "Reset aborted."
                return
            }

            if ($Database -eq "postgres") {
                Write-Info "Resetting PostgreSQL volume..."
                docker compose down -v
                Setup-Postgres
                uv run kolibri manage migrate
            } else {
                Write-Info "Resetting SQLite database..."
                $home = if ($env:KOLIBRI_HOME) { $env:KOLIBRI_HOME } else { Join-Path $env:USERPROFILE ".kolibri" }
                if (Test-Path $home) {
                    Get-ChildItem -Path $home -Filter "*.sqlite3*" | Remove-Item -Force -ErrorAction SilentlyContinue
                }
                if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                    uv run kolibri configure setup
                } else {
                    kolibri configure setup
                }
            }
            Write-Success "Database has been reset and migrated."
        }
        "status" {
            Write-Header "Database Status"
            $engine = if ($env:KOLIBRI_DATABASE_ENGINE) { $env:KOLIBRI_DATABASE_ENGINE } else { "sqlite" }
            Write-Host "Active Engine: $engine" -ForegroundColor Cyan
            if ($engine -eq "postgres") {
                Write-Host "PostgreSQL Host: 127.0.0.1:15432 (Database: default)" -ForegroundColor Cyan
            } else {
                $home = if ($env:KOLIBRI_HOME) { $env:KOLIBRI_HOME } else { Join-Path $env:USERPROFILE ".kolibri" }
                Write-Host "SQLite Directory: $home" -ForegroundColor Cyan
            }
            Write-Host "`nPending Migrations Check:" -ForegroundColor Cyan
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run kolibri manage showmigrations --plan
            } else {
                kolibri manage showmigrations --plan
            }
        }
        "switch" {
            Write-Header "Switching Database Backend"
            $target = $Subcommand
            if (-not $target -or ($target -ne "sqlite" -and $target -ne "postgres")) {
                Write-ErrorMsg "Specify target engine: .\scripts\workflow.ps1 db switch sqlite OR postgres"
                return
            }
            if ($target -eq "postgres") {
                Setup-Postgres
            } else {
                Remove-Item env:KOLIBRI_DATABASE_ENGINE -ErrorAction SilentlyContinue
                Write-Success "Switched to SQLite default engine."
            }
        }
        Default {
            Write-ErrorMsg "Unknown db action '$Action'. Valid actions: migrate, makemigrations, seed, reset, status, switch."
        }
    }
}

function Invoke-Test() {
    Write-Header "Running Tests"
    $target = if ($Subcommand) { $Subcommand.ToLower() } else { "all" }

    switch ($target) {
        "backend" {
            Write-Info "Executing Backend Unit Tests (pytest)..."
            $pytestArgs = @()
            if ($Filter) { $pytestArgs += "-k", $Filter }
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run pytest @pytestArgs
            } else {
                pytest @pytestArgs
            }
        }
        "frontend" {
            Write-Info "Executing Frontend Unit Tests (Jest)..."
            if ($Filter) {
                pnpm test-jest --testPathPattern $Filter
            } else {
                pnpm test-jest
            }
        }
        "all" {
            Write-Info "Executing Backend Tests..."
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv run pytest
            } else {
                pytest
            }
            Write-Info "Executing Frontend Tests..."
            pnpm test-jest
            Write-Success "All test suites executed!"
        }
        Default {
            Write-ErrorMsg "Unknown test target '$target'. Use 'backend', 'frontend', or 'all'."
        }
    }
}

function Invoke-Lint() {
    Write-Header "Running Linters and Formatting Checks"
    if ($AllFiles) {
        Write-Info "Running prek across all files..."
        prek run --all-files
    } elseif ($Files) {
        Write-Info "Running prek on files: $Files"
        prek run --files $Files
    } else {
        Write-Info "Running prek on staged files..."
        prek run
    }
}

function Invoke-Clean() {
    Write-Header "Cleaning Build Artifacts and Temporary Files"
    pnpm run clean
    Get-ChildItem -Path . -Include *.pyc, *.pyo -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Success "Workspace cleaned."
}

function Show-Help() {
    Write-Header "Kolibri Unified Full-Stack Workflow CLI"
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\scripts\workflow.ps1 <command> [options]`n"

    Write-Host "COMMANDS:" -ForegroundColor Yellow
    Write-Host "  setup                     Initialize entire workspace (Python/uv, Node/pnpm, prek, DB)"
    Write-Host "  dev [options]             Run full-stack server (Webpack watcher + Django devserver)"
    Write-Host "  db <action> [options]     Manage database (migrate, makemigrations, seed, reset, status, switch)"
    Write-Host "  test [target]             Run test suites (backend, frontend, or all)"
    Write-Host "  lint [options]            Run prek linters and formatters"
    Write-Host "  clean                     Clean build assets and temporary cache"
    Write-Host "  help                      Display this help screen`n"

    Write-Host "DEV OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Plugin <name>            Scope frontend bundling to single plugin (e.g. -Plugin learn)"
    Write-Host "  -Hot                      Enable hot reload (webpack hot module replacement)"
    Write-Host "  -Database <sqlite|postgres> Choose database engine (default: sqlite)`n"

    Write-Host "DB ACTIONS:" -ForegroundColor Yellow
    Write-Host "  .\scripts\workflow.ps1 db migrate"
    Write-Host "  .\scripts\workflow.ps1 db makemigrations [-App <app_name>]"
    Write-Host "  .\scripts\workflow.ps1 db seed"
    Write-Host "  .\scripts\workflow.ps1 db reset"
    Write-Host "  .\scripts\workflow.ps1 db status"
    Write-Host "  .\scripts\workflow.ps1 db switch <sqlite|postgres>`n"

    Write-Host "TEST OPTIONS:" -ForegroundColor Yellow
    Write-Host "  .\scripts\workflow.ps1 test backend [-Filter <pattern>]"
    Write-Host "  .\scripts\workflow.ps1 test frontend [-Filter <pattern>]"
    Write-Host "  .\scripts\workflow.ps1 test all`n"

    Write-Host "LINT OPTIONS:" -ForegroundColor Yellow
    Write-Host "  .\scripts\workflow.ps1 lint"
    Write-Host "  .\scripts\workflow.ps1 lint -AllFiles"
    Write-Host "  .\scripts\workflow.ps1 lint -Files <filepath>`n"
}

# Main Dispatcher
switch ($Command.ToLower()) {
    "setup" { Invoke-Setup }
    "dev"   { Invoke-Dev }
    "db"    { Invoke-Db $Subcommand }
    "test"  { Invoke-Test }
    "lint"  { Invoke-Lint }
    "clean" { Invoke-Clean }
    Default { Show-Help }
}
