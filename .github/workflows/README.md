# GitHub Actions Workflows

This directory contains the CI/CD workflows for the CRM Digital FTE project.

## Workflows Overview

### 1. CI Frontend (`ci-frontend.yml`)

**Triggers:**
- Push to `main` or `develop` branches (frontend changes only)
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **build-and-test**: Lint, typecheck, test, and build the frontend
2. **build-docker**: Build Docker image for the frontend

**Requirements:**
- Node.js 18
- Frontend must have `typecheck` and `test` scripts in package.json

### 2. CI Backend (`ci-backend.yml`)

**Triggers:**
- Push to `main` or `develop` branches (backend changes only)
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **test**: Run linting and tests with PostgreSQL and Kafka services
2. **build**: Build Docker image for the backend

**Requirements:**
- Python 3.11
- PostgreSQL 16 (pgvector)
- Kafka 7.5

### 3. CD Deploy (`cd-deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow_dispatch

**Jobs:**
1. **deploy-staging**: Deploy to staging environment
2. **deploy-production**: Deploy to production (requires staging success)

**Requirements:**
- GitHub Secrets: `KUBE_CONFIG`
- GitHub Variables: `REGISTRY`, `DOMAIN`
- Kubernetes cluster access
- k8s manifest files

---

## Quick Start

### 1. Configure Secrets and Variables

Go to your repository settings:
- **Secrets**: `Settings → Secrets and variables → Actions → Secrets`
- **Variables**: `Settings → Secrets and variables → Actions → Variables`

**Required Secrets:**
```
KUBE_CONFIG=<base64-encoded-kubeconfig>
OPENROUTER_API_KEY=<your-api-key>
POSTGRES_PASSWORD=<your-db-password>
```

**Required Variables:**
```
DOMAIN=yourdomain.com
REGISTRY=ghcr.io/yourusername
```

### 2. Verify Kubernetes Files

Ensure these files exist:
```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
└── manifests.yaml (optional, combined file)
```

### 3. Run Setup Script

**Linux/Mac:**
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

**Windows PowerShell:**
```powershell
.\scripts\setup-github-secrets.ps1
```

---

## Workflow Files

| File | Purpose | Environment |
|------|---------|-------------|
| `ci-frontend.yml` | Frontend CI pipeline | GitHub Actions |
| `ci-backend.yml` | Backend CI pipeline | GitHub Actions |
| `cd-deploy.yml` | CD deployment to K8s | Staging & Production |
| `TROUBLESHOOTING.md` | Troubleshooting guide | Documentation |

---

## Common Issues

### CD Deploy Fails

**Error: `KUBE_CONFIG` is empty**
- **Fix**: Encode your kubeconfig: `cat ~/.kube/config | base64 -w 0`
- Add to GitHub Secrets as `KUBE_CONFIG`

**Error: Namespace not found**
- **Fix**: Ensure `k8s/namespace.yaml` exists
- Check workflow applies files in correct order

**Error: Image pull failures**
- **Fix**: Set `REGISTRY` variable correctly
- Ensure Docker image is built and pushed

### CI Frontend Fails

**Error: Missing script "typecheck"**
- **Fix**: Add to `frontend/package.json`:
  ```json
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
  ```

**Error: Missing script "test"**
- **Fix**: Add Jest configuration or update workflow to skip tests
- See `frontend/jest.config.js` for setup

### CI Backend Fails

**Error: PostgreSQL connection timeout**
- **Fix**: Increase service health check timeout
- Add wait step before tests

**Error: Kafka not ready**
- **Fix**: Kafka takes time to start; add health check
- Use `kafka-topics --bootstrap-server localhost:9092 --list`

---

## Local Testing

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
# macOS: brew install act
# Windows: choco install act
# Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Test frontend CI
act -j build-and-test

# Test backend CI
act -j test

# Test CD (requires secrets)
act -j deploy-staging --secret-file .secrets
```

Create `.secrets` file:
```
KUBE_CONFIG=your-kubeconfig
REGISTRY=your-registry
DOMAIN=yourdomain.com
```

---

## Manual Deployment

Test deployment manually before running workflow:

```bash
# Download and decode kubeconfig
echo "$KUBE_CONFIG" | base64 -d > kubeconfig
export KUBECONFIG=kubeconfig

# Test namespace
kubectl apply -f k8s/namespace.yaml

# Test configmap
kubectl apply -f k8s/configmap.yaml -n customer-success-fte

# Verify resources
kubectl get all -n customer-success-fte
```

---

## Deployment Flow

```
Push to main
    ↓
CI Frontend (if frontend changed)
    ↓
CI Backend (if backend changed)
    ↓
CD Deploy → Staging
    ↓
    ├─ Validate prerequisites
    ├─ Configure kubectl
    ├─ Apply k8s manifests
    ├─ Update images
    ├─ Wait for rollout
    └─ Run smoke tests
    ↓
CD Deploy → Production (if staging succeeds)
    ↓
    ├─ Configure kubectl (production)
    ├─ Apply k8s manifests
    ├─ Update images
    ├─ Wait for rollout
    └─ Run health checks
```

---

## Security Best Practices

1. **Never commit secrets**: Use GitHub Secrets for sensitive data
2. **Use environments**: Separate staging and production
3. **Require approval**: Add required reviewers for production
4. **Limit permissions**: Use service accounts with minimal permissions
5. **Rotate secrets**: Regularly update API keys and passwords

---

## Monitoring

Check workflow runs:
- **All runs**: `https://github.com/HamzaSheikh768/intelligent-support-fte/actions`
- **Specific workflow**: Click workflow name → View runs

Download logs for debugging:
- Click on failed job → Download logs

---

## Support

For issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review workflow logs
3. Test locally with `act`
4. Contact repository maintainers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial workflow setup |
| 1.1.0 | 2025-01-15 | Added validation steps, better error messages |
