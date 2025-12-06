# GitHub-Expo Integration Guide for Monorepo

This guide explains how to connect the same GitHub repository to all three Expo apps in your monorepo.

## Repository Information

- **GitHub Repository**: `https://github.com/baadhshah/expo-monorepo-poc`
- **Expo Account**: `daaspunkajj`
- **Apps**: lifestyle, boundless, sorella

## Overview

Since all three apps are in the same monorepo, you'll connect the **same GitHub repository** to each Expo project, but with **different project root paths**.

```
GitHub Repo: https://github.com/baadhshah/expo-monorepo-poc
├── apps/lifestyle/     → Expo Project: lifestyle (root: apps/lifestyle)
├── apps/boundless/     → Expo Project: boundless (root: apps/boundless)
└── apps/sorella/       → Expo Project: sorella (root: apps/sorella)
```

## Step-by-Step Instructions

### Prerequisites

1. ✅ All three apps have been initialized with `eas project:init`
2. ✅ Each app has a `projectId` in `app.json`
3. ✅ GitHub repository is set up and accessible

### Connect GitHub to Each App

#### 1. Lifestyle App

1. Go to https://expo.dev
2. Navigate to your **lifestyle** project
3. Click **Settings** (gear icon)
4. Go to **GitHub** section
5. Click **Connect GitHub Repository**
6. If prompted, authorize Expo to access your GitHub account
7. Select repository: `baadhshah/expo-monorepo-poc`
8. Set **Project root**: `apps/lifestyle`
9. Click **Save** or **Connect**

#### 2. Boundless App

1. Go to https://expo.dev
2. Navigate to your **boundless** project
3. Click **Settings** → **GitHub**
4. Click **Connect GitHub Repository**
5. Select repository: `baadhshah/expo-monorepo-poc`
6. Set **Project root**: `apps/boundless`
7. Click **Save**

#### 3. Sorella App

1. Go to https://expo.dev
2. Navigate to your **sorella** project
3. Click **Settings** → **GitHub**
4. Click **Connect GitHub Repository**
5. Select repository: `baadhshah/expo-monorepo-poc`
6. Set **Project root**: `apps/sorella`
7. Click **Save**

## How It Works

### Project Root Explanation

The **Project root** tells Expo where to find the `app.json` and `eas.json` files for each app:

- **lifestyle**: Expo looks in `apps/lifestyle/` for `app.json`
- **boundless**: Expo looks in `apps/boundless/` for `app.json`
- **sorella**: Expo looks in `apps/sorella/` for `app.json`

### Build Triggers

When you push to GitHub, Expo will:

1. **Detect changes** in the repository
2. **Check which app directories** were modified
3. **Trigger builds** only for affected apps

Example:
- If you change `apps/lifestyle/App.tsx` → Only lifestyle app builds
- If you change `packages/core/src/index.tsx` → All three apps build (since they all depend on it)

## Verifying the Connection

### Check in Expo Dashboard

1. Go to each project's **Settings** → **GitHub**
2. Verify:
   - ✅ Repository is connected: `baadhshah/expo-monorepo-poc`
   - ✅ Project root is set correctly
   - ✅ Status shows "Connected"

### Test Build Trigger

1. Make a small change to `apps/lifestyle/app.json`
2. Commit and push to GitHub
3. Check Expo dashboard - you should see a build triggered for lifestyle app

## Troubleshooting

### Repository Not Found

- **Issue**: Can't find the repository in Expo
- **Solution**: 
  - Make sure you've authorized Expo to access your GitHub account
  - Check that the repository is public or you've granted access to private repos

### Wrong Project Root

- **Issue**: Expo can't find `app.json`
- **Solution**: 
  - Double-check the project root path (should be `apps/lifestyle`, not `apps/lifestyle/`)
  - Make sure there's no leading slash

### Builds Not Triggering

- **Issue**: Pushing to GitHub doesn't trigger builds
- **Solution**:
  - Verify GitHub integration is connected in Expo dashboard
  - Check that you're pushing to the correct branch (usually `main` or `master`)
  - Ensure the project root path is correct

### Multiple Apps Building When Only One Changed

- **Issue**: Changing one app triggers builds for all apps
- **Solution**: This is expected if you change shared code in `packages/core`. To build only one app, change files only in that app's directory.

## Benefits of This Setup

✅ **Single Repository**: All code in one place  
✅ **Independent Builds**: Each app builds separately  
✅ **Shared Code**: Changes to `packages/core` trigger builds for all dependent apps  
✅ **GitHub Integration**: Builds triggered automatically on push  
✅ **Easy Management**: One repo, multiple apps, clear organization  

## Next Steps

After connecting GitHub:

1. ✅ Test a build from GitHub (push a change and watch it build)
2. ✅ Configure build profiles in `eas.json` if needed
3. ✅ Set up branch protection rules if using production builds
4. ✅ Configure GitHub Actions for additional CI/CD if desired

## Reference

- Expo GitHub Integration: https://docs.expo.dev/build/github-integration/
- EAS Build Documentation: https://docs.expo.dev/build/introduction/

