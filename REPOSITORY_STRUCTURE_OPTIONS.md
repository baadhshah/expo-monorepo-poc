# Repository Structure Options for POC

## Question: Single Monorepo vs Individual Repositories?

**Short Answer**: **Single monorepo is REQUIRED** for the proposed solution to work effectively.

---

## Option 1: Single Monorepo (✅ Recommended & Required)

### Structure
```
expo-monorepo-poc/          # Single Git repository
├── apps/
│   ├── app1/
│   ├── app2/
│   └── app3/
├── packages/
│   ├── core/
│   └── expo-preset/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### Why This is Required

#### 1. **pnpm Workspaces Dependency**
- pnpm workspaces **only work within a single repository**
- The `workspace:*` protocol requires packages to be in the same repo
- Example:
  ```json
  // apps/app1/package.json
  {
    "dependencies": {
      "@fitterapp/core": "workspace:*"  // Only works in same repo
    }
  }
  ```

#### 2. **Shared Code Management**
- Shared packages (`@fitterapp/core`) must be in the same repo
- Can't easily share code across separate repos without publishing to npm
- Version synchronization becomes difficult

#### 3. **Turborepo Benefits**
- Turborepo works best with a monorepo structure
- Build caching and task orchestration require single repo
- Dependency graph analysis needs all packages in one place

#### 4. **Centralized Dependency Management**
- Single `packages/expo-preset` package manages all versions
- Update once, applies to all apps automatically
- Can't achieve this with separate repos

#### 5. **Single node_modules**
- pnpm creates one shared `node_modules` directory
- Saves disk space (10-15 GB → ~500 MB)
- Only possible in monorepo

### Benefits
- ✅ Shared code via workspace protocol
- ✅ Centralized dependencies
- ✅ Single `node_modules` (disk efficient)
- ✅ Turborepo caching works
- ✅ Atomic commits across apps
- ✅ Easier dependency updates

### Drawbacks
- ⚠️ Larger repository size
- ⚠️ All apps in one place (but this is actually a benefit)

---

## Option 2: Individual Repositories (❌ Not Recommended)

### Structure
```
repo-app1/                  # Separate Git repository
├── package.json
└── src/

repo-app2/                  # Separate Git repository
├── package.json
└── src/

repo-app3/                  # Separate Git repository
├── package.json
└── src/

repo-shared/                # Separate Git repository (shared code)
└── packages/
    └── core/
```

### Why This Doesn't Work Well

#### 1. **No Workspace Protocol**
- Can't use `workspace:*` dependencies
- Must publish shared packages to npm (or use git submodules)
- Version management becomes complex

#### 2. **Dependency Duplication**
- Each repo has its own `node_modules`
- Loses disk space savings (back to 10-15 GB)
- Each repo needs separate dependency updates

#### 3. **No Turborepo Benefits**
- Can't use Turborepo effectively across repos
- No build caching between repos
- No task orchestration

#### 4. **Code Sharing Complexity**
- Must publish `@fitterapp/core` to npm (or use git submodules)
- Version synchronization issues
- Update process: update shared package → publish → update each app repo

#### 5. **CI/CD Complexity**
- Need separate CI/CD for each repo
- Can't build all apps in parallel easily
- More complex automation

### Workarounds (Not Recommended)

#### Option 2A: Git Submodules
```
repo-app1/
├── .gitmodules
└── packages/ (submodule to repo-shared)
```
**Problems:**
- Complex to manage
- Submodule updates are manual
- Team members must understand submodules
- Doesn't solve dependency management

#### Option 2B: Publish to npm
- Publish `@fitterapp/core` to npm
- Each app installs from npm
**Problems:**
- Must publish for every change (slow iteration)
- Version management overhead
- Can't use `workspace:*` protocol
- Loses monorepo benefits

#### Option 2C: Git Subtree
- Similar to submodules but different approach
**Problems:**
- Still complex
- Doesn't solve core issues

---

## Comparison Table

| Feature | Single Monorepo | Individual Repos |
|---------|----------------|------------------|
| **Shared Code** | ✅ Easy (`workspace:*`) | ❌ Complex (npm/git submodules) |
| **Dependency Management** | ✅ Centralized | ❌ Per-repo |
| **Disk Space** | ✅ Single node_modules | ❌ Multiple node_modules |
| **Turborepo** | ✅ Full support | ❌ Limited/None |
| **Build Caching** | ✅ Works | ❌ Doesn't work |
| **Update Process** | ✅ Update once | ❌ Update each repo |
| **CI/CD** | ✅ Single pipeline | ❌ Multiple pipelines |
| **Atomic Commits** | ✅ Yes | ❌ No |
| **EAS Build** | ✅ Works per app | ✅ Works per app |
| **Complexity** | ✅ Low | ❌ High |

---

## Real-World Example

### Single Monorepo (Recommended)
```bash
# Update Expo SDK for all apps
cd packages/expo-preset
pnpm update expo@~53.0.0
cd ../..
pnpm install  # Updates all apps automatically

# Build all apps
turbo run build --filter='./apps/*'
```

### Individual Repos (Not Recommended)
```bash
# Update Expo SDK for all apps
cd repo-shared/packages/core
# Update dependencies
npm publish  # Publish new version

cd ../../repo-app1
npm install @fitterapp/core@latest
npm update expo@~53.0.0

cd ../repo-app2
npm install @fitterapp/core@latest
npm update expo@~53.0.0

cd ../repo-app3
npm install @fitterapp/core@latest
npm update expo@~53.0.0

# Build each app separately
cd repo-app1 && npm run build
cd ../repo-app2 && npm run build
cd ../repo-app3 && npm run build
```

---

## EAS Build Compatibility

### ✅ Both Options Work with EAS

**Single Monorepo:**
```bash
cd apps/app1
eas build --platform android
```

**Individual Repos:**
```bash
cd repo-app1
eas build --platform android
```

**EAS Build works the same way** - it builds from the current directory. The repository structure doesn't affect EAS Build functionality.

---

## Recommendation

### ✅ Use Single Monorepo

**Reasons:**
1. **Core Requirement**: The entire refactoring proposal is built on monorepo architecture
2. **pnpm Workspaces**: Requires single repo
3. **Shared Packages**: Much easier in monorepo
4. **Dependency Management**: Centralized approach only works in monorepo
5. **Turborepo**: Designed for monorepos
6. **EAS Compatibility**: Works perfectly with monorepo

### ❌ Don't Use Individual Repos

**Reasons:**
1. Loses most benefits of the refactoring
2. More complex to manage
3. Doesn't solve the core problems (code duplication, dependency management)
4. Defeats the purpose of the refactoring

---

## POC Structure (Recommended)

```
expo-monorepo-poc/          # Single Git repository
├── .git/
├── apps/
│   ├── lifestyle/        # App 1
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── package.json
│   │   └── App.tsx
│   ├── boundless/ # App 2
│   └── sorella/     # App 3
├── packages/
│   ├── core/               # Shared code
│   │   ├── src/
│   │   └── package.json
│   └── expo-preset/        # Centralized dependencies
│       └── package.json
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # Workspace definition
├── turbo.json              # Build orchestration
└── README.md
```

**All in ONE Git repository.**

---

## FAQ

### Q: Can we use separate repos and link them somehow?
**A**: Technically yes (git submodules, npm packages), but you lose all the benefits of the monorepo approach. The refactoring is specifically designed for monorepo architecture.

### Q: What if we want to keep apps separate for organizational reasons?
**A**: You can still organize within a monorepo:
- Use `apps/` directory for all apps
- Each app is independent for EAS Build
- Can have separate CI/CD workflows per app
- But share code and dependencies

### Q: Does EAS Build work with monorepo?
**A**: Yes, perfectly! EAS Build runs from each app directory independently. The monorepo structure doesn't affect EAS Build at all.

### Q: What about Git history? Will it be messy?
**A**: No, Git handles monorepos well. You can:
- Use `git log -- apps/app1/` to see history for one app
- Use path-based filtering
- Each app's history is preserved

### Q: Can we migrate to monorepo later?
**A**: Yes, but it's easier to start with monorepo for the POC. Migration later would require:
- Moving all apps to one repo
- Setting up workspace structure
- Updating CI/CD

---

## Conclusion

**For the POC, use a SINGLE monorepo with all 3 apps.**

This is:
- ✅ Required for the proposed architecture
- ✅ Required for pnpm workspaces
- ✅ Required for Turborepo benefits
- ✅ Required for centralized dependency management
- ✅ Compatible with EAS Build
- ✅ The foundation of the entire refactoring solution

**Individual repositories would defeat the purpose of the refactoring and lose most of its benefits.**

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Repository Structure Decision



