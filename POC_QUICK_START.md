# POC Quick Start Guide

## Prerequisites Checklist (5 minutes)

Run these commands to verify your environment:

```bash
# Check Node.js (need v18+ or v20+)
node --version

# Check pnpm (install if missing: npm install -g pnpm)
pnpm --version

# Check EAS CLI (install if missing: npm install -g eas-cli)
eas --version

# Check Git
git --version

# Login to Expo (if not already)
eas login
```

## Quick Setup (15 minutes)

### Step 1: Create Repository Structure

```bash
# Create new directory
mkdir expo-monorepo-poc
cd expo-monorepo-poc
git init

# Create workspace structure
mkdir -p apps packages/core packages/expo-preset
```

### Step 2: Initialize Root Package

```bash
# Create root package.json
cat > package.json << 'EOF'
{
  "name": "expo-monorepo-poc",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run start",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
EOF
```

### Step 3: Setup pnpm Workspace

```bash
# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

### Step 4: Initialize Turborepo

```bash
# Install turbo
pnpm install

# Create turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".expo/**"]
    },
    "start": {
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
EOF
```

### Step 5: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Expo
.expo/
dist/
web-build/

# EAS
.eas/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Turbo
.turbo/
EOF
```

## Next Steps

1. **Select 3 apps** from test repository or production
2. **Follow migration guide** (to be created)
3. **Test builds** with EAS

## Verification

After setup, verify:

```bash
# Install dependencies
pnpm install

# Should show workspace structure
pnpm list --depth=0
```

---

**Ready to proceed?** Once prerequisites are met, we can start migrating the first app!


