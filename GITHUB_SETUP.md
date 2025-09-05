# GitHub Setup Instructions

## 1. Create GitHub Issues

Go to your repository: https://github.com/Some19ice/station-stock-manager/issues

Create the following issues using the templates in `DASHBOARD_ISSUES.md`:

### Critical Issues (Create First):
1. **[BUG] Dashboard page has infinite re-render risk** - COMPLETED ✅
2. **[BUG] Race conditions in dashboard data loading**
3. **[BUG] useDashboardCache hook has circular dependencies**

### Performance Issues:
4. **[PERF] Dashboard components cause excessive re-renders**
5. **[PERF] GSAP timelines and event listeners not cleaned up**
6. **[PERF] Redundant animation libraries increase bundle size**

### Code Quality Issues:
7. **[TECH-DEBT] Mixed client/server patterns and missing types**
8. **[ENHANCEMENT] Improve error handling with retry mechanisms**

### Enhancement Issues:
9. **[A11Y] Dashboard missing ARIA labels and keyboard navigation**
10. **[ENHANCEMENT] Dashboard not optimized for mobile devices**

## 2. Create Pull Request

Visit: https://github.com/Some19ice/station-stock-manager/pull/new/fix/dashboard-infinite-rerender

**Title:** `fix: resolve infinite re-render issue in dashboard page`

**Description:**
```
## Description
Fixed infinite re-render issue in dashboard page by using useRef pattern instead of useCallback with dependencies.

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [x] Performance improvement

## Related Issues
Closes #[issue_number_for_infinite_rerender]

## Changes Made
- Use useRef pattern to avoid useCallback dependency issues
- Properly manage AbortController lifecycle  
- Prevent race conditions in data loading
- Add proper cleanup for async operations

## Testing
- [x] Manual testing completed
- [x] No console errors or warnings
- [x] Dashboard loads without infinite re-renders
```

## 3. Create Project Board (Optional)

1. Go to Projects tab in your repository
2. Create new project: "Dashboard Performance Fixes"
3. Add columns: "To Do", "In Progress", "Review", "Done"
4. Add all created issues to the project

## 4. Set Up Branch Protection (Recommended)

1. Go to Settings > Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

## 5. Next Steps

After creating the issues and PR:

1. **Merge the first PR** after review
2. **Switch to next branch**: `git checkout dashboard-performance-fixes`
3. **Create next fix branch**: `git checkout -b fix/race-conditions`
4. **Continue with remaining fixes** following the same pattern

## Branch Strategy Summary

```
main (protected)
├── dashboard-performance-fixes (feature branch)
    ├── fix/dashboard-infinite-rerender ✅ (COMPLETED)
    ├── fix/race-conditions (next)
    ├── fix/cache-hook-issues
    ├── perf/component-memoization
    ├── perf/animation-cleanup
    └── perf/bundle-optimization
```
