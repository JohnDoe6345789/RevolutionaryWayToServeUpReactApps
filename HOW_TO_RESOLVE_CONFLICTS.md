# How to Resolve Pull Request Merge Conflicts

This guide explains how to use the tooling from PR #41 to resolve merge conflicts in open pull requests.

## Quick Start

### Step 1: Analyze Conflicts

Run the analysis script to identify which PRs have conflicts:

```bash
python3 scripts/analyze-conflicts.py
```

This will:
- Fetch all PR branches
- Compare them with main
- Identify conflicting files
- Generate `conflict-analysis.json` with detailed results

### Step 2: Attempt Automated Resolution

Try the automated resolution script:

```bash
bash scripts/resolve-merge-conflicts.sh
```

This script will:
- Fetch each PR branch
- Attempt to merge main into it
- Report which PRs need manual resolution
- Show which specific files have conflicts

**Note:** The script does not have push permissions, so you'll need to push resolved branches manually.

### Step 3: Manual Resolution (If Needed)

For PRs that couldn't be automatically resolved, follow the recommended order:

1. **PR #36** - Fix lint issues (simplest)
2. **PR #37** - Move test primitives (depends on #36)
3. **PR #40** - One function per file (depends on #36, #37)
4. **PR #38** - Interface refactoring (independent)
5. **PR #32** - Generator enhancements (most complex)

## Current Conflict Status

Based on the latest analysis:

| PR | Title | Conflicting Files | Priority |
|----|-------|-------------------|----------|
| #36 | Fix lint issues | 1 (`hero-section.tsx`) | 🔴 High |
| #37 | Move test primitives | 1 (`hero-section.tsx`) | 🔴 High |
| #40 | One function per file | 1 (`hero-section.tsx`) | 🔴 High |
| #38 | Interface refactoring | 3 (codegen files) | 🟡 Medium |
| #32 | Generator enhancements | 4 (codegen files) | 🟡 Medium |

## Documentation Resources

- **`CONFLICT_DETAILS.md`** - Detailed analysis of each PR with merge bases and file counts
- **`RESOLUTION_EXAMPLES.md`** - Code-level examples showing how to resolve specific conflicts
- **`MERGE_CONFLICT_RESOLUTION.md`** - General Git workflow for conflict resolution
- **`README-CONFLICTS.md`** - Comprehensive guide covering all aspects

## Key Insight

**Three PRs (#36, #37, #40) all conflict on the same file:** `retro-react-app/src/components/hero-section.tsx`

Resolving them in the recommended order (#36 → #37 → #40) minimizes repeated conflict resolution on the same file.

## Manual Resolution Workflow

For each PR that needs manual resolution:

```bash
# 1. Checkout the PR branch
git fetch origin <branch-name>
git checkout <branch-name>

# 2. Merge main
git merge main

# 3. If conflicts occur, resolve them
# - Edit conflicted files
# - Look for <<<<<<< HEAD, =======, >>>>>>> main markers
# - Refer to RESOLUTION_EXAMPLES.md for specific guidance

# 4. Complete the merge
git add <resolved-files>
git commit

# 5. Test your changes
npm install  # If needed
npm run lint
npm run build
npm test

# 6. Push the resolved branch
git push origin <branch-name>

# 7. Verify on GitHub
# - Check that "Merge conflict" message is gone
# - CI checks should pass
```

## Resolution Examples

See `RESOLUTION_EXAMPLES.md` for detailed examples of how to resolve conflicts in each specific file, including:

- PR #36: ConsoleIcon extraction vs inline definition
- PR #37: Test fixture imports
- PR #40: Function extraction patterns
- PR #38: Interface file splitting
- PR #32: Generator enhancements with type reorganization

## Testing After Resolution

After resolving conflicts:

```bash
npm install    # Update dependencies if needed
npm run lint   # Verify code style
npm run build  # Ensure it compiles
npm test       # Verify tests pass
```

## Success Criteria

A PR is successfully resolved when:

1. ✅ GitHub no longer shows "Merge conflict" message
2. ✅ All CI checks pass
3. ✅ Code compiles without errors
4. ✅ Linter passes
5. ✅ All tests pass
6. ✅ Functionality is preserved

## Need Help?

- Review the original PR description for context
- Check `RESOLUTION_EXAMPLES.md` for code-level guidance
- Compare changes: `git diff main...<branch-name>`
- Ask the PR author if needed
