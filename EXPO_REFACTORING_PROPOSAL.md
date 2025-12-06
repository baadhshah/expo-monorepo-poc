# Expo Multi-App Refactoring Proposal

## Executive Summary

This proposal outlines a comprehensive refactoring strategy to transform the current unscalable multi-app architecture (50+ standalone Expo apps) into a unified monorepo with shared components, centralized dependency management, and streamlined build pipelines. The solution leverages **Turborepo** and **pnpm workspaces** to maintain full compatibility with EAS Build, EAS Submit, and Expo's GitHub integration while dramatically reducing maintenance overhead.

---

## 1. Refactoring Approach & Architecture

### 1.1 Proposed Repository Structure

```
expo-multi-app-monorepo/
├── apps/                          # Individual app configurations
│   ├── lifestyle/
│   │   ├── app.json              # App-specific config only
│   │   ├── eas.json              # App-specific EAS config
│   │   ├── package.json          # Minimal, references shared packages
│   │   ├── App.tsx               # Thin wrapper (5-10 lines)
│   │   ├── assets/               # App-specific assets (icons, splash)
│   │   └── google-services.json  # App-specific
│   ├── boundless/
│   └── [other apps...]
│
├── packages/                      # Shared code packages
│   ├── core/                      # Core app logic
│   │   ├── src/
│   │   │   ├── App.tsx           # Main app component (shared)
│   │   │   ├── Loader.tsx        # Shared loader component
│   │   │   ├── audio-player.ts   # Shared audio player
│   │   │   ├── service.js        # Shared background service
│   │   │   └── shared.ts         # Shared constants/types
│   │   └── package.json
│   │
│   ├── config/                    # Shared configuration
│   │   ├── babel.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── expo-preset/               # Expo SDK version management
│       └── package.json           # Centralized Expo/RN versions
│
├── tooling/                       # Build & automation tools
│   ├── scripts/
│   │   ├── new-app.sh            # Updated app generator
│   │   ├── update-sdk.sh         # SDK upgrade script
│   │   └── build-all.sh          # Batch build script
│   └── templates/                 # App generation templates
│
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace config
├── package.json                   # Root package.json
└── .github/
    └── workflows/
        └── eas-build.yml          # CI/CD workflows
```

### 1.2 Architectural Principles

#### **Separation of Concerns**
- **Shared Logic**: All business logic, components, and utilities live in `packages/core`
- **App-Specific Config**: Only app identity (bundle ID, icons, URLs) lives in `apps/{app-name}`
- **Dependency Management**: Centralized in `packages/expo-preset`

#### **App Structure Pattern**

Each app becomes a minimal configuration wrapper:

```typescript
// apps/lifestyle/App.tsx
import { createApp } from '@fitterapp/core';

export default createApp({
  webViewUrl: 'https://lifestyle.mvt.so/',
  // Any app-specific overrides can be passed here
});
```

The `createApp` function from `@fitterapp/core` handles all the shared logic (IAP, notifications, audio player, etc.) while accepting app-specific configuration.

#### **Configuration Management**

App-specific configurations are isolated:

```json
// apps/lifestyle/app.json
{
  "expo": {
    "name": "2.0FIT",
    "slug": "lifestyle",
    "extra": {
      "webViewUrl": "https://lifestyle.mvt.so/",
      "fitterApp": "lifestyle"
    },
    "ios": {
      "bundleIdentifier": "so.movement.lifestyle"
    },
    "android": {
      "package": "so.movement.mlifestyle"
    }
  }
}
```

All shared Expo config (plugins, asset patterns, etc.) is managed in the core package.

---

## 2. Tooling & Infrastructure

### 2.1 Monorepo Solution: Turborepo + pnpm

**Why This Combination?**

#### **Turborepo**
- ✅ **Build Caching**: Dramatically speeds up CI/CD by caching builds
- ✅ **Task Orchestration**: Efficiently manages parallel builds across apps
- ✅ **Dependency Graph**: Automatically determines build order
- ✅ **EAS Integration**: Works seamlessly with EAS Build (each app builds independently)
- ✅ **Zero Config**: Minimal setup required

#### **pnpm Workspaces**
- ✅ **Disk Efficiency**: Single `node_modules` with hard links (saves 10-15 GB)
- ✅ **Strict Dependency Management**: Prevents phantom dependencies
- ✅ **Fast Installs**: Faster than npm/yarn, especially in monorepos
- ✅ **Workspace Protocol**: Clean dependency references between packages

### 2.2 Dependency Management Strategy

#### **Centralized Version Control**

```json
// packages/expo-preset/package.json
{
  "name": "@fitterapp/expo-preset",
  "version": "52.0.47",
  "dependencies": {
    "expo": "~52.0.47",
    "react-native": "0.76.9",
    "react": "18.3.1",
    "expo-device": "~7.0.3",
    "expo-linking": "~7.0.5",
    "expo-notifications": "^0.29.11",
    "expo-status-bar": "~2.0.0",
    "react-native-iap": "12.16.2",
    "react-native-track-player": "^4.1.1",
    "react-native-webview": "13.12.5",
    "expo-build-properties": "~0.13.3"
  }
}
```

Each app references this preset:

```json
// apps/lifestyle/package.json
{
  "name": "lifestyle",
  "dependencies": {
    "@fitterapp/core": "workspace:*",
    "@fitterapp/expo-preset": "workspace:*"
  }
}
```

**Benefits:**
- Single source of truth for all dependency versions
- Update once, apply everywhere
- Prevents version drift

### 2.3 Build Orchestration

#### **Turborepo Configuration**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "eas:build": {
      "cache": false,
      "dependsOn": ["build"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

#### **Per-App Build Scripts**

Each app can be built independently:

```bash
# Build single app
cd apps/lifestyle
eas build --platform ios --profile production

# Build all apps (via Turborepo)
turbo run eas:build --filter='./apps/*'
```

### 2.4 Why Not Alternatives?

| Solution | Why Not? |
|----------|----------|
| **Nx** | Over-engineered for this use case, steeper learning curve |
| **Yarn Workspaces** | Less efficient disk usage, slower installs |
| **Lerna** | Primarily for publishing, not build orchestration |
| **Single App with Config** | Doesn't meet requirement for independent deployment |

---

## 3. EAS Integration (Critical)

### 3.1 EAS Build Compatibility

**Full Compatibility Maintained**

EAS Build works perfectly with monorepos. Each app directory is treated as an independent Expo project:

```json
// apps/lifestyle/eas.json
{
  "cli": {
    "version": ">= 7.2.0"
  },
  "build": {
    "production": {
      "env": {
        "APP_SLUG": "lifestyle"
      }
    }
  }
}
```

**Key Points:**
- Each app has its own `eas.json` (can be standardized via template)
- EAS Build runs from each app directory independently
- No changes required to EAS Build workflow
- Each app maintains its own EAS project ID

### 3.2 Expo GitHub UI Integration

**Seamless Integration**

Expo's GitHub integration works by detecting `app.json` and `eas.json` in the repository. With our structure:

1. **GitHub detects apps** in `apps/*/` directories
2. **Each app appears** as a separate project in Expo dashboard
3. **Builds can be triggered** per app via GitHub UI
4. **No configuration changes** required

**Optional Enhancement:**
We can add a `.github/workflows/eas-build.yml` for automated builds on push:

```yaml
name: EAS Build
on:
  push:
    paths:
      - 'apps/**'
      - 'packages/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
      - run: pnpm install
      - run: eas build --platform all --non-interactive
        working-directory: apps/${{ matrix.app }}
    strategy:
      matrix:
        app: [lifestyle, boundless, ...]
```

### 3.3 Independent Deployment

**Each App Remains Independent**

- ✅ Separate EAS project IDs
- ✅ Separate bundle IDs / package names
- ✅ Separate version numbers
- ✅ Separate build histories
- ✅ Can be built/submitted independently
- ✅ No coupling between apps

### 3.4 EAS Submit Integration

EAS Submit works identically:

```bash
# Submit single app
cd apps/lifestyle
eas submit --platform ios --latest

# Or via GitHub UI (unchanged)
```

---

## 4. Practical Example: SDK Upgrade (Expo 52 → 53)

### 4.1 Step-by-Step Process

#### **Step 1: Update Centralized Preset** (5 minutes)

```bash
cd packages/expo-preset
# Update package.json
pnpm update expo@~53.0.0 react-native@0.77.x
pnpm install
```

#### **Step 2: Update Core Package** (10-15 minutes)

```bash
cd packages/core
# Update any breaking changes in App.tsx, audio-player.ts, etc.
# Test locally with one app
pnpm install
```

#### **Step 3: Verify Compatibility** (30 minutes)

```bash
# Test with one app first
cd apps/lifestyle
pnpm install
expo start --ios
# Manual testing of key features
```

#### **Step 4: Apply to All Apps** (5 minutes)

```bash
# From root
pnpm install  # Updates all apps automatically via workspace
turbo run build --filter='./apps/*'  # Verify all apps build
```

#### **Step 5: Build & Test** (Automated)

```bash
# Build all apps in parallel
turbo run eas:build --filter='./apps/*' --profile preview
```

### 4.2 Time Comparison

| Task | Current (50 apps) | Proposed (Monorepo) |
|------|-------------------|---------------------|
| Update dependencies | 2-3 hours (manual) | 5 minutes (single file) |
| Update code | 4-6 hours (copy-paste) | 15 minutes (shared package) |
| Testing | 1-2 days (sequential) | 30 minutes (parallel) |
| **Total** | **3-5 days** | **~1 hour** |

### 4.3 Verification Strategy

1. **Automated Testing**: Unit tests in `packages/core`
2. **Smoke Tests**: Build one app per platform (iOS/Android)
3. **Staged Rollout**: Update 5-10 apps first, then batch update remaining
4. **CI/CD**: Automated builds on all apps before merge

---

## 5. Migration Plan

### 5.1 High-Level Approach

**Phase 1: Foundation** (Week 1-2)
1. Set up monorepo structure (Turborepo + pnpm)
2. Create `packages/core` with shared code
3. Create `packages/expo-preset` with centralized dependencies
4. Migrate 2-3 apps as proof of concept

**Phase 2: Gradual Migration** (Week 3-6)
1. Migrate apps in batches (10 apps/week)
2. Update automation scripts
3. Document new processes

**Phase 3: Cleanup** (Week 7-8)
1. Remove old templates
2. Update CI/CD pipelines
3. Team training

### 5.2 Migration Steps (Per App)

1. **Extract shared code** → `packages/core`
2. **Create minimal app wrapper** in `apps/{app-name}/App.tsx`
3. **Move app-specific config** (app.json, eas.json, assets)
4. **Update package.json** to reference shared packages
5. **Test build** with EAS
6. **Verify functionality** (IAP, notifications, audio, etc.)

### 5.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes during migration | Migrate 2-3 apps first, validate approach |
| EAS Build issues | Test EAS builds early, maintain compatibility |
| Team learning curve | Documentation, pair programming sessions |
| Downtime during migration | Migrate incrementally, apps remain functional |

### 5.4 Rollback Strategy

- Keep old app directories until migration verified
- Git branches for each migration phase
- Can rollback individual apps if needed

---

## 6. Real-World Considerations

### 6.1 App Generation Scripts

**Updated `scripts/new-app.sh`**

```bash
#!/bin/bash
slug="$1"
business_name="$2"
apple_team_id="$3"
apple_app_id="$4"

# Create app directory structure
mkdir -p apps/$slug/assets

# Generate minimal App.tsx from template
hygen app new --slug $slug --name "$business_name"

# Generate app.json (app-specific config only)
# Generate eas.json (standardized template)

# Install dependencies (automatically gets shared packages)
cd apps/$slug
pnpm install

# Setup EAS
eas build:configure --platform all

# Run Ruby scripts for EAS attributes, icons, etc.
# (existing scripts work unchanged)
```

**Key Changes:**
- No longer creates full Expo app structure
- Generates minimal wrapper that uses shared packages
- Dependencies come from workspace automatically

### 6.2 Existing Automation

**Ruby Scripts**: Work unchanged
- `setup_expo_auto_build.rb` - Still works (modifies `eas.json`)
- `add_eas_attributes.rb` - Still works (modifies `app.json`)
- `process_icons.rb` - Still works (processes `assets/`)

**Hygen Templates**: Updated for new structure
- Templates generate minimal app wrappers
- Shared code lives in packages, not templates

### 6.3 New App Creation Flow

**Before:**
```bash
npx create-expo-app $slug  # Creates full app
# Copy-paste code from template
# Install dependencies
# Configure EAS
```

**After:**
```bash
./scripts/new-app.sh $slug "$name" $team_id $app_id
# Creates minimal wrapper
# Automatically uses shared packages
# Faster, consistent setup
```

---

## 7. Additional Benefits

### 7.1 Developer Experience

- **Faster Local Development**: Single `node_modules`, shared code hot-reloads
- **Better IDE Support**: Monorepo-aware tools (VS Code, WebStorm)
- **Easier Debugging**: Shared code has single source of truth
- **Type Safety**: Shared TypeScript types across all apps

### 7.2 CI/CD Improvements

- **Parallel Builds**: Turborepo builds apps in parallel
- **Build Caching**: Unchanged apps skip rebuilds
- **Faster Pipelines**: Reduced from hours to minutes

### 7.3 Code Quality

- **Single Source of Truth**: Bug fixes apply to all apps automatically
- **Consistent Behavior**: All apps use same logic
- **Easier Testing**: Test shared code once, benefits all apps

### 7.4 Storage & Performance

- **Disk Space**: Reduced from 10-15 GB to ~500 MB (shared node_modules)
- **Install Time**: Single `pnpm install` vs 50+ separate installs
- **Build Time**: Caching reduces redundant builds

---

## 8. Implementation Details

### 8.1 Package Structure

#### **@fitterapp/core Package**

```typescript
// packages/core/src/createApp.tsx
import React from 'react';
import { AppConfig } from './types';
import { MainApp } from './App';

export function createApp(config: AppConfig) {
  return function App() {
    return <MainApp config={config} />;
  };
}

// packages/core/src/types.ts
export interface AppConfig {
  webViewUrl: string;
  // Any app-specific overrides
}
```

#### **App Wrapper**

```typescript
// apps/lifestyle/App.tsx
import { createApp } from '@fitterapp/core';
import Constants from 'expo-constants';

const webViewUrl = Constants.expoConfig?.extra?.webViewUrl || 
                   'https://lifestyle.mvt.so/';

export default createApp({ webViewUrl });
```

### 8.2 Configuration Management

#### **Shared Expo Config**

```typescript
// packages/core/src/getExpoConfig.ts
import { ExpoConfig } from 'expo/config';

export function getSharedExpoConfig(): Partial<ExpoConfig> {
  return {
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    updates: { enabled: false },
    assetBundlePatterns: ['**/*'],
    plugins: ['react-native-iap'],
    // Shared iOS/Android config
  };
}
```

#### **App-Specific Config**

```json
// apps/lifestyle/app.json
{
  "expo": {
    "name": "2.0FIT",
    "slug": "lifestyle",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#000"
    },
    "ios": {
      "bundleIdentifier": "so.movement.lifestyle"
    },
    "android": {
      "package": "so.movement.mlifestyle"
    },
    "extra": {
      "webViewUrl": "https://lifestyle.mvt.so/",
      "fitterApp": "lifestyle"
    }
  }
}
```

### 8.3 Dependency Resolution

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// Root package.json
{
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run start",
    "lint": "turbo run lint"
  }
}
```

---

## 9. Estimated Effort & Timeline

### 9.1 Effort Breakdown

| Phase | Effort | Duration |
|-------|--------|----------|
| **Setup & POC** | 40-60 hours | 1-2 weeks |
| **Core Package Development** | 20-30 hours | 1 week |
| **Migration (50 apps)** | 100-150 hours | 4-6 weeks |
| **Testing & Validation** | 40-60 hours | 1-2 weeks |
| **Documentation & Training** | 20-30 hours | 1 week |
| **Total** | **220-330 hours** | **8-12 weeks** |

### 9.2 Team Requirements

- **1 Senior React Native/Expo Engineer** (full-time)
- **1 Mid-level Engineer** (part-time, for testing/migration)
- **QA Support** (part-time, for validation)

### 9.3 Risk Assessment

**Low Risk:**
- ✅ EAS compatibility (proven approach)
- ✅ Gradual migration (low disruption)
- ✅ Rollback capability

**Medium Risk:**
- ⚠️ Team learning curve (mitigated by documentation)
- ⚠️ Initial setup complexity (mitigated by POC phase)

---

## 10. Success Metrics

### 10.1 Quantitative Goals

- **SDK Upgrade Time**: Reduce from 3-5 days to <2 hours
- **Dependency Update Time**: Reduce from 2-3 hours to <10 minutes
- **Disk Usage**: Reduce from 10-15 GB to <1 GB
- **CI Build Time**: Reduce by 60-80% (via caching)
- **Code Duplication**: Eliminate 95%+ duplication

### 10.2 Qualitative Goals

- ✅ Single source of truth for all shared code
- ✅ Consistent behavior across all apps
- ✅ Easier onboarding for new developers
- ✅ Faster feature development
- ✅ Reduced maintenance burden

---

## 11. Conclusion

This proposal provides a **scalable, maintainable solution** that:

1. ✅ **Eliminates code duplication** through shared packages
2. ✅ **Centralizes dependency management** via workspace protocol
3. ✅ **Maintains full EAS compatibility** (Build, Submit, GitHub UI)
4. ✅ **Enables independent deployment** per app
5. ✅ **Dramatically reduces maintenance time** (days → hours)
6. ✅ **Scales to 100+ apps** without architectural changes

The combination of **Turborepo** and **pnpm workspaces** provides the optimal balance of:
- Build performance (caching, parallelization)
- Disk efficiency (shared dependencies)
- Developer experience (monorepo tooling)
- EAS compatibility (zero changes required)

**Next Steps:**
1. Review and approve this proposal
2. Set up POC with 2-3 apps
3. Validate EAS Build/Submit workflow
4. Plan migration timeline
5. Begin Phase 1 implementation

---

## Appendix A: Example File Structure

See detailed file examples in the implementation phase. Key files:

- `packages/core/src/App.tsx` - Main shared app component
- `packages/core/src/createApp.tsx` - App factory function
- `apps/{app}/App.tsx` - Minimal app wrapper
- `turbo.json` - Build configuration
- `pnpm-workspace.yaml` - Workspace definition

## Appendix B: Migration Checklist

Per-app migration checklist:
- [ ] Extract shared code to `packages/core`
- [ ] Create minimal `App.tsx` wrapper
- [ ] Update `package.json` dependencies
- [ ] Move app-specific config (app.json, eas.json)
- [ ] Move assets (icons, splash screens)
- [ ] Test local build (`expo start`)
- [ ] Test EAS build (`eas build --profile preview`)
- [ ] Verify IAP functionality
- [ ] Verify notifications
- [ ] Verify audio player
- [ ] Update CI/CD if needed

---

**Document Version**: 1.0  
**Date**: 2024  
**Author**: Expo Architecture Review


