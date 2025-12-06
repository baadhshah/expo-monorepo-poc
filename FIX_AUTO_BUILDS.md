# Fix Automatic Builds After Renaming

## Problem Identified

**Current Situation:**
- ✅ Code pushed to: `https://github.com/baadhshah/expo-monorepo-poc`
- ✅ New project names: `boundless`, `lifestyle`, `sorella`
- ❌ GitHub integration still pointing to old project: `boundless-movement`
- ❌ No builds triggering automatically

**Root Cause:**
The GitHub webhook is still connected to the **old project** (`boundless-movement`) but your code is now in the **new project** (`boundless`).

## Solution: Reconnect GitHub Integration

You have **two options**:

### Option 1: Update Existing Project (Recommended if you want to keep build history)

If `boundless-movement` project still exists and you want to keep the build history:

1. Go to https://expo.dev
2. Navigate to **boundless-movement** project (the one with old builds)
3. Go to **Settings** → **GitHub**
4. Update **Project root** from `apps/boundless-movement` to `apps/boundless`
5. Verify repository is: `baadhshah/expo-monorepo-poc`
6. Ensure **Auto-build on push** is enabled
7. Save changes

**Result**: Old project will now build from new folder path, keeping build history.

### Option 2: Connect to New Project (If you want fresh start)

If you want to use the new `boundless` project (clean slate):

1. Go to https://expo.dev
2. Navigate to **boundless** project (the empty one)
3. Go to **Settings** → **GitHub**
4. Click **Connect GitHub Repository**
5. Select repository: `baadhshah/expo-monorepo-poc`
6. Set **Project root**: `apps/boundless`
7. Enable **Auto-build on push**
8. Save

**Result**: New project will start building automatically.

## Steps for All Three Apps

You need to do this for **all three apps**:

### For Lifestyle App

1. Go to https://expo.dev
2. Find project (might be `20lifestyle` or `lifestyle`)
3. **Settings** → **GitHub**
4. Update/Connect:
   - Repository: `baadhshah/expo-monorepo-poc`
   - Project root: `apps/lifestyle`
   - Auto-build: **Enabled**

### For Boundless App

1. Go to https://expo.dev
2. Find project (`boundless-movement` or `boundless`)
3. **Settings** → **GitHub**
4. Update/Connect:
   - Repository: `baadhshah/expo-monorepo-poc`
   - Project root: `apps/boundless`
   - Auto-build: **Enabled**

### For Sorella App

1. Go to https://expo.dev
2. Find project (`sorella-online` or `sorella`)
3. **Settings** → **GitHub**
4. Update/Connect:
   - Repository: `baadhshah/expo-monorepo-poc`
   - Project root: `apps/sorella`
   - Auto-build: **Enabled**

## How to Verify It's Working

After reconnecting, test with a small change:

```bash
# Make a small change
echo "# Test" >> apps/boundless/app.json

# Commit and push
git add apps/boundless/app.json
git commit -m "Test auto-build trigger"
git push origin main
```

**Expected Result:**
- Within 1-2 minutes, check Expo Dashboard
- You should see a new build starting automatically
- Build will show the new commit hash

## Current Project IDs (For Reference)

Your apps have these project IDs:
- **lifestyle**: `352778cd-bc0e-48ce-a690-bf68e411ed08`
- **boundless**: `88829b67-1cdc-41a7-8061-f13dd6ce9286`
- **sorella**: `648e8f64-4707-44fd-9f04-e405997378d8`

You can use these to find the correct projects in Expo Dashboard.

## Quick Checklist

- [ ] Lifestyle: GitHub connected, project root = `apps/lifestyle`
- [ ] Boundless: GitHub connected, project root = `apps/boundless`
- [ ] Sorella: GitHub connected, project root = `apps/sorella`
- [ ] All have "Auto-build on push" enabled
- [ ] Repository is `baadhshah/expo-monorepo-poc` for all
- [ ] Test push triggers a build

## Why This Happened

When you renamed the folders:
- ✅ Code updated: `apps/boundless-movement` → `apps/boundless`
- ✅ Project IDs updated in `app.json`
- ❌ **GitHub integration NOT updated** in Expo Dashboard
- ❌ Webhook still looking for old path: `apps/boundless-movement`

The GitHub integration configuration is **stored in Expo's cloud**, not in your code, so it needs to be manually updated in the dashboard.

## After Fixing

Once reconnected, every push to `main` branch will:
1. GitHub sends webhook to Expo
2. Expo checks which app directories changed
3. Expo triggers builds for affected apps automatically
4. Builds appear in Expo Dashboard

No code changes needed - it's all configuration in Expo Dashboard!

