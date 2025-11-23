# POC Prerequisites: Expo Multi-App Monorepo Refactoring

## Overview

This document outlines all prerequisites needed to set up a Proof of Concept (POC) with 3 Expo apps using the proposed monorepo architecture (Turborepo + pnpm workspaces).

---

## 1. Technical Prerequisites

### 1.1 Development Environment

#### **Required Software**
- ✅ **Node.js**: v18.x or v20.x (LTS recommended)
  - Verify: `node --version`
  - Download: https://nodejs.org/

- ✅ **pnpm**: v8.x or later
  - Install: `npm install -g pnpm`
  - Verify: `pnpm --version`
  - Why: Required for workspace management and efficient dependency handling

- ✅ **Expo CLI / EAS CLI**: Latest version
  - Install: `npm install -g eas-cli`
  - Verify: `eas --version`
  - Login: `eas login` (requires Expo account)

- ✅ **Git**: Latest version
  - Verify: `git --version`

#### **Optional but Recommended**
- **Turborepo CLI**: For local development
  - Install: `npm install -g turbo`
  - Verify: `turbo --version`

### 1.2 System Requirements

- **Operating System**: macOS, Linux, or Windows (WSL2 recommended for Windows)
- **Disk Space**: At least 2-3 GB free (for node_modules, builds, etc.)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Internet**: Stable connection for EAS builds and package downloads

---

## 2. Expo Account & EAS Setup

### 2.1 Expo Account

- ✅ **Expo Account**: Create/login at https://expo.dev
  - Free tier is sufficient for POC
  - Required for EAS Build and EAS Submit

### 2.2 EAS Project Setup

For each of the 3 POC apps, you'll need:

1. **EAS Project ID** (auto-generated when running `eas build:configure`)
2. **Access to EAS Dashboard**: https://expo.dev/accounts/[your-account]/projects

**Note**: If using existing apps from the test repository, you can reuse their EAS project IDs, or create new ones for the POC.

### 2.3 Apple Developer Account (for iOS builds)

- ✅ **Apple Developer Account**: Required for iOS builds
  - Individual: $99/year
  - Organization: $99/year
  - Can use existing account if available

**For POC**: You can skip iOS builds initially and focus on Android, or use Expo's internal distribution for testing.

### 2.4 Google Play Console (for Android builds)

- ✅ **Google Play Developer Account**: Required for Android production builds
  - One-time $25 fee
  - Can use existing account if available

**For POC**: You can use internal distribution or skip production builds initially.

---

## 3. Repository & Source Control

### 3.1 Git Repository

- ✅ **Git Repository**: New or existing repository for the monorepo
  - Can be GitHub, GitLab, Bitbucket, or any Git hosting
  - Should be accessible to team members working on POC

### 3.2 Repository Access

- ✅ **Clone Access**: To the test repository (if using existing apps)
  - Repository: https://github.com/movementso/expo-expert-test
  - Or use 3 apps from your existing codebase

---

## 4. App Selection for POC

### 4.1 Recommended Approach

**Option A: Use 3 Apps from Test Repository** (Recommended for POC)
- Use apps from: `https://github.com/movementso/expo-expert-test`
- Suggested apps:
  1. `20lifestyle` (Expo 52.0.47, RN 0.76.9)
  2. `boundless-movement` (Expo 52.0.15, RN 0.76.3)
  3. `sorella-online` (Expo 52.0.47, RN 0.76.9)

**Option B: Use 3 Apps from Production**
- Select 3 representative apps from your 50+ production apps
- Should represent different configurations (different bundle ID patterns, etc.)

### 4.2 App Requirements

Each app should have:
- ✅ `app.json` / `app.config.js`
- ✅ `eas.json`
- ✅ `package.json`
- ✅ Basic functionality (WebView, IAP, notifications, etc.)
- ✅ App-specific assets (icons, splash screens)
- ✅ `google-services.json` (for Android, if applicable)

---

## 5. Development Tools

### 5.1 Code Editor

- ✅ **VS Code** (recommended) or any IDE
- ✅ **Recommended VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript
  - Turbo (Turborepo extension)

### 5.2 Testing Devices/Emulators

- ✅ **iOS Simulator** (macOS only)
  - Install via Xcode
  - Or use Expo Go app on physical device

- ✅ **Android Emulator**
  - Install Android Studio
  - Create at least one AVD (Android Virtual Device)
  - Or use Expo Go app on physical device

**For POC**: Physical devices with Expo Go app are sufficient and faster to set up.

---

## 6. Project Structure Setup

### 6.1 Initial Repository Structure

You'll need to create:

```
expo-monorepo-poc/
├── apps/
│   ├── app1/
│   ├── app2/
│   └── app3/
├── packages/
│   ├── core/
│   └── expo-preset/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .gitignore
```

### 6.2 Configuration Files Needed

- ✅ `package.json` (root)
- ✅ `pnpm-workspace.yaml`
- ✅ `turbo.json`
- ✅ `.gitignore`
- ✅ `tsconfig.json` (root, if using TypeScript)

---

## 7. Dependencies & Packages

### 7.1 Core Dependencies to Standardize

For the POC, we'll need to decide on a baseline:

- **Expo SDK**: Choose one version (e.g., 52.0.47)
- **React Native**: Choose one version (e.g., 0.76.9)
- **React**: 18.3.1
- **Common dependencies**:
  - `expo-device`
  - `expo-linking`
  - `expo-notifications`
  - `react-native-iap`
  - `react-native-webview`
  - `react-native-track-player`

### 7.2 Shared Package Dependencies

- `@fitterapp/core` (will be created)
- `@fitterapp/expo-preset` (will be created)

---

## 8. Time & Resource Allocation

### 8.1 Estimated Time for POC Setup

| Task | Estimated Time |
|------|----------------|
| Environment setup | 1-2 hours |
| Repository initialization | 1 hour |
| Package structure creation | 2-3 hours |
| Migrate first app | 3-4 hours |
| Migrate second app | 2-3 hours |
| Migrate third app | 2-3 hours |
| Testing & validation | 3-4 hours |
| **Total** | **14-20 hours** |

### 8.2 Team Requirements

- **1 Developer**: Full-time for 2-3 days
- **Access to**: Expo account, Apple/Google accounts (if doing production builds)

---

## 9. Success Criteria for POC

### 9.1 Functional Requirements

- ✅ All 3 apps build successfully with EAS
- ✅ All 3 apps can be run locally (`expo start`)
- ✅ Shared code works across all apps
- ✅ App-specific configs (bundle IDs, icons) work correctly
- ✅ Key features work (WebView, IAP, notifications)

### 9.2 Technical Requirements

- ✅ Dependencies managed centrally
- ✅ Single `node_modules` (via pnpm workspace)
- ✅ Turborepo caching works
- ✅ EAS Build works for each app independently
- ✅ Code duplication eliminated (shared code in packages)

---

## 10. Pre-POC Checklist

Before starting the POC, verify:

### Environment
- [ ] Node.js installed and verified
- [ ] pnpm installed and verified
- [ ] EAS CLI installed and logged in
- [ ] Git configured
- [ ] Code editor ready

### Accounts
- [ ] Expo account created/logged in
- [ ] Apple Developer account (if doing iOS builds)
- [ ] Google Play account (if doing Android production builds)

### Repository
- [ ] Git repository created/accessible
- [ ] Test repository cloned (if using apps from test repo)
- [ ] 3 apps selected for POC

### Apps
- [ ] App 1: All files present (app.json, package.json, etc.)
- [ ] App 2: All files present
- [ ] App 3: All files present
- [ ] All apps have EAS project IDs (or ready to create)

### Planning
- [ ] Team member assigned
- [ ] Timeline agreed (2-3 days recommended)
- [ ] Success criteria defined

---

## 11. Quick Start Commands

Once prerequisites are met, here's the initial setup:

```bash
# 1. Create new repository
mkdir expo-monorepo-poc
cd expo-monorepo-poc
git init

# 2. Initialize pnpm workspace
pnpm init

# 3. Install Turborepo
pnpm add -D turbo

# 4. Create workspace structure
mkdir -p apps packages/core packages/expo-preset

# 5. Create pnpm-workspace.yaml
echo "packages:
  - 'apps/*'
  - 'packages/*'" > pnpm-workspace.yaml

# 6. Initialize turbo.json
npx turbo init

# 7. Verify setup
pnpm install
```

---

## 12. Potential Blockers & Solutions

### Blocker 1: EAS Account Issues
**Solution**: Use Expo's free tier, or use existing account

### Blocker 2: Apple Developer Account
**Solution**: 
- Skip iOS builds initially (focus on Android)
- Use Expo's internal distribution
- Use Expo Go for testing

### Blocker 3: Version Conflicts
**Solution**: 
- Standardize on one Expo SDK version for POC
- Use latest version from test repo (52.0.47)

### Blocker 4: Missing App Assets
**Solution**: 
- Use placeholder assets if needed
- Focus on code structure, not visual perfection

### Blocker 5: Complex App-Specific Logic
**Solution**: 
- Start with simplest apps
- Gradually add complexity
- Document any app-specific overrides needed

---

## 13. Next Steps After Prerequisites Met

1. **Review this document** with team
2. **Verify all prerequisites** are met
3. **Select 3 apps** for POC
4. **Set up repository** structure
5. **Begin migration** of first app
6. **Validate approach** before proceeding

---

## 14. Questions to Answer Before Starting

1. **Which 3 apps** will be used for POC?
   - From test repo or production?

2. **Expo SDK version** to standardize on?
   - Recommend: Latest from test repo (52.0.47)

3. **Build targets** for POC?
   - Android only? iOS only? Both?
   - Production builds or preview builds?

4. **Timeline** for POC?
   - 2-3 days recommended
   - When can developer start?

5. **Success criteria** beyond functional requirements?
   - Performance benchmarks?
   - Specific features to test?

---

## 15. Support & Resources

### Documentation
- Turborepo: https://turbo.build/repo/docs
- pnpm Workspaces: https://pnpm.io/workspaces
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Monorepo Guide: https://docs.expo.dev/guides/monorepos/

### Getting Help
- Expo Discord: https://chat.expo.dev/
- Turborepo Discord: https://turbo.build/discord

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Review


