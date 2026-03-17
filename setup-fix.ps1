# Customer Success FTE - Installation Script
# Run this script to fix all setup issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Customer Success FTE - Setup Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "backend\src\main.py")) {
    Write-Host "❌ Error: Please run this script from project root directory" -ForegroundColor Red
    Write-Host "   Expected path: E:\Hackathon 5\CRM-Digital-FTE-Factory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Running from correct directory" -ForegroundColor Green
Write-Host ""

# Function to test Docker
function Test-Docker {
    Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
    try {
        $dockerVersion = docker --version
        Write-Host "   Docker installed: $dockerVersion" -ForegroundColor Green
        
        $dockerRunning = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Docker is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️  Docker is not running" -ForegroundColor Yellow
            Write-Host "   Starting Docker Desktop..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            Write-Host "   Waiting 30 seconds for Docker to start..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            return $true
        }
    } catch {
        Write-Host "   ❌ Docker not installed" -ForegroundColor Red
        return $false
    }
}

# Function to test Python
function Test-Python {
    Write-Host "🐍 Checking Python..." -ForegroundColor Yellow
    try {
        $pythonVersion = python --version
        Write-Host "   Python installed: $pythonVersion" -ForegroundColor Green
        
        # Check Python version
        $version = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
        Write-Host "   Python version: $version" -ForegroundColor Green
        
        if ($version -eq "3.13") {
            Write-Host "   ⚠️  Warning: Python 3.13 may have compatibility issues" -ForegroundColor Yellow
            Write-Host "   Recommended: Use Python 3.11 or 3.12" -ForegroundColor Yellow
            Write-Host "   Alternative: Use Docker (recommended)" -ForegroundColor Yellow
        }
        
        return $true
    } catch {
        Write-Host "   ❌ Python not installed" -ForegroundColor Red
        return $false
    }
}

# Function to test Node.js
function Test-Node {
    Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
    try {
        $nodeVersion = node --version
        Write-Host "   Node.js installed: $nodeVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   ❌ Node.js not installed" -ForegroundColor Red
        return $false
    }
}

# Run tests
$dockerOk = Test-Docker
$pythonOk = Test-Python
$nodeOk = Test-Node

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($dockerOk) {
    Write-Host "✅ Option 1: Use Docker (Recommended)" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Commands:" -ForegroundColor Cyan
    Write-Host "   docker compose up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "   This will start:" -ForegroundColor Yellow
    Write-Host "   - PostgreSQL with pgvector" -ForegroundColor Gray
    Write-Host "   - Kafka" -ForegroundColor Gray
    Write-Host "   - Backend (Python 3.11)" -ForegroundColor Gray
    Write-Host "   - Frontend (Next.js 16)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Access:" -ForegroundColor Cyan
    Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   - Backend:  http://localhost:8000" -ForegroundColor Gray
    Write-Host "   - API Docs: http://localhost:8000/docs" -ForegroundColor Gray
    Write-Host ""
}

if ($pythonOk -and $nodeOk) {
    Write-Host "✅ Option 2: Local Development" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Backend Setup:" -ForegroundColor Cyan
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   python -m venv venv" -ForegroundColor White
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "   pip install -r requirements.txt" -ForegroundColor White
    Write-Host "   python -m uvicorn src.main:app --reload" -ForegroundColor White
    Write-Host ""
    Write-Host "   Frontend Setup:" -ForegroundColor Cyan
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Start (Docker)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($dockerOk) {
    $choice = Read-Host "Start Docker services now? (y/n)"
    
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Write-Host ""
        Write-Host "🚀 Starting Docker services..." -ForegroundColor Green
        Write-Host ""
        
        docker compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Services started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Check status:" -ForegroundColor Cyan
            Write-Host "   docker compose ps" -ForegroundColor White
            Write-Host ""
            Write-Host "View logs:" -ForegroundColor Cyan
            Write-Host "   docker compose logs -f" -ForegroundColor White
            Write-Host ""
            Write-Host "Access:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
            Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
            Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Failed to start services" -ForegroundColor Red
            Write-Host "   Check Docker Desktop is running" -ForegroundColor Yellow
            Write-Host "   Run: docker compose logs for details" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Docker is not available" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or use local Python/Node.js setup (see QUICKSTART.md)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Documentation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 QUICKSTART.md - Complete setup guide" -ForegroundColor White
Write-Host "📄 SETUP-GUIDE.md - Detailed instructions" -ForegroundColor White
Write-Host "📄 docs/API.md - API documentation" -ForegroundColor White
Write-Host ""

Write-Host "Done! 🎉" -ForegroundColor Green
