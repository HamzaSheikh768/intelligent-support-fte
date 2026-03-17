# GitHub Actions Workflow Troubleshooting Guide

## Overview

This guide helps resolve common CI/CD workflow failures for the CRM Digital FTE project.

**Repository:** HamzaSheikh768/intelligent-support-fte

---

## Required Secrets

Configure these secrets in GitHub Repository Settings → Secrets and variables → Actions:

### Kubernetes Deployment Secrets (Required for CD)

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `KUBE_CONFIG` | Base64-encoded Kubernetes kubeconfig file | `cat ~/.kube/config \| base64 -w 0` (Linux/Mac) or `Get-Content ~/.kube/config \| [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content ~/.kube/config -Raw)))` (Windows PowerShell) |
| `REGISTRY` | Container registry URL (e.g., ghcr.io, docker.io) | Your container registry hostname |

### Environment Variables (Required for CD)

Configure these in Repository Settings → Secrets and variables → Actions → Variables:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `DOMAIN` | Your domain for ingress | `yourdomain.com` |
| `REGISTRY` | Container registry URL | `ghcr.io/hamzasheikh768` |

---

## Required Kubernetes Files

The following files must exist in the `k8s/` directory:

1. **k8s/namespace.yaml** - Namespace definition
2. **k8s/configmap.yaml** - Application configuration
3. **k8s/secrets.yaml** - Sensitive credentials (template provided)

If these files are missing, the CD workflow will fail with:
```
Error from server (NotFound): error when creating "k8s/namespace.yaml": namespaces "customer-success-fte" not found
```

---

## Common Error Messages and Fixes

### CD Deploy Workflow Errors

#### Error: `KUBE_CONFIG` is empty or invalid

**Error Message:**
```
Error: unable to decode secret "kubeconfig": illegal base64 data at input byte 0
```

**Fix:**
1. Ensure your kubeconfig file exists: `cat ~/.kube/config`
2. Encode it properly: `cat ~/.kube/config | base64 -w 0`
3. Copy the output to GitHub Secrets → `KUBE_CONFIG`
4. **Important:** Remove any trailing newlines

#### Error: Namespace not found

**Error Message:**
```
Error from server (NotFound): error when creating "k8s/configmap.yaml": namespaces "customer-success-fte" not found
```

**Fix:**
1. Ensure `k8s/namespace.yaml` exists with correct namespace name
2. Apply namespace first: `kubectl apply -f k8s/namespace.yaml`
3. Check workflow applies files in correct order

#### Error: Image pull failures

**Error Message:**
```
Error: ImagePullBackOff for image "your-registry/customer-success-fte:abc123"
```

**Fix:**
1. Set `REGISTRY` variable in GitHub Actions variables
2. Ensure Docker image is built and pushed before deployment
3. Check image exists: `docker pull ${REGISTRY}/customer-success-fte:${GITHUB_SHA}`

#### Error: Domain variable not set

**Error Message:**
```
curl: (6) Could not resolve host: staging-support-api.
```

**Fix:**
1. Go to Repository Settings → Secrets and variables → Actions → Variables
2. Add variable `DOMAIN` with value `yourdomain.com`
3. Ensure DNS is configured for the domain

### CI Frontend Workflow Errors

#### Error: Missing typecheck script

**Error Message:**
```
npm ERR! Missing script: "typecheck"
```

**Fix:**
The frontend doesn't have a `typecheck` script. Options:
1. Add to `package.json`: `"typecheck": "tsc --noEmit"`
2. Remove the step from workflow
3. Run type checking as part of build: `npm run build`

#### Error: Missing test script

**Error Message:**
```
npm ERR! Missing script: "test"
```

**Fix:**
Add test configuration to `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```
Or remove the test step from workflow if tests aren't set up.

#### Error: Build fails due to missing API URL

**Error Message:**
```
Error: Missing environment variable NEXT_PUBLIC_API_URL
```

**Fix:**
The workflow already sets this. If build still fails:
1. Create `frontend/.env.production` with `NEXT_PUBLIC_API_URL=https://your-api-url.com`
2. Ensure all `NEXT_PUBLIC_*` variables are set in workflow

#### Error: Linting failures

**Error Message:**
```
Error: ESLint found problems
```

**Fix:**
1. Run locally: `cd frontend && npm run lint`
2. Fix linting errors or add `--fix` flag
3. Update `.eslintrc.json` to relax rules if needed

### CI Backend Workflow Errors

#### Error: PostgreSQL connection timeout

**Error Message:**
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server
```

**Fix:**
1. Increase PostgreSQL health check timeout in workflow
2. Add retry logic for database connection
3. Ensure DATABASE_URL matches service credentials

#### Error: Kafka not ready

**Error Message:**
```
kafka.errors.KafkaConnectionError: KafkaConnectionError: Unable to connect to any of the bootstrap servers
```

**Fix:**
1. Kafka takes time to start; add wait step before tests
2. Use `KAFKA_AUTO_OFFSET_RESET=earliest` in test config
3. Add health check: `kafka-topics --bootstrap-server localhost:9092 --list`

#### Error: Missing Python dependencies

**Error Message:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Fix:**
1. Ensure `requirements.txt` is in `backend/` directory
2. Run: `cd backend && pip install -r requirements.txt`
3. Check `pyproject.toml` for dependency conflicts

---

## Step-by-Step Setup Instructions

### 1. Configure GitHub Secrets

```bash
# Navigate to your repository on GitHub
# Go to: Settings → Secrets and variables → Actions

# Add these secrets:
# - KUBE_CONFIG: Your base64-encoded kubeconfig
# - REGISTRY: Your container registry URL (optional, can use variable)
```

### 2. Configure GitHub Variables

```bash
# Go to: Settings → Secrets and variables → Actions → Variables

# Add these variables:
# - DOMAIN: yourdomain.com
# - REGISTRY: ghcr.io/yourusername (if not using secret)
```

### 3. Verify Kubernetes Files Exist

```bash
# Check k8s directory
ls -la k8s/

# Should have:
# - namespace.yaml
# - configmap.yaml
# - secrets.yaml
# - manifests.yaml (optional, combined file)
```

### 4. Test Workflow Locally (Optional)

Using [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
# or download from https://github.com/nektos/act

# Test CI frontend workflow
act -j build-and-test

# Test CD workflow (requires secrets)
act -j deploy-staging --secret-file .secrets
```

### 5. Manual Deployment Test

Before running full workflow, test manually:

```bash
# Download and decode kubeconfig
echo "${KUBE_CONFIG}" | base64 -d > kubeconfig
export KUBECONFIG=kubeconfig

# Test namespace creation
kubectl apply -f k8s/namespace.yaml

# Test configmap
kubectl apply -f k8s/configmap.yaml -n customer-success-fte

# Verify resources
kubectl get all -n customer-success-fte
```

---

## Workflow-Specific Fixes

### CD Deploy Workflow

**File:** `.github/workflows/cd-deploy.yml`

**Common Issues:**
1. Missing k8s files → Create them (see k8s/ directory)
2. KUBE_CONFIG not set → Add to secrets
3. DOMAIN variable missing → Add to variables
4. Image not found → Build and push before deploy

**Quick Fix:**
```yaml
# Add validation step before deployment
- name: Validate prerequisites
  run: |
    test -n "${{ secrets.KUBE_CONFIG }}" || echo "Warning: KUBE_CONFIG not set"
    test -n "${{ vars.REGISTRY }}" || echo "Warning: REGISTRY not set"
    test -n "${{ vars.DOMAIN }}" || echo "Warning: DOMAIN not set"
    ls k8s/*.yaml || echo "Error: k8s files missing"
```

### CI Frontend Workflow

**File:** `.github/workflows/ci-frontend.yml`

**Common Issues:**
1. Missing `typecheck` script → Add to package.json or remove step
2. Missing `test` script → Add Jest config or remove step
3. Build fails → Check NEXT_PUBLIC_* variables

**Quick Fix:**
Update workflow to make tests optional:
```yaml
- name: Run tests (optional)
  working-directory: ./frontend
  continue-on-error: true
  run: npm test -- --coverage || echo "Tests not configured yet"
```

### CI Backend Workflow

**File:** `.github/workflows/ci-backend.yml`

**Common Issues:**
1. Database not ready → Add wait step
2. Kafka not ready → Add health check
3. Missing dependencies → Update requirements.txt

**Quick Fix:**
Add wait step before tests:
```yaml
- name: Wait for services
  run: |
    echo "Waiting for PostgreSQL..."
    until pg_isready -h localhost -p 5432 -q; do sleep 1; done
    echo "PostgreSQL is ready"
```

---

## Validation Checklist

Before pushing to main branch:

- [ ] All secrets configured in GitHub Actions
- [ ] All variables configured in GitHub Actions
- [ ] k8s/namespace.yaml exists
- [ ] k8s/configmap.yaml exists
- [ ] k8s/secrets.yaml exists (with placeholder values)
- [ ] Frontend has `typecheck` script or workflow updated
- [ ] Frontend has `test` script or workflow updated
- [ ] Backend requirements.txt is complete
- [ ] Docker images can be built locally
- [ ] Kubernetes cluster is accessible with current kubeconfig

---

## Getting Help

1. Check workflow run logs: GitHub → Actions → [Workflow Name] → [Run Number]
2. Download full logs for detailed debugging
3. Test locally with `act` tool
4. Contact repository maintainers for access issues

---

## Quick Reference Commands

```bash
# Encode kubeconfig for GitHub secret
cat ~/.kube/config | base64 -w 0  # Linux/Mac
Get-Content ~/.kube/config | [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content ~/.kube/config -Raw)))  # PowerShell

# Test kubectl connection
kubectl cluster-info
kubectl get namespaces

# Test k8s manifests
kubectl apply --dry-run=client -f k8s/

# Build frontend locally
cd frontend && npm ci && npm run build

# Build backend locally
cd backend && pip install -r requirements.txt && pytest
```
