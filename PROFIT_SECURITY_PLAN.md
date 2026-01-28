# Execution Plan: "Profit Security System" Rebrand

## Objective
Transform `station-stock-manager` from a generic inventory tool into a high-converting "Profit Security System" for gas station owners. Focus on loss prevention, real-time tracking, and mobile usability.

## Phase 1: High-Impact Marketing Rebrand (Landing Page)
**Goal:** Convert visitors (owners) by addressing their fear of theft/loss.
- [ ] **Hero Section (`app/(unauthenticated)/(marketing)/_components/sections/hero-section.tsx`)**:
  - Change Headline: "Stop Fuel Theft. Secure Your Station's Profits."
  - Subheadline: "Real-time inventory tracking, anti-theft shift reports, and automated leak detection. The only system designed for Nigerian station owners."
  - Call to Action: "Secure My Station" (instead of "Get Started").
- [ ] **Features Section (`app/(unauthenticated)/(marketing)/_components/sections/features-section.tsx`)**:
  - Rename "Inventory Management" -> "Leak & Theft Detection".
  - Rename "Reports" -> "Daily Profit Reconciliation".
  - Rename "Staff Management" -> "Shift Accountability Logs".
- [ ] **Demo Mode**:
  - Add a visible "View Live Demo" button that auto-fills manager credentials (simulated).

## Phase 2: Visual Urgency (Dashboard UI)
**Goal:** Make the manager feel in control immediately.
- [ ] **Dashboard (`app/(authenticated)/dashboard/page.tsx`)**:
  - **Live Ticker:** Add a scrolling ticker of recent sales (simulated or real).
  - **Alerts:** Make "Low Stock" and "Discrepancy" alerts visually screaming (Red/Pulse).
  - **Revenue Card:** Highlight "Today's Cash in Hand" vs "Expected Cash".

## Phase 3: Mobile Optimization (Attendant Experience)
**Goal:** Zero friction for staff to prevent "I forgot to log it" excuses.
- [ ] **Mobile Sales Interface (`components/sales/mobile-sales-interface.tsx`)**:
  - Increase button sizes for "Petrol", "Diesel", "Kerosene".
  - Simplify the checkout flow to 2 taps: [Select Product] -> [Enter Amount] -> [Save].
  - Add "Offline Mode" indicator (visual only for now).

## Execution Order
1.  **Refactor Landing Page** (Immediate impact for sales pitches).
2.  **Enhance Dashboard Visuals** (The "Wow" factor).
3.  **Optimize Mobile Flow** (The "Usability" factor).
4.  **Verify & Push** (PR creation).

---
*Created by S4lty for Yaks. Mission: Zero Capital Revenue.*
