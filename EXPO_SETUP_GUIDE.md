# Expo Setup Guide for Monorepo

This guide will help you connect your monorepo to Expo and set up EAS (Expo Application Services).

## Prerequisites

- Node.js installed
- pnpm installed
- Expo account (create one at https://expo.dev if you don't have one)

## Step 1: Install EAS CLI

Install EAS CLI globally:

```bash
npm install -g eas-cli
```

Or using pnpm:

```bash
pnpm add -g eas-cli
```

Verify installation:

```bash
eas --version
```

## Step 2: Login to Expo

Login to your Expo account:

```bash
eas login
```

This will prompt you to:
- Enter your email (baadhshah@gmail.com)
- Enter your password
- Or use browser authentication

Verify you're logged in:

```bash
eas whoami
```

## Step 3: Initialize EAS Projects for Each App

For each app in your monorepo, you need to initialize an EAS project. This will:
- Create a project in your Expo account
- Generate a `projectId` and add it to `app.json`

### For lifestyle app:

```bash
cd apps/lifestyle
eas project:init
```

This will:
1. Ask if you want to create a new project (say "yes")
2. Ask for project name (default: "lifestyle" - press Enter)
3. Automatically update `apps/lifestyle/app.json` with the `projectId`

### For boundless app:

```bash
cd apps/boundless
eas project:init
```

### For sorella app:

```bash
cd apps/sorella
eas project:init
```

## Step 4: Verify Project IDs

After initializing all three apps, check that `projectId` is populated in each `app.json`:

```bash
# Check lifestyle
grep "projectId" apps/lifestyle/app.json

# Check boundless
grep "projectId" apps/boundless/app.json

# Check sorella
grep "projectId" apps/sorella/app.json
```

Each should show a UUID like: `"projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`

## Step 5: Configure EAS Build (Optional)

If you want to configure build profiles, you can run:

```bash
cd apps/lifestyle
pnpm eas build:configure
```

This will create/update `eas.json` in each app directory. However, since you already have `eas.json` files, you can skip this step.

## Step 6: Test the Connection

Test that everything is connected by checking your projects:

```bash
pnpm eas project:list
```

This should show all three projects (lifestyle, boundless, sorella).

## Step 7: Link GitHub Repository to All Apps (Required)

Since all three apps are in the same monorepo (`https://github.com/baadhshah/expo-monorepo-poc`), you need to connect the same GitHub repository to each Expo project with different project roots.

### Method 1: Via Expo Dashboard (Recommended)

1. **Go to Expo Dashboard**: https://expo.dev
2. **Login** with your account (`daaspunkajj`)
3. **For each app project**, follow these steps:

#### For Lifestyle App:
1. Navigate to your **lifestyle** project
2. Go to **Settings** → **GitHub**
3. Click **Connect GitHub Repository**
4. Select or enter: `https://github.com/baadhshah/expo-monorepo-poc`
5. Set **Project root** to: `apps/lifestyle`
6. Click **Save**

#### For Boundless App:
1. Navigate to your **boundless** project
2. Go to **Settings** → **GitHub**
3. Click **Connect GitHub Repository**
4. Select or enter: `https://github.com/baadhshah/expo-monorepo-poc`
5. Set **Project root** to: `apps/boundless`
6. Click **Save**

#### For Sorella App:
1. Navigate to your **sorella** project
2. Go to **Settings** → **GitHub**
3. Click **Connect GitHub Repository**
4. Select or enter: `https://github.com/baadhshah/expo-monorepo-poc`
5. Set **Project root** to: `apps/sorella`
6. Click **Save**

### Method 2: Via EAS CLI (Alternative)

You can also link GitHub via CLI after initializing projects:

```bash
# For lifestyle app
cd apps/lifestyle
pnpm eas project:init
# Then connect GitHub via dashboard or use GitHub integration

# For boundless app
cd apps/boundless
pnpm eas project:init

# For sorella app
cd apps/sorella
pnpm eas project:init
```

### Important Notes:

- ✅ **Same Repository**: All three apps use the same GitHub repo
- ✅ **Different Project Roots**: Each app has a different project root path:
  - `apps/lifestyle` for lifestyle
  - `apps/boundless` for boundless
  - `apps/sorella` for sorella
- ✅ **Independent Builds**: Each app can be built independently from the same repo
- ✅ **GitHub Actions**: Expo will detect changes in each app's directory and trigger builds accordingly

## Quick Setup Script

You can run all three initializations at once:

```bash
# From project root
cd apps/lifestyle && eas project:init && cd ../..
cd apps/boundless && eas project:init && cd ../..
cd apps/sorella && eas project:init && cd ../..
```

## Troubleshooting

### If `eas project:init` fails:

1. Make sure you're logged in: `eas whoami`
2. Make sure you're in the correct directory (inside the app folder)
3. Check that `app.json` exists and has a valid `slug`

### If project already exists:

If you get an error that the project already exists, you can:
- Use the existing project: `eas project:init --id <existing-project-id>`
- Or create with a different name

### If you need to link to an existing project:

```bash
eas project:init --id <project-id>
```

## Next Steps

After setup:
1. Commit the updated `app.json` files with `projectId` values
2. You can now run builds: `eas build --platform android --profile preview`
3. Configure credentials if needed: `eas credentials`

## Important Notes

- Each app has its own EAS project ID (separate projects)
- The `projectId` in `app.json` links the local app to the Expo project
- You can build each app independently
- All apps share the same Expo account but are separate projects

