# Customer Success FTE - Deployment Guide

**Version**: 1.0.0
**Last Updated**: 2026-03-17

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Monitoring Setup](#monitoring-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 20.10+ | Containerization |
| Docker Compose | 2.0+ | Local orchestration |
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| kubectl | 1.25+ | Kubernetes CLI |
| Helm | 3.10+ | Kubernetes package manager |

### Required Accounts & Services

| Service | Purpose | Cost Estimate |
|---------|---------|---------------|
| OpenAI API | Agent intelligence | $50-200/month |
| Twilio | WhatsApp integration | $0.005/message |
| Gmail API | Email integration | Free (quota limits) |
| PostgreSQL | Database | Free (self-hosted) |
| Kafka | Event streaming | Free (self-hosted) |
| Kubernetes | Orchestration | $50-500/month (cloud) |

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd CRM-Digital-FTE-Factory
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# OpenRouter API Configuration
# -----------------------------------------------------------------------------
OPENROUTER_API_KEY=sk-your-openrouter-api-key
OPENROUTER_MODEL=gpt-4o

# Database
DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db
POSTGRES_USER=fte_user
POSTGRES_PASSWORD=fte_password
POSTGRES_DB=fte_db

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Twilio (for WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Gmail (optional for local)
GMAIL_CREDENTIALS_PATH=/path/to/gmail-credentials.json
```

### Step 3: Start Services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Kafka (port 9092)
- Zookeeper (port 2181)
- Backend API (port 8000)
- Frontend (port 3000)

### Step 4: Verify Services

```bash
# Check all containers are running
docker-compose ps

# Check API health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

### Step 5: Run Database Migrations

```bash
docker-compose exec backend python -m alembic upgrade head
```

### Step 6: Access Services

| Service | URL |
|---------|-----|
| API Docs | http://localhost:8000/docs |
| Frontend | http://localhost:3000 |
| PostgreSQL | localhost:5432 |
| Kafka | localhost:9092 |

---

## Production Deployment

### Option 1: Kubernetes Deployment (Recommended)

#### Step 1: Prepare Kubernetes Cluster

```bash
# Create cluster (examples)
# AKS (Azure)
az aks create --resource-group myRG --name myAKSCluster --node-count 3

# GKE (Google)
gcloud container clusters create my-cluster --num-nodes=3

# EKS (AWS)
eksctl create cluster --name my-cluster --nodes 3
```

#### Step 2: Install Dependencies

```bash
# Install PostgreSQL with pgvector
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --set image.tag=16 \
  --set auth.username=fte_user \
  --set auth.password=$POSTGRES_PASSWORD \
  --set auth.database=fte_db

# Install Kafka
helm install kafka bitnami/kafka \
  --set persistence.size=10Gi \
  --set replicaCount=3
```

#### Step 3: Create Namespace and Secrets

```bash
# Create namespace
kubectl apply -f k8s/manifests.yaml

# Create secrets (replace with your values)
export OPENROUTER_API_KEY="your-openrouter-key"
export POSTGRES_PASSWORD="your-postgres-password"
export TWILIO_ACCOUNT_SID="your-twilio-sid"
export TWILIO_AUTH_TOKEN="your-twilio-token"
export TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Create secret manifest
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: fte-secrets
  namespace: customer-success-fte
type: Opaque
stringData:
  OPENROUTER_API_KEY: "${OPENROUTER_API_KEY}"
  POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
  TWILIO_ACCOUNT_SID: "${TWILIO_ACCOUNT_SID}"
  TWILIO_AUTH_TOKEN: "${TWILIO_AUTH_TOKEN}"
  TWILIO_WHATSAPP_NUMBER: "${TWILIO_WHATSAPP_NUMBER}"
EOF
```

#### Step 4: Deploy Application

```bash
# Apply all manifests
kubectl apply -f k8s/manifests.yaml

# Watch deployment status
kubectl get pods -n customer-success-fte -w
```

#### Step 5: Configure Ingress

Update `k8s/manifests.yaml` with your domain:

```yaml
spec:
  rules:
  - host: support-api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: customer-success-fte
            port:
              number: 80
```

Apply and install cert-manager for SSL:

```bash
kubectl apply -f k8s/manifests.yaml
```

#### Step 6: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n customer-success-fte

# Check services
kubectl get svc -n customer-success-fte

# Check ingress
kubectl get ingress -n customer-success-fte

# Test health endpoint
curl https://support-api.yourdomain.com/health
```

---

### Option 2: Docker Compose (Small Deployments)

#### Step 1: Prepare Production Server

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with production values
```

#### Step 3: Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: fte_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: fte_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://fte_user:${POSTGRES_PASSWORD}@postgres:5432/fte_db
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      OPENROUTER_MODEL: ${OPENROUTER_MODEL:-gpt-4o}
      OPENROUTER_BASE_URL: https://openrouter.ai/api/v1
    depends_on:
      - postgres
    restart: always
    deploy:
      replicas: 3

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: https://your-domain.com/api
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

#### Step 4: Deploy

```bash
docker-compose up -d
```

#### Step 5: Setup Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Environment Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | - | OpenRouter API key |
| `OPENROUTER_MODEL` | No | `gpt-4o` | Model to use via OpenRouter |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `KAFKA_BOOTSTRAP_SERVERS` | Yes | - | Kafka bootstrap servers |
| `TWILIO_ACCOUNT_SID` | For WhatsApp | - | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | For WhatsApp | - | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | For WhatsApp | - | Twilio WhatsApp number |
| `GMAIL_CREDENTIALS_PATH` | For Gmail | - | Gmail API credentials path |
| `ENVIRONMENT` | No | `development` | Environment name |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `CORS_ORIGINS` | No | `["http://localhost:3000"]` | CORS allowed origins |

### Configuration Best Practices

1. **Never commit secrets**: Use environment variables or secret management
2. **Use different databases per environment**: dev, staging, production
3. **Set appropriate log levels**: DEBUG for dev, INFO for production
4. **Configure CORS properly**: Only allow trusted domains in production

---

## Monitoring Setup

### Prometheus + Grafana

#### Step 1: Install Prometheus Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace
```

#### Step 2: Create ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: fte-api
  namespace: customer-success-fte
spec:
  selector:
    matchLabels:
      app: customer-success-fte
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

#### Step 3: Configure Alerts

```yaml
groups:
- name: fte-alerts
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
  - alert: HighEscalationRate
    expr: rate(escalations_total[5m]) / rate(messages_total[5m]) > 0.3
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High escalation rate detected"
```

---

## Channel Integration Setup

### Gmail Integration

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project

2. **Enable Gmail API**
   - API & Services > Library
   - Search "Gmail API" and enable

3. **Create Credentials**
   - API & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Download credentials JSON

4. **Setup Pub/Sub**
   - Create topic: `gmail-push`
   - Create subscription with push endpoint

5. **Configure Webhook**
   - Endpoint: `https://your-domain.com/webhooks/gmail`

### WhatsApp Integration

1. **Create Twilio Account**
   - Go to https://www.twilio.com
   - Sign up for account

2. **Enable WhatsApp Sandbox**
   - Messaging > Try it out > Send a WhatsApp message
   - Follow instructions to join sandbox

3. **Configure Webhook**
   - Set webhook URL: `https://your-domain.com/webhooks/whatsapp`
   - Enable message status callbacks

4. **Production Setup**
   - Apply for WhatsApp Business API
   - Submit business verification
   - Create message templates

---

## Troubleshooting

### Common Issues

#### Issue: Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n customer-success-fte

# Check logs
kubectl logs <pod-name> -n customer-success-fte
```

**Solutions:**
- Verify image name is correct
- Check secrets are created
- Ensure database is accessible

#### Issue: Database Connection Errors

```bash
# Test database connectivity
kubectl exec -it <pod-name> -n customer-success-fte -- \
  psql -h postgres -U fte_user -d fte_db
```

**Solutions:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure network policies allow traffic

#### Issue: Kafka Connection Errors

```bash
# List Kafka topics
kubectl exec -it kafka-0 -- kafka-topics --bootstrap-server localhost:9092 --list
```

**Solutions:**
- Verify KAFKA_BOOTSTRAP_SERVERS is correct
- Check Kafka is running
- Ensure topics are created

---

## Rollback Procedures

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/fte-api -n customer-success-fte

# Rollback to previous version
kubectl rollout undo deployment/fte-api -n customer-success-fte

# Rollback to specific revision
kubectl rollout undo deployment/fte-api --to-revision=2 -n customer-success-fte
```

### Docker Compose Rollback

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and restart
docker-compose up -d --build
```

---

## Cost Optimization

### Estimated Monthly Costs (Production)

| Resource | Configuration | Estimated Cost |
|----------|--------------|----------------|
| Kubernetes | 3 nodes (2 vCPU, 4GB) | $150 |
| PostgreSQL | 2 vCPU, 4GB, 50GB | $50 |
| Kafka | 3 nodes (1 vCPU, 2GB) | $75 |
| OpenAI API | 10k messages/day | $100 |
| Twilio | 1000 WhatsApp messages/day | $15 |
| **Total** | | **~$390/month** |

### Cost Reduction Tips

1. **Use spot instances** for worker pods (50-70% savings)
2. **Scale down at night** if traffic allows
3. **Optimize OpenAI usage** with caching
4. **Use Kafka batching** to reduce API calls
5. **Monitor and alert** on unexpected usage spikes

---

## Security Checklist

- [ ] All secrets stored in Kubernetes Secrets or external vault
- [ ] TLS enabled for all external communication
- [ ] Network policies restrict pod-to-pod traffic
- [ ] Database accessible only from application pods
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Regular security updates applied
- [ ] Audit logging enabled
- [ ] Backup strategy implemented

---

**Document Owner**: DevOps Team
**Review Frequency**: Monthly
**Next Review**: 2026-04-17
