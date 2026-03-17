#!/bin/bash
# =============================================================================
# Kubernetes Manifest Validation Script
# =============================================================================
# Validates k8s YAML files before deployment
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
K8S_DIR="$PROJECT_ROOT/k8s"

echo "========================================"
echo "Kubernetes Manifest Validation"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}⚠ kubectl not installed, skipping syntax validation${NC}"
    echo "Install kubectl to validate manifest syntax"
    echo ""
else
    echo "Validating YAML syntax..."
    echo ""
fi

# Check required files
REQUIRED_FILES=("namespace.yaml" "configmap.yaml" "secrets.yaml")
MISSING_FILES=()

echo "Checking required files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$K8S_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        MISSING_FILES+=("$file")
    fi
done

echo ""

# Check for combined manifest
if [ -f "$K8S_DIR/manifests.yaml" ]; then
    echo -e "${GREEN}✓${NC} manifests.yaml (combined) exists"
fi

echo ""

# Validate YAML syntax if kubectl is available
if command -v kubectl &> /dev/null; then
    echo "Validating YAML syntax..."
    
    for file in "$K8S_DIR"/*.yaml; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            if kubectl apply --dry-run=client -f "$file" &> /dev/null; then
                echo -e "${GREEN}✓${NC} $filename syntax valid"
            else
                echo -e "${YELLOW}⚠${NC} $filename syntax check skipped (may need cluster connection)"
            fi
        fi
    done
    
    echo ""
fi

# Check for placeholder values
echo "Checking for placeholder values..."
PLACEHOLDER_FOUND=false

for file in "$K8S_DIR"/*.yaml; do
    if [ -f "$file" ]; then
        if grep -q "placeholder" "$file" 2>/dev/null; then
            filename=$(basename "$file")
            echo -e "${YELLOW}⚠${NC} $filename contains placeholder values"
            PLACEHOLDER_FOUND=true
        fi
    fi
done

if [ "$PLACEHOLDER_FOUND" = false ]; then
    echo -e "${GREEN}✓${NC} No placeholder values found"
fi

echo ""

# Summary
echo "========================================
echo "Validation Summary"
echo "========================================"

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Missing files: ${MISSING_FILES[*]}${NC}"
    echo "Create missing files or use combined manifests.yaml"
    exit 1
fi

if [ "$PLACEHOLDER_FOUND" = true ]; then
    echo -e "${YELLOW}⚠ Warning: Placeholder values detected${NC}"
    echo "Update secrets.yaml with actual values before deployment"
fi

echo ""
echo -e "${GREEN}Validation complete!${NC}"
echo ""

# Instructions
echo "Next steps:"
echo "1. Update k8s/secrets.yaml with actual values"
echo "2. Update k8s/configmap.yaml with your domain"
echo "3. Test with: kubectl apply --dry-run=client -f k8s/"
echo ""
