# Understanding Key Monorepo Concepts

This document explains three important concepts for the Expo monorepo architecture with practical examples from your codebase.

---

## 1. pnpm Workspace

### What is it?

**pnpm Workspace** is a feature that allows you to manage multiple packages (apps and shared libraries) in a single repository. Instead of having separate `node_modules` folders for each app, pnpm creates a **single shared dependency store** and links packages together.

### How it works in your repo

Look at your `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

This tells pnpm: *"Treat every folder under `apps/` and `packages/` as a separate package, but manage their dependencies together."*

### Real Example from Your Code

**Your app's package.json** (`apps/lifestyle/package.json`):
```json
{
  "dependencies": {
    "@shared/core": "workspace:*",
    "expo-status-bar": "~3.0.8"
  }
}
```

**The `workspace:*` syntax** means: *"Use the local package named `@shared/core` from this monorepo, not from npm."*

**Your shared package** (`packages/core/package.json`):
```json
{
  "name": "@shared/core",
  "version": "0.0.1"
}
```

### What happens when you run `pnpm install`?

1. **Single dependency store**: pnpm installs all dependencies once in a central location (saves ~10-15 GB of disk space for 50 apps)
2. **Hard links**: Each app's `node_modules` contains **hard links** to the central store (not copies)
3. **Workspace linking**: `@shared/core` is automatically linked from `packages/core` to `apps/lifestyle`

### Benefits

- ✅ **Disk efficiency**: 50 apps share one `node_modules` instead of 50 separate ones
- ✅ **Fast installs**: Install once, all apps benefit
- ✅ **Version consistency**: All apps use the same version of shared packages
- ✅ **Easy local development**: Changes to `packages/core` are immediately available to all apps

### Practical Commands

```bash
# Install all dependencies for all apps and packages
pnpm install

# Install a new dependency for a specific app
pnpm --filter lifestyle add some-package

# Install a dependency for the shared core package
pnpm --filter @shared/core add some-library

# Run a script in a specific app
pnpm --filter lifestyle start
```

---

## 2. Turborepo Configuration

### What is it?

**Turborepo** is a build system that orchestrates tasks (build, test, lint) across multiple packages in a monorepo. It's smart about:
- **Caching**: If nothing changed, skip the task
- **Parallelization**: Run tasks in parallel when possible
- **Dependency graph**: Knows which packages depend on which

### Your Current Configuration

Look at your `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "start": { "cache": false },
    "build": { "dependsOn": ["^build"], "outputs": [".expo/**"] }
  }
}
```

### Breaking it down

#### `"start": { "cache": false }`
- **Task name**: `start` (runs `pnpm start` in each app)
- **`cache: false`**: Don't cache this task (because `expo start` is a dev server that runs continuously)

#### `"build": { "dependsOn": ["^build"], "outputs": [".expo/**"] }`
- **Task name**: `build`
- **`dependsOn: ["^build"]`**: The `^` means "dependencies" - build shared packages first, then apps
  - Example: Build `packages/core` before building `apps/lifestyle`
- **`outputs: [".expo/**"]`**: Cache the `.expo` folder (Turborepo knows what changed)

### How Turborepo Works

**Scenario**: You change code in `packages/core/src/index.tsx`

1. **Turborepo detects**: "Something in `packages/core` changed"
2. **Rebuilds**: `packages/core` first (because it's a dependency)
3. **Then rebuilds**: All apps that depend on `packages/core` (lifestyle, boundless, sorella, etc.)
4. **Skips**: Apps that didn't change and don't depend on changed packages

### Example Workflow

```bash
# Build all apps and packages
turbo run build

# Build only apps (not packages)
turbo run build --filter='./apps/*'

# Build a specific app
turbo run build --filter=lifestyle

# Build apps that depend on a changed package
turbo run build --filter='...@shared/core'
```

### Real-World Benefit

**Without Turborepo**:
- Change `packages/core` → manually rebuild 50 apps → takes hours

**With Turborepo**:
- Change `packages/core` → `turbo run build` → automatically rebuilds only what's needed → takes minutes

### Advanced Configuration Example

You could expand your `turbo.json` like this:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".expo/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "eas:build": {
      "cache": false,
      "dependsOn": ["build"]
    }
  }
}
```

This adds:
- **`lint`**: Lint all packages, cache nothing (linting is fast)
- **`test`**: Run tests after building dependencies, cache coverage reports
- **`eas:build`**: Don't cache EAS builds (they're cloud builds), but ensure local build completes first

---

## 3. Templates & Supporting Scripts

### Overview

When creating new apps, you need automation to:
1. Generate the app structure (folders, files)
2. Process assets (icons, splash screens)
3. Configure EAS and app metadata

This is handled by **templates** (Hygen) and **scripts** (Ruby/Node).

### 3.1 Hygen Generators

### What is Hygen?

**Hygen** is a code generator that creates files from templates. Think of it like a "cookie cutter" for code.

### How it works

**Template structure** (hypothetical - you'd create this):
```
_templates/
  app/
    new/
      App.tsx.ejs.t
      app.json.ejs.t
      package.json.ejs.t
```

**Template file example** (`_templates/app/new/App.tsx.ejs.t`):
```typescript
import Constants from 'expo-constants';
import { createApp } from '@shared/core';

const webViewUrl =
  (Constants.expoConfig?.extra as any)?.webViewUrl || 'https://<%= slug %>.mvt.so/';

export default createApp({ webViewUrl });
```

**Running the generator**:
```bash
hygen app new --slug my-new-app --name "My App"
```

**Result**: Creates `apps/my-new-app/App.tsx` with the template filled in:
```typescript
import Constants from 'expo-constants';
import { createApp } from '@shared/core';

const webViewUrl =
  (Constants.expoConfig?.extra as any)?.webViewUrl || 'https://my-new-app.mvt.so/';

export default createApp({ webViewUrl });
```

### Why use Hygen?

- ✅ **Consistency**: Every app has the same structure
- ✅ **Speed**: Generate 10 files in seconds instead of copy-pasting
- ✅ **Flexibility**: Templates can have conditional logic
- ✅ **Maintainability**: Update template once, regenerate all apps

### Example: Complete App Generator

**Template for `app.json`** (`_templates/app/new/app.json.ejs.t`):
```json
{
  "expo": {
    "name": "<%= name %>",
    "slug": "<%= slug %>",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "<%= iosBundleId %>"
    },
    "android": {
      "package": "<%= androidPackage %>"
    },
    "extra": {
      "webViewUrl": "https://<%= slug %>.mvt.so/",
      "appKey": "<%= slug %>"
    }
  }
}
```

**Usage**:
```bash
hygen app new \
  --slug fitness-app \
  --name "Fitness Pro" \
  --iosBundleId "com.company.fitnessapp" \
  --androidPackage "com.company.fitnessapp"
```

**Generates**: Complete `apps/fitness-app/app.json` with all values filled in.

---

### 3.2 Ruby/Node Scripts for Assets

### What are these?

**Ruby or Node scripts** handle tasks that templates can't do easily:
- Image processing (resize icons, generate splash screens)
- API calls (register app with EAS, fetch credentials)
- Complex file operations (copy assets, update multiple config files)

### Example: Icon Processing Script

**Ruby script** (`scripts/process_icons.rb`):
```ruby
#!/usr/bin/env ruby

require 'mini_magick'

app_slug = ARGV[0]
icon_path = ARGV[1] || "assets/base-icon.png"

# Resize to multiple sizes
sizes = [1024, 512, 256, 128, 64]

sizes.each do |size|
  image = MiniMagick::Image.open(icon_path)
  image.resize "#{size}x#{size}"
  image.write "apps/#{app_slug}/assets/icon-#{size}.png"
end

puts "✅ Generated icons for #{app_slug}"
```

**Usage**:
```bash
ruby scripts/process_icons.rb my-app assets/brand-icon.png
```

**Result**: Creates multiple icon sizes in `apps/my-app/assets/`.

### Example: EAS Configuration Script

**Node script** (`scripts/setup_eas.js`):
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appSlug = process.argv[2];
const appDir = path.join(__dirname, '..', 'apps', appSlug);

// Read app.json
const appJson = JSON.parse(fs.readFileSync(path.join(appDir, 'app.json'), 'utf8'));

// Initialize EAS project
console.log(`Setting up EAS for ${appSlug}...`);
execSync('eas project:init', { cwd: appDir, stdio: 'inherit' });

// Update eas.json with workspace root env
const easJson = JSON.parse(fs.readFileSync(path.join(appDir, 'eas.json'), 'utf8'));
easJson.build.preview.env = { EXPO_USE_METRO_WORKSPACE_ROOT: "1" };
easJson.build.production.env = { EXPO_USE_METRO_WORKSPACE_ROOT: "1" };

fs.writeFileSync(
  path.join(appDir, 'eas.json'),
  JSON.stringify(easJson, null, 2)
);

console.log(`✅ EAS configured for ${appSlug}`);
```

**Usage**:
```bash
node scripts/setup_eas.js my-app
```

**Result**: Configures EAS project and ensures `EXPO_USE_METRO_WORKSPACE_ROOT` is set.

---

### 3.3 All Localized to `apps/{slug}`

### What does this mean?

**"All localized to `apps/{slug}`"** means:
- All app-specific files live in `apps/{app-name}/`
- Scripts and templates generate files **inside** that directory
- No global state or shared app-specific configs

### Directory Structure After Generation

```
apps/
  my-new-app/              ← Everything for this app is here
    ├── App.tsx           ← Generated by Hygen
    ├── app.json          ← Generated by Hygen
    ├── eas.json          ← Generated by Hygen or script
    ├── package.json      ← Generated by Hygen
    ├── assets/           ← Processed by Ruby/Node scripts
    │   ├── icon.png
    │   ├── splash.png
    │   └── adaptive-icon.png
    └── google-services.json  ← App-specific (if needed)
```

### Why this matters

- ✅ **Isolation**: Each app is self-contained
- ✅ **Easy deletion**: Remove `apps/my-app/` folder → app is gone
- ✅ **Clear ownership**: Everything for an app is in one place
- ✅ **EAS compatibility**: EAS expects `app.json` and `eas.json` in the app directory

### Complete Workflow Example

**Master script** (`scripts/new-app.sh`):
```bash
#!/bin/bash

SLUG=$1
NAME=$2
IOS_BUNDLE=$3
ANDROID_PACKAGE=$4

echo "Creating app: $SLUG"

# 1. Generate files with Hygen
hygen app new \
  --slug "$SLUG" \
  --name "$NAME" \
  --iosBundleId "$IOS_BUNDLE" \
  --androidPackage "$ANDROID_PACKAGE"

# 2. Process assets with Ruby
ruby scripts/process_icons.rb "$SLUG" "templates/base-icon.png"
ruby scripts/generate_splash.rb "$SLUG" "templates/base-splash.png"

# 3. Configure EAS with Node
node scripts/setup_eas.js "$SLUG"

# 4. Install dependencies
cd "apps/$SLUG"
pnpm install

echo "✅ App $SLUG created successfully!"
```

**Usage**:
```bash
./scripts/new-app.sh fitness-app "Fitness Pro" com.company.fitness com.company.fitness
```

**Result**: Complete app structure in `apps/fitness-app/` ready to build and deploy.

---

## Summary

1. **pnpm Workspace**: Manages dependencies across multiple packages in one repo, saving space and ensuring consistency
2. **Turborepo**: Orchestrates builds intelligently with caching and parallelization
3. **Templates & Scripts**: Automate app creation with Hygen (file generation) and Ruby/Node scripts (asset processing, EAS setup)

Together, these tools make managing 50+ apps feasible and maintainable.

