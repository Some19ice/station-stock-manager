# Tasks: Theme Management

**Input**: Design documents from `/specs/001-add-theme-management/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Phase 3.1: Setup
- [ ] T001: Install `next-themes` dependency.
- [ ] T002: Configure `tailwind.config.js` for `next-themes` by adding `darkMode: 'class'`.
- [ ] T003: Wrap the root layout in `app/layout.tsx` with the `ThemeProvider` from `next-themes`.

## Phase 3.2: Database
- [ ] T004: Create a new schema file `db/schema/theme.ts` for the `themeSettings` table as defined in `data-model.md`.
- [ ] T005: Generate a new database migration for the `themeSettings` table.
- [ ] T006: Apply the new migration to the database.

## Phase 3.3: Backend
- [ ] T007: [P] Create the failing contract test for the Theme API in `__tests__/actions/theme.test.ts` (already done).
- [ ] T008: Implement the `getThemeSettings` and `updateThemeSettings` server actions in `actions/theme.ts`.
- [ ] T009: Create API route handlers in `app/api/theme/route.ts` for the `GET` and `POST` endpoints defined in the OpenAPI contract.

## Phase 3.4: Frontend
- [ ] T010: [P] Create a `ThemeSwitcher` component in `components/dashboard/theme-switcher.tsx` that allows users to toggle between light and dark mode.
- [ ] T011: [P] Create a `ColorPicker` component in `components/dashboard/color-picker.tsx` for selecting the primary color.
- [ ] T012: Create a "Theme Settings" section in the main dashboard page `app/(authenticated)/dashboard/page.tsx` that includes the `ThemeSwitcher` and `ColorPicker` components.
- [ ] T013: Implement the logic to save and apply the selected theme using the `updateThemeSettings` action.
- [ ] T014: Ensure that the application's theme is loaded and applied on initial load using the `getThemeSettings` action.

## Phase 3.5: Polish & E2E Tests
- [ ] T015: [P] Write Playwright E2E tests for the theme management feature, following the scenarios in `quickstart.md`.
- [ ] T016: [P] Add unit tests for the `ThemeSwitcher` and `ColorPicker` components.
- [ ] T017: Review and refactor the code for clarity and performance.

## Dependencies
- T001, T002, T003 must be done before T010, T011, T012, T013, T014.
- T004, T005, T006 must be done before T008, T009.
- T007 must be done before T008, T009.
- T008, T009 must be done before T012, T013, T014.
- T010, T011 must be done before T012.

## Parallel Example
```
# Launch T010 and T011 together:
Task: "Create a ThemeSwitcher component in components/dashboard/theme-switcher.tsx"
Task: "Create a ColorPicker component in components/dashboard/color-picker.tsx"
```
