# Research: Theme Management

**Branch**: `001-add-theme-management` | **Date**: 2025-09-09 | **Spec**: [./spec.md](./spec.md)

## 1. Theme Management in Next.js and Tailwind CSS

### Decision
We will use the `next-themes` library for managing theme switching (light/dark mode) and CSS custom properties for the color palette.

### Rationale
- The `next-themes` library is a popular and well-maintained solution that simplifies theme management in Next.js. It handles theme persistence and system preference detection automatically.
- CSS custom properties provide a flexible way to manage color palettes and allow for dynamic theme updates. This approach is recommended by the search results and integrates well with Tailwind CSS.

### Alternatives Considered
- A purely manual implementation using React Context and `localStorage`. This would require more boilerplate code and would not be as robust as using `next-themes`.

## 2. Storing Theme Settings with Drizzle ORM

### Decision
We will use a `jsonb` column in our PostgreSQL database to store theme settings.

### Rationale
- The `jsonb` data type is optimized for query performance and supports indexing, which is ideal for our use case.
- Drizzle ORM provides excellent support for `jsonb` columns, including type safety with the `.$type<T>()` method.
- We will define a GIN index on the `jsonb` column to ensure fast lookups.

### Alternatives Considered
- Storing each theme setting in a separate column (e.g., `primary_color`, `mode`). This is less flexible and would require schema migrations if we want to add more theme options in the future.

## 3. Default Theme Color Palettes

### Decision
We will adopt a standard set of color palettes for light and dark modes, as recommended by the research.

### Rationale
- Using a well-defined color palette ensures good contrast and readability, meeting accessibility standards.
- We will avoid pure black and white to reduce eye strain.
- Desaturated colors will be used in dark mode for better visual appeal.

### Light Mode Palette
| Use Case | Color | HEX |
| :--- | :--- | :--- |
| **Background** | White | `#FFFFFF` |
| **Surface** | Light Gray | `#F5F5F5` |
| **Text** | Near Black | `#1A1A1A` |
| **Secondary Text** | Gray | `#6B7280` |
| **Primary Accent** | Blue | `#3B82F6` |

### Dark Mode Palette
| Use Case | Color | HEX |
| :--- | :--- | :--- |
| **Background** | Near Black | `#121212` |
| **Surface** | Dark Gray | `#1E1E1E` |
| **Text** | Off-White | `#E5E5E5` |
| **Secondary Text** | Light Gray | `#9CA3AF` |
| **Primary Accent** | Desaturated Blue | `#60A5FA` |
