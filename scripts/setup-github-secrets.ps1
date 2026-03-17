# GitHub Actions Secrets Setup Script (PowerShell)
# =============================================================================
# This script helps configure required secrets and variables for CI/CD workflows
# Run this script to validate your setup before pushing to GitHub
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "GitHub Actions Secrets Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# =============================================================================
# Required Secrets
# =============================================================================

Write-Host "REQUIRED SECRETS" -ForegroundColor Yellow
Write-Host "Configure these in GitHub: Settings → Secrets and variables → Actions"
Write-Host ""

$secrets = @{
    "KUBE_CONFIG" = "Base64-encoded Kubernetes kubeconfig file"
    "OPENROUTER_API_KEY" = "OpenRouter API key for AI model access"
    "POSTGRES_PASSWORD" = "PostgreSQL database password"
    "GMAIL_CREDENTIALS_JSON" = "Gmail API credentials (base64 encoded JSON)"
    "TWILIO_ACCOUNT_SID" = "Twilio Account SID for WhatsApp"
    "TWILIO_AUTH_TOKEN" = "Twilio Auth Token for WhatsApp"
    "TWILIO_WHATSAPP_NUMBER" = "Twilio WhatsApp number (whatsapp:+14155238886)"
}

Write-Host "Secret Name | Description"
Write-Host "------------|------------"
foreach ($secret in $secrets.Keys) {
    Write-Host "$secret | $($secrets[$secret])" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To set a secret:" -ForegroundColor Blue
Write-Host "1. Go to https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions"
Write-Host "2. Click 'New repository secret'"
Write-Host "3. Enter the secret name and value"
Write-Host "4. Click 'Add secret'"
Write-Host ""

# =============================================================================
# Required Variables
# =============================================================================

Write-Host "REQUIRED VARIABLES" -ForegroundColor Yellow
Write-Host "Configure these in GitHub: Settings → Secrets and variables → Actions → Variables"
Write-Host ""

$variables = @{
    "DOMAIN" = "Your domain for ingress (e.g., yourdomain.com)"
    "REGISTRY" = "Container registry URL (e.g., ghcr.io/hamzasheikh768)"
}

Write-Host "Variable Name | Description"
Write-Host "--------------|------------"
foreach ($var in $variables.Keys) {
    Write-Host "$var | $($variables[$var])" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To set a variable:" -ForegroundColor Blue
Write-Host "1. Go to https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions"
Write-Host "2. Click 'New repository variable'"
Write-Host "3. Enter the variable name and value"
Write-Host "4. Click 'Add variable'"
Write-Host ""

# =============================================================================
# Validation Functions
# =============================================================================

function Validate-Kubeconfig {
    Write-Host "Checking kubeconfig..." -ForegroundColor Blue
    
    $kubeconfigPath = "$HOME\.kube\config"
    
    if (Test-Path $kubeconfigPath) {
        Write-Host "✓ Kubeconfig file found" -ForegroundColor Green
        
        # Test if kubectl can connect
        if (Get-Command kubectl -ErrorAction SilentlyContinue) {
            try {
                kubectl cluster-info | Out-Null
                Write-Host "✓ Kubernetes cluster is accessible" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Kubeconfig exists but cluster may not be accessible" -ForegroundColor Yellow
                Write-Host "  Run 'kubectl cluster-info' to test"
            }
        } else {
            Write-Host "⚠ kubectl not installed. Install it to test cluster connection" -ForegroundColor Yellow
        }
        
        # Show how to encode
        Write-Host ""
        Write-Host "To encode for GitHub secret:" -ForegroundColor Blue
        Write-Host "  PowerShell: [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content $kubeconfigPath -Raw)))"
    } else {
        Write-Host "✗ Kubeconfig not found at $kubeconfigPath" -ForegroundColor Red
        Write-Host "  You need to configure kubectl first"
    }
    Write-Host ""
}

function Validate-K8sFiles {
    Write-Host "Checking Kubernetes manifest files..." -ForegroundColor Blue
    
    $k8sDir = "$PSScriptRoot\..\k8s"
    $missingFiles = @()
    
    # Check for individual files
    if (-not (Test-Path "$k8sDir\namespace.yaml")) {
        $missingFiles += "namespace.yaml"
        Write-Host "✗ Missing: k8s/namespace.yaml" -ForegroundColor Red
    } else {
        Write-Host "✓ Found: k8s/namespace.yaml" -ForegroundColor Green
    }
    
    if (-not (Test-Path "$k8sDir\configmap.yaml")) {
        $missingFiles += "configmap.yaml"
        Write-Host "✗ Missing: k8s/configmap.yaml" -ForegroundColor Red
    } else {
        Write-Host "✓ Found: k8s/configmap.yaml" -ForegroundColor Green
    }
    
    if (-not (Test-Path "$k8sDir\secrets.yaml")) {
        $missingFiles += "secrets.yaml"
        Write-Host "✗ Missing: k8s/secrets.yaml" -ForegroundColor Red
    } else {
        Write-Host "✓ Found: k8s/secrets.yaml" -ForegroundColor Green
    }
    
    # Check for combined manifest (alternative)
    if (Test-Path "$k8sDir\manifests.yaml") {
        Write-Host "✓ Found: k8s/manifests.yaml (combined manifest)" -ForegroundColor Green
    }
    
    if ($missingFiles.Count -gt 0 -and -not (Test-Path "$k8sDir\manifests.yaml")) {
        Write-Host ""
        Write-Host "⚠ Missing k8s files. Create them or use the combined manifests.yaml" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Validate-Frontend {
    Write-Host "Checking frontend configuration..." -ForegroundColor Blue
    
    $frontendDir = "$PSScriptRoot\..\frontend"
    $packageJson = "$frontendDir\package.json"
    
    if (-not (Test-Path $packageJson)) {
        Write-Host "✗ Frontend package.json not found" -ForegroundColor Red
        return
    }
    
    # Read package.json
    $package = Get-Content $packageJson -Raw | ConvertFrom-Json
    
    # Check for required scripts
    Write-Host "Checking package.json scripts..."
    
    if ($package.scripts.typecheck) {
        Write-Host "✓ typecheck script exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ typecheck script missing (required by CI workflow)" -ForegroundColor Yellow
        Write-Host "  Add to package.json: `"typecheck`": `"tsc --noEmit`""
    }
    
    if ($package.scripts.test) {
        Write-Host "✓ test script exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ test script missing (required by CI workflow)" -ForegroundColor Yellow
        Write-Host "  Add to package.json or update CI workflow to skip tests"
    }
    
    if ($package.scripts.build) {
        Write-Host "✓ build script exists" -ForegroundColor Green
    } else {
        Write-Host "✗ build script missing" -ForegroundColor Red
    }
    
    if ($package.scripts.lint) {
        Write-Host "✓ lint script exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ lint script missing" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Validate-Backend {
    Write-Host "Checking backend configuration..." -ForegroundColor Blue
    
    $backendDir = "$PSScriptRoot\..\backend"
    
    if (-not (Test-Path "$backendDir\requirements.txt")) {
        Write-Host "✗ Backend requirements.txt not found" -ForegroundColor Red
        return
    } else {
        Write-Host "✓ Found: backend/requirements.txt" -ForegroundColor Green
    }
    
    if (-not (Test-Path "$backendDir\Dockerfile")) {
        Write-Host "✗ Backend Dockerfile not found" -ForegroundColor Red
    } else {
        Write-Host "✓ Found: backend/Dockerfile" -ForegroundColor Green
    }
    
    if (-not (Test-Path "$backendDir\pyproject.toml")) {
        Write-Host "⚠ pyproject.toml not found (optional)" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Found: backend/pyproject.toml" -ForegroundColor Green
    }
    
    Write-Host ""
}

function Validate-Docker {
    Write-Host "Checking Docker setup..." -ForegroundColor Blue
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "⚠ Docker not installed" -ForegroundColor Yellow
        Write-Host "  Install Docker to build images locally"
        Write-Host ""
        return
    }
    
    Write-Host "✓ Docker is installed" -ForegroundColor Green
    
    try {
        docker info | Out-Null
        Write-Host "✓ Docker daemon is running" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Docker daemon is not running" -ForegroundColor Yellow
        Write-Host "  Start Docker Desktop or docker service"
    }
    
    Write-Host ""
}

# =============================================================================
# Main Validation
# =============================================================================

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "VALIDATION CHECKS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Validate-Kubeconfig
Validate-K8sFiles
Validate-Frontend
Validate-Backend
Validate-Docker

# =============================================================================
# Summary
# =============================================================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "SETUP SUMMARY" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure GitHub Secrets:"
Write-Host "   https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions"
Write-Host ""
Write-Host "2. Configure GitHub Variables:"
Write-Host "   https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions"
Write-Host ""
Write-Host "3. Ensure k8s files exist"
Write-Host ""
Write-Host "4. Test workflows locally (optional):"
Write-Host "   choco install act  # Install act on Windows"
Write-Host "   act -j build-and-test  # Test frontend CI"
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
