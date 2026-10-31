#!/usr/bin/env bash
# ==============================================================================
# Kolibri Unified Full-Stack Workflow Automation CLI (POSIX Bash)
# Streamlines development across Frontend (Vue 2.7/KDS), Backend (Django/DRF),
# and Database (SQLite / PostgreSQL / Morango).
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

write_header() {
    echo -e "\n${CYAN}========================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================================\n${NC}"
}

write_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

write_info() {
    echo -e "${YELLOW}[INFO] $1${NC}"
}

write_error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

test_prerequisites() {
    write_info "Checking development toolchain..."
    local missing=0

    if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
        write_error "Python 3.10+ is required (https://www.python.org/)"
        missing=1
    fi
    if ! command -v git &>/dev/null; then
        write_error "Git is required (https://git-scm.com/)"
        missing=1
    fi
    if ! command -v pnpm &>/dev/null; then
        write_info "Note: pnpm was not found on PATH. Install Node 20.x and pnpm."
    fi
    if ! command -v uv &>/dev/null; then
        write_info "Note: uv recommended for fast Python virtual environment sync (https://docs.astral.sh/uv/)."
    fi

    if [[ $missing -ne 0 ]]; then
        return 1
    fi
    return 0
}

setup_postgres() {
    write_info "Configuring PostgreSQL environment..."
    if ! command -v docker &>/dev/null; then
        write_error "Docker is required for PostgreSQL mode. Please start Docker."
        exit 1
    fi

    write_info "Starting PostgreSQL container on port 15432..."
    docker compose up -d postgres

    local container_id
    container_id=$(docker compose ps -q postgres)
    write_info "Waiting for PostgreSQL container (${container_id}) to be healthy..."

    local healthy=0
    for _ in {1..30}; do
        local status
        status=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "unhealthy")
        if [[ "$status" == "healthy" ]]; then
            healthy=1
            break
        fi
        sleep 1
    done

    if [[ $healthy -ne 1 ]]; then
        write_error "PostgreSQL container failed to become healthy. Check docker compose logs."
        exit 1
    fi

    export KOLIBRI_DATABASE_ENGINE="postgres"
    export KOLIBRI_DATABASE_NAME="default"
    export KOLIBRI_DATABASE_USER="postgres"
    export KOLIBRI_DATABASE_PASSWORD="postgres"
    export KOLIBRI_DATABASE_HOST="127.0.0.1"
    export KOLIBRI_DATABASE_PORT="15432"
    write_success "PostgreSQL configured and running."
}

invoke_setup() {
    write_header "Kolibri Workspace Setup"

    if ! test_prerequisites; then
        write_error "Please install missing prerequisites and retry."
        exit 1
    fi

    write_info "Step 1/4: Synchronizing Python dependencies..."
    if command -v uv &>/dev/null; then
        uv sync --group dev --all-packages
        write_success "Python virtual environment synchronized via uv."
    else
        if [[ ! -d ".venv" ]]; then
            python3 -m venv .venv || python -m venv .venv
        fi
        source .venv/bin/activate
        pip install -r requirements.txt
    fi

    write_info "Step 2/4: Installing Node dependencies via pnpm..."
    if command -v pnpm &>/dev/null; then
        pnpm install
        write_success "Node packages installed."
    else
        write_error "pnpm is required. Please install Node 20.x and run: npm install -g pnpm"
    fi

    write_info "Step 3/4: Setting up pre-commit / prek hooks..."
    if command -v prek &>/dev/null; then
        prek install
        write_success "prek hooks installed."
    elif command -v uv &>/dev/null; then
        uv run prek install
        write_success "prek hooks installed via uv."
    fi

    write_info "Step 4/4: Initializing Kolibri database migrations..."
    export KOLIBRI_RUN_MODE="dev"
    if command -v uv &>/dev/null; then
        uv run kolibri configure setup
    else
        kolibri configure setup
    fi
    write_success "Database initialized successfully!"
    write_success "Setup complete. Run './scripts/workflow.sh dev' to launch the stack."
}

invoke_dev() {
    write_header "Starting Kolibri Development Server"
    export KOLIBRI_RUN_MODE="dev"

    local database="sqlite"
    local plugin=""
    local hot=0

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --database|-d)
                database="$2"
                shift 2
                ;;
            --plugin|-p)
                plugin="$2"
                shift 2
                ;;
            --hot)
                hot=1
                shift
                ;;
            *)
                if [[ -z "$plugin" && "$1" != -* ]]; then
                    plugin="$1"
                fi
                shift
                ;;
        esac
    done

    if [[ "$database" == "postgres" ]]; then
        setup_postgres
    else
        write_info "Using SQLite database engine (default)."
        unset KOLIBRI_DATABASE_ENGINE
    fi

    local cmd="devserver"
    if [[ $hot -eq 1 ]]; then
        cmd="devserver-hot"
    fi

    if [[ -n "$plugin" ]]; then
        write_info "Scoped build enabled: Only bundling and watching plugin '$plugin'"
        pnpm run "$cmd" "$plugin"
    else
        write_info "Full build: Bundling all plugins (pass --plugin <name> to limit resource usage)"
        pnpm run "$cmd"
    fi
}

invoke_db() {
    local action="${1:-status}"
    shift || true
    export KOLIBRI_RUN_MODE="dev"

    case "$action" in
        migrate)
            write_header "Applying Database Migrations"
            if command -v uv &>/dev/null; then
                uv run kolibri manage migrate
            else
                kolibri manage migrate
            fi
            write_success "Migrations applied."
            ;;
        makemigrations)
            write_header "Generating Database Migrations"
            local app="$1"
            if command -v uv &>/dev/null; then
                uv run kolibri manage makemigrations ${app:+"$app"}
            else
                kolibri manage makemigrations ${app:+"$app"}
            fi
            write_success "Migration files generated."
            ;;
        seed)
            write_header "Seeding Database with Development Data"
            write_info "Generating initial user accounts and facility data..."
            if command -v uv &>/dev/null; then
                uv run kolibri manage generateuserdata
            else
                kolibri manage generateuserdata
            fi
            write_success "User data seeded."
            write_info "To seed rich content/lessons with QA channels, run while server is active:"
            write_info "  python integration_testing/load_testing/loadtest.py --server http://localhost:8000 --username admin --password admin setup"
            ;;
        reset)
            write_header "Resetting Development Database"
            read -p "Are you sure you want to reset the database? All local test data will be lost (y/N): " confirm
            if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
                write_info "Reset aborted."
                return 0
            fi

            if [[ "${KOLIBRI_DATABASE_ENGINE:-}" == "postgres" ]]; then
                write_info "Resetting PostgreSQL container volume..."
                docker compose down -v
                setup_postgres
                uv run kolibri manage migrate
            else
                write_info "Resetting SQLite database..."
                local home="${KOLIBRI_HOME:-$HOME/.kolibri}"
                if [[ -d "$home" ]]; then
                    rm -f "$home"/*.sqlite3*
                fi
                if command -v uv &>/dev/null; then
                    uv run kolibri configure setup
                else
                    kolibri configure setup
                fi
            fi
            write_success "Database reset and migrated."
            ;;
        status)
            write_header "Database Status"
            local engine="${KOLIBRI_DATABASE_ENGINE:-sqlite}"
            echo -e "${CYAN}Active Engine: ${engine}${NC}"
            if [[ "$engine" == "postgres" ]]; then
                echo -e "${CYAN}PostgreSQL Host: 127.0.0.1:15432 (Database: default)${NC}"
            else
                local home="${KOLIBRI_HOME:-$HOME/.kolibri}"
                echo -e "${CYAN}SQLite Directory: ${home}${NC}"
            fi
            echo -e "\n${CYAN}Pending Migrations Check:${NC}"
            if command -v uv &>/dev/null; then
                uv run kolibri manage showmigrations --plan
            else
                kolibri manage showmigrations --plan
            fi
            ;;
        switch)
            local target="$1"
            if [[ "$target" == "postgres" ]]; then
                setup_postgres
            elif [[ "$target" == "sqlite" ]]; then
                unset KOLIBRI_DATABASE_ENGINE
                write_success "Switched to SQLite default engine."
            else
                write_error "Specify target engine: ./scripts/workflow.sh db switch sqlite OR postgres"
            fi
            ;;
        *)
            write_error "Unknown db action '$action'. Valid actions: migrate, makemigrations, seed, reset, status, switch."
            exit 1
            ;;
    esac
}

invoke_test() {
    local target="${1:-all}"
    shift || true

    local filter=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --filter|-k)
                filter="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done

    write_header "Running Tests ($target)"

    case "$target" in
        backend)
            write_info "Executing Backend Unit Tests (pytest)..."
            if command -v uv &>/dev/null; then
                uv run pytest ${filter:+-k "$filter"}
            else
                pytest ${filter:+-k "$filter"}
            fi
            ;;
        frontend)
            write_info "Executing Frontend Unit Tests (Jest)..."
            if [[ -n "$filter" ]]; then
                pnpm test-jest --testPathPattern "$filter"
            else
                pnpm test-jest
            fi
            ;;
        all)
            write_info "Executing Backend Tests..."
            if command -v uv &>/dev/null; then
                uv run pytest
            else
                pytest
            fi
            write_info "Executing Frontend Tests..."
            pnpm test-jest
            write_success "All test suites executed!"
            ;;
        *)
            write_error "Unknown test target '$target'. Use 'backend', 'frontend', or 'all'."
            exit 1
            ;;
    esac
}

invoke_lint() {
    write_header "Running Linters and Code Quality Checks"
    local all_files=0
    local files=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --all-files)
                all_files=1
                shift
                ;;
            --files)
                files="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done

    if [[ $all_files -eq 1 ]]; then
        write_info "Running prek across all files..."
        prek run --all-files
    elif [[ -n "$files" ]]; then
        write_info "Running prek on files: $files"
        prek run --files "$files"
    else
        write_info "Running prek on staged files..."
        prek run
    fi
}

invoke_clean() {
    write_header "Cleaning Build Artifacts and Temporary Files"
    pnpm run clean
    find . -type f \( -name "*.pyc" -o -name "*.pyo" \) -delete
    write_success "Workspace cleaned."
}

show_help() {
    write_header "Kolibri Unified Full-Stack Workflow CLI"
    echo -e "${YELLOW}USAGE:${NC}"
    echo -e "  ./scripts/workflow.sh <command> [options]\n"

    echo -e "${YELLOW}COMMANDS:${NC}"
    echo -e "  setup                      Initialize entire workspace (Python/uv, Node/pnpm, prek, DB)"
    echo -e "  dev [options]              Run full-stack server (Webpack watcher + Django devserver)"
    echo -e "  db <action> [options]      Manage database (migrate, makemigrations, seed, reset, status, switch)"
    echo -e "  test [target] [options]    Run test suites (backend, frontend, or all)"
    echo -e "  lint [options]             Run prek linters and formatters"
    echo -e "  clean                      Clean build assets and temporary cache"
    echo -e "  help                       Display this help screen\n"

    echo -e "${YELLOW}DEV OPTIONS:${NC}"
    echo -e "  --plugin, -p <name>        Scope frontend bundling to single plugin (e.g. --plugin learn)"
    echo -e "  --hot                      Enable hot reload (HMR)"
    echo -e "  --database, -d <engine>    Choose database engine (sqlite or postgres)\n"

    echo -e "${YELLOW}DB ACTIONS:${NC}"
    echo -e "  ./scripts/workflow.sh db migrate"
    echo -e "  ./scripts/workflow.sh db makemigrations [app_name]"
    echo -e "  ./scripts/workflow.sh db seed"
    echo -e "  ./scripts/workflow.sh db reset"
    echo -e "  ./scripts/workflow.sh db status"
    echo -e "  ./scripts/workflow.sh db switch <sqlite|postgres>\n"

    echo -e "${YELLOW}TEST OPTIONS:${NC}"
    echo -e "  ./scripts/workflow.sh test backend [--filter <pattern>]"
    echo -e "  ./scripts/workflow.sh test frontend [--filter <pattern>]"
    echo -e "  ./scripts/workflow.sh test all\n"

    echo -e "${YELLOW}LINT OPTIONS:${NC}"
    echo -e "  ./scripts/workflow.sh lint"
    echo -e "  ./scripts/workflow.sh lint --all-files"
    echo -e "  ./scripts/workflow.sh lint --files <filepath>\n"
}

COMMAND="${1:-help}"
shift || true

case "${COMMAND,,}" in
    setup) invoke_setup "$@" ;;
    dev)   invoke_dev "$@" ;;
    db)    invoke_db "$@" ;;
    test)  invoke_test "$@" ;;
    lint)  invoke_lint "$@" ;;
    clean) invoke_clean "$@" ;;
    *)     show_help ;;
esac
