#!/bin/bash
# =============================================================================
# GitHub Actions Secrets Setup Script
# =============================================================================
# This script helps configure required secrets and variables for CI/CD workflows
# Run this script to validate your setup before pushing to GitHub
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitHub Actions Secrets Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# Required Secrets
# =============================================================================

echo -e "${YELLOW}REQUIRED SECRETS${NC}"
echo "Configure these in GitHub: Settings → Secrets and variables → Actions"
echo ""

declare -A SECRETS=(
    ["KUBE_CONFIG"]="Base64-encoded Kubernetes kubeconfig file"
    ["OPENROUTER_API_KEY"]="OpenRouter API key for AI model access"
    ["POSTGRES_PASSWORD"]="PostgreSQL database password"
    ["GMAIL_CREDENTIALS_JSON"]="Gmail API credentials (base64 encoded JSON)"
    ["TWILIO_ACCOUNT_SID"]="Twilio Account SID for WhatsApp"
    ["TWILIO_AUTH_TOKEN"]="Twilio Auth Token for WhatsApp"
    ["TWILIO_WHATSAPP_NUMBER"]="Twilio WhatsApp number (whatsapp:+14155238886)"
)

echo "Secret Name | Description"
echo "------------|------------"
for secret in "${!SECRETS[@]}"; do
    echo -e "${YELLOW}$secret${NC} | ${SECRETS[$secret]}"
done

echo ""
echo -e "${BLUE}To set a secret:${NC}"
echo "1. Go to https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Enter the secret name and value"
echo "4. Click 'Add secret'"
echo ""

# =============================================================================
# Required Variables
# =============================================================================

echo -e "${YELLOW}REQUIRED VARIABLES${NC}"
echo "Configure these in GitHub: Settings → Secrets and variables → Actions → Variables"
echo ""

declare -A VARIABLES=(
    ["DOMAIN"]="Your domain for ingress (e.g., yourdomain.com)"
    ["REGISTRY"]="Container registry URL (e.g., ghcr.io/hamzasheikh768)"
)

echo "Variable Name | Description"
"--------------|------------"
for var in "${!VARIABLES[@]}"; do
    echo -e "${YELLOW}$var${NC} | ${VARIABLES[$var]}"
done

echo ""
echo -e "${BLUE}To set a variable:${NC}"
echo "1. Go to https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions"
echo "2. Click 'New repository variable'"
echo "3. Enter the variable name and value"
echo "4. Click 'Add variable'"
echo ""

# =============================================================================
# Validation Functions
# =============================================================================

validate_kubeconfig() {
    echo -e "${BLUE}Checking kubeconfig...${NC}"
    
    if [ -f "$HOME/.kube/config" ]; then
        echo -e "${GREEN}✓ Kubeconfig file found${NC}"
        
        # Test if kubectl can connect
        if command -v kubectl &> /dev/null; then
            if kubectl cluster-info &> /dev/null; then
                echo -e "${GREEN}✓ Kubernetes cluster is accessible${NC}"
            else
                echo -e "${YELLOW}⚠ Kubeconfig exists but cluster may not be accessible${NC}"
                echo "  Run 'kubectl cluster-info' to test"
            fi
        else
            echo -e "${YELLOW}⚠ kubectl not installed. Install it to test cluster connection${NC}"
        fi
        
        # Show how to encode
        echo ""
        echo -e "${BLUE}To encode for GitHub secret:${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  cat ~/.kube/config | base64"
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            echo "  PowerShell: [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content ~/.kube/config -Raw)))"
        else
            echo "  cat ~/.kube/config | base64 -w 0"
        fi
    else
        echo -e "${RED}✗ Kubeconfig not found at ~/.kube/config${NC}"
        echo "  You need to configure kubectl first"
    fi
    echo ""
}

validate_k8s_files() {
    echo -e "${BLUE}Checking Kubernetes manifest files...${NC}"
    
    local k8s_dir="$PROJECT_ROOT/k8s"
    local missing_files=()
    
    # Check for individual files
    if [ ! -f "$k8s_dir/namespace.yaml" ]; then
        missing_files+=("namespace.yaml")
        echo -e "${RED}✗ Missing: k8s/namespace.yaml${NC}"
    else
        echo -e "${GREEN}✓ Found: k8s/namespace.yaml${NC}"
    fi
    
    if [ ! -f "$k8s_dir/configmap.yaml" ]; then
        missing_files+=("configmap.yaml")
        echo -e "${RED}✗ Missing: k8s/configmap.yaml${NC}"
    else
        echo -e "${GREEN}✓ Found: k8s/configmap.yaml${NC}"
    fi
    
    if [ ! -f "$k8s_dir/secrets.yaml" ]; then
        missing_files+=("secrets.yaml")
        echo -e "${RED}✗ Missing: k8s/secrets.yaml${NC}"
    else
        echo -e "${GREEN}✓ Found: k8s/secrets.yaml${NC}"
    fi
    
    # Check for combined manifest (alternative)
    if [ -f "$k8s_dir/manifests.yaml" ]; then
        echo -e "${GREEN}✓ Found: k8s/manifests.yaml (combined manifest)${NC}"
    fi
    
    if [ ${#missing_files[@]} -gt 0 ] && [ ! -f "$k8s_dir/manifests.yaml" ]; then
        echo ""
        echo -e "${YELLOW}⚠ Missing k8s files. Create them or use the combined manifests.yaml${NC}"
        echo "  Run: cd $PROJECT_ROOT && ./scripts/create-k8s-files.sh"
    fi
    
    echo ""
}

validate_frontend() {
    echo -e "${BLUE}Checking frontend configuration...${NC}"
    
    local frontend_dir="$PROJECT_ROOT/frontend"
    local package_json="$frontend_dir/package.json"
    
    if [ ! -f "$package_json" ]; then
        echo -e "${RED}✗ Frontend package.json not found${NC}"
        return
    fi
    
    # Check for required scripts
    echo "Checking package.json scripts..."
    
    if grep -q '"typecheck"' "$package_json"; then
        echo -e "${GREEN}✓ typecheck script exists${NC}"
    else
        echo -e "${YELLOW}⚠ typecheck script missing (required by CI workflow)${NC}"
        echo "  Add to package.json: \"typecheck\": \"tsc --noEmit\""
    fi
    
    if grep -q '"test"' "$package_json"; then
        echo -e "${GREEN}✓ test script exists${NC}"
    else
        echo -e "${YELLOW}⚠ test script missing (required by CI workflow)${NC}"
        echo "  Add to package.json or update CI workflow to skip tests"
    fi
    
    if grep -q '"build"' "$package_json"; then
        echo -e "${GREEN}✓ build script exists${NC}"
    else
        echo -e "${RED}✗ build script missing${NC}"
    fi
    
    if grep -q '"lint"' "$package_json"; then
        echo -e "${GREEN}✓ lint script exists${NC}"
    else
        echo -e "${YELLOW}⚠ lint script missing${NC}"
    fi
    
    echo ""
}

validate_backend() {
    echo -e "${BLUE}Checking backend configuration...${NC}"
    
    local backend_dir="$PROJECT_ROOT/backend"
    
    if [ ! -f "$backend_dir/requirements.txt" ]; then
        echo -e "${RED}✗ Backend requirements.txt not found${NC}"
        return
    else
        echo -e "${GREEN}✓ Found: backend/requirements.txt${NC}"
    fi
    
    if [ ! -f "$backend_dir/Dockerfile" ]; then
        echo -e "${RED}✗ Backend Dockerfile not found${NC}"
    else
        echo -e "${GREEN}✓ Found: backend/Dockerfile${NC}"
    fi
    
    if [ ! -f "$backend_dir/pyproject.toml" ]; then
        echo -e "${YELLOW}⚠ pyproject.toml not found (optional)${NC}"
    else
        echo -e "${GREEN}✓ Found: backend/pyproject.toml${NC}"
    fi
    
    echo ""
}

validate_docker() {
    echo -e "${BLUE}Checking Docker setup...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not installed${NC}"
        echo "  Install Docker to build images locally"
        echo ""
        return
    fi
    
    echo -e "${GREEN}✓ Docker is installed${NC}"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker daemon is running${NC}"
    else
        echo -e "${YELLOW}⚠ Docker daemon is not running${NC}"
        echo "  Start Docker Desktop or docker service"
    fi
    
    echo ""
}

# =============================================================================
# Main Validation
# =============================================================================

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}VALIDATION CHECKS${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

validate_kubeconfig
validate_k8s_files
validate_frontend
validate_backend
validate_docker

# =============================================================================
# Summary
# =============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SETUP SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Configure GitHub Secrets:"
echo "   https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions"
echo ""
echo "2. Configure GitHub Variables:"
echo "   https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions"
echo ""
echo "3. Ensure k8s files exist (run create-k8s-files.sh if missing)"
echo ""
echo "4. Update frontend/package.json with missing scripts"
echo ""
echo "5. Test workflows locally (optional):"
echo "   brew install act  # Install act"
echo "   act -j build-and-test  # Test frontend CI"
echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
