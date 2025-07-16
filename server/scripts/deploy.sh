#!/bin/bash

# =============================================================================
# THE SOCIAL BACKEND - DEPLOYMENT SCRIPT
# =============================================================================
# Production-ready deployment script with automatic container engine detection
# Supports both Docker and Podman environments
# 
# Usage: ./scripts/deploy.sh [up|down|build|logs|status]
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
PROD_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# CONTAINER ENGINE DETECTION
# =============================================================================

detect_container_engine() {
    local engine=""
    local compose_cmd=""
    
    # Check if docker command is actually Podman in disguise
    if command -v docker >/dev/null 2>&1; then
        local docker_version_output
        docker_version_output=$(docker --version 2>/dev/null || echo "")
        if [[ "$docker_version_output" == *"podman"* ]]; then
            engine="podman"
            if command -v podman-compose >/dev/null 2>&1; then
                compose_cmd="podman-compose"
            fi
        else
            # Real Docker - check if daemon is accessible
            if docker info >/dev/null 2>&1; then
                engine="docker"
                if command -v docker-compose >/dev/null 2>&1; then
                    compose_cmd="docker-compose"
                elif docker compose version >/dev/null 2>&1; then
                    compose_cmd="docker compose"
                fi
            fi
        fi
    fi
    
    # Check for Podman directly if no engine detected yet
    if [[ -z "$engine" ]] && command -v podman >/dev/null 2>&1; then
        engine="podman"
        if command -v podman-compose >/dev/null 2>&1; then
            compose_cmd="podman-compose"
        fi
    fi
    
    # Validate detection
    if [[ -z "$engine" ]]; then
        log_error "No container engine found! Please install Docker or Podman."
        exit 1
    fi
    
    if [[ -z "$compose_cmd" ]]; then
        log_error "No compose tool found for $engine! Please install ${engine}-compose."
        log_info "For Podman: sudo apt install podman-compose"
        log_info "For Docker: sudo apt install docker-compose"
        exit 1
    fi
    
    echo "$engine:$compose_cmd"
}

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================

validate_environment() {
    local engine="$1"
    local compose_cmd="$2"
    
    log_info "Validating $engine environment..."
    
    # Check compose files exist
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "docker-compose.yml not found at $COMPOSE_FILE"
        exit 1
    fi
    
    # Environment-specific validations
    case "$engine" in
        "docker")
            # Check Docker daemon
            if ! docker info >/dev/null 2>&1; then
                log_error "Docker daemon not running or not accessible"
                log_info "Try: sudo systemctl start docker"
                exit 1
            fi
            ;;
        "podman")
            # Podman doesn't require daemon, but check basic functionality
            if ! podman info >/dev/null 2>&1; then
                log_error "Podman not accessible"
                exit 1
            fi
            ;;
    esac
    
    # Validate compose syntax
    log_info "Validating compose file syntax..."
    if ! $compose_cmd config >/dev/null 2>&1; then
        log_error "Invalid docker-compose.yml syntax"
        exit 1
    fi
    
    log_success "$engine environment validated successfully"
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================

deploy_up() {
    local compose_cmd="$1"
    local engine="$2"
    
    log_info "Starting deployment with $engine..."
    
    # Create necessary directories
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Start services
    log_info "Starting services..."
    $compose_cmd up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service status
    $compose_cmd ps
    
    log_success "Deployment completed successfully!"
    log_info "Services available at:"
    log_info "  - Application: http://localhost:3000"
    log_info "  - PostgreSQL: localhost:5432"
    log_info "  - Redis: localhost:6379"
    log_info "  - Nginx: http://localhost:80"
}

deploy_down() {
    local compose_cmd="$1"
    
    log_info "Stopping deployment..."
    $compose_cmd down
    log_success "Deployment stopped successfully!"
}

deploy_build() {
    local compose_cmd="$1"
    
    log_info "Building services..."
    $compose_cmd build --no-cache
    log_success "Build completed successfully!"
}

deploy_logs() {
    local compose_cmd="$1"
    
    log_info "Showing service logs..."
    $compose_cmd logs -f
}

deploy_status() {
    local compose_cmd="$1"
    
    log_info "Service status:"
    $compose_cmd ps
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

main() {
    local action="${1:-up}"
    
    log_info "THE SOCIAL BACKEND - DEPLOYMENT SCRIPT"
    log_info "========================================"
    
    # Detect container engine
    local detection_result
    detection_result=$(detect_container_engine)
    local engine="${detection_result%:*}"
    local compose_cmd="${detection_result#*:}"
    
    log_success "Detected: $engine with $compose_cmd"
    
    # Log environment details
    if [[ "$engine" == "podman" ]]; then
        local docker_version_output
        docker_version_output=$(docker --version 2>/dev/null || echo "")
        if [[ "$docker_version_output" == *"podman"* ]]; then
            log_warning "Note: 'docker' command is Podman emulation, using podman-compose"
        fi
    fi
    
    # Validate environment
    validate_environment "$engine" "$compose_cmd"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Execute action
    case "$action" in
        "up"|"start")
            deploy_up "$compose_cmd" "$engine"
            ;;
        "down"|"stop")
            deploy_down "$compose_cmd"
            ;;
        "build")
            deploy_build "$compose_cmd"
            ;;
        "logs")
            deploy_logs "$compose_cmd"
            ;;
        "status"|"ps")
            deploy_status "$compose_cmd"
            ;;
        *)
            log_error "Unknown action: $action"
            log_info "Usage: $0 [up|down|build|logs|status]"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@" 