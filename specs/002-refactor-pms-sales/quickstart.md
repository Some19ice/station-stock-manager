# Quickstart Guide: PMS Sales Refactor

**Purpose**: Step-by-step validation of meter-based PMS sales capture system

## Prerequisites

- Station with PMS pumps configured
- Staff with meter reading permissions
- Manager with approval permissions
- Test PMS product with current pricing

## Access Control & Workflow

**Manager Access**: `/dashboard/meter-readings`

- Set up daily opening readings
- Configure pumps and handle deviations
- Approve estimated readings
- Full administrative control

**Staff Access**: `/staff/meter-readings`

- View opening readings set by manager
- Record closing readings for their shift
- Simplified data entry interface

## Test Scenario 1: Daily Meter Reading Workflow

### Setup

1. **Configure Test Pump (Manager)**
   ```
   POST /api/pump-configurations
   {
     "stationId": "test-station-uuid",
     "pumpNumber": "Test Pump 1",
     "pmsProductId": "pms-product-uuid",
     "meterCapacity": 999999.9,
     "installDate": "2025-09-09"
   }
   ```
   ✅ **Expected**: Pump configuration created with `status: "active"`

### Morning Opening Readings (Manager)

2. **Manager Records Opening Reading**

   ```
   POST /api/meter-readings
   {
     "pumpId": "test-pump-uuid",
     "readingDate": "2025-09-09",
     "readingType": "opening",
     "meterValue": 12345.5,
     "notes": "Morning opening - Pump 1"
   }
   ```

   ✅ **Expected**: Reading recorded with `isEstimated: false`

3. **Verify Daily Status**
   ```
   GET /api/meter-readings/daily-status?stationId=test-station&date=2025-09-09
   ```
   ✅ **Expected**: Shows `hasOpening: true, hasClosing: false`

### Evening Closing Readings (Staff)

4. **Staff Records Closing Reading**

   ```
   POST /api/meter-readings
   {
     "pumpId": "test-pump-uuid",
     "readingDate": "2025-09-09",
     "readingType": "closing",
     "meterValue": 12445.5,
     "notes": "Evening closing - Pump 1"
   }
   ```

   ✅ **Expected**: Reading recorded, triggers automatic calculation

5. **Verify Calculation Generated**
   ```
   GET /api/pms-calculations?stationId=test-station&startDate=2025-09-09&endDate=2025-09-09
   ```
   ✅ **Expected**:
   - `volumeDispensed: 100.0` (12445.5 - 12345.5)
   - `calculationMethod: "meter_readings"`
   - `isEstimated: false`
   - Revenue calculated from volume × unit price

## Test Scenario 2: Meter Rollover Handling

### Setup Rollover Scenario

6. **Record Opening Reading Near Capacity**

   ```
   POST /api/meter-readings
   {
     "pumpId": "test-pump-uuid",
     "readingDate": "2025-09-10",
     "readingType": "opening",
     "meterValue": 999950.0
   }
   ```

7. **Record Closing Reading After Rollover**

   ```
   POST /api/meter-readings
   {
     "pumpId": "test-pump-uuid",
     "readingDate": "2025-09-10",
     "readingType": "closing",
     "meterValue": 100.0
   }
   ```

   ⚠️ **Expected**: System detects potential rollover (closing < opening)

8. **Handle Rollover**
   ```
   POST /api/pms-calculations/rollover
   {
     "pumpId": "test-pump-uuid",
     "calculationDate": "2025-09-10",
     "rolloverValue": 999999.9,
     "newReading": 100.0
   }
   ```
   ✅ **Expected**:
   - Calculation shows `hasRollover: true`
   - Correct volume: (999999.9 - 999950.0) + 100.0 = 149.9

## Test Scenario 3: Estimated Reading & Approval

### Missing Reading Scenario

9. **Attempt Calculation with Missing Closing Reading**

   ```
   POST /api/pms-calculations
   {
     "stationId": "test-station-uuid",
     "calculationDate": "2025-09-11"
   }
   ```

   ✅ **Expected**:

   - Creates estimated calculation
   - `isEstimated: true`
   - `calculationMethod: "estimated"`
   - Pending manager approval

10. **Manager Approval**
    ```
    POST /api/pms-calculations/{calculation-id}/approve
    {
      "approved": true,
      "notes": "Approved estimated reading due to staff absence"
    }
    ```
    ✅ **Expected**: Calculation approved with timestamp

## Test Scenario 4: Deviation Detection

### High Volume Day

11. **Record Unusually High Sales**

    ```
    # Opening: 13000.0, Closing: 13500.0 (500L vs normal ~100L)
    ```

    ✅ **Expected**:

    - Calculation shows `deviationFromAverage > 20%`
    - Alert generated for investigation

12. **Check Deviation Report**
    ```
    GET /api/pms-calculations/deviations?stationId=test-station&thresholdPercent=20
    ```
    ✅ **Expected**: Lists calculations exceeding 20% variance

## Test Scenario 5: Integration with Existing Reports

### Daily Report Generation

13. **Generate Daily Report**
    ```
    GET /api/reports/daily?stationId=test-station&date=2025-09-09
    ```
    ✅ **Expected**:
    - PMS sales show meter-calculated values
    - Lubricant sales still show transaction-based values
    - Report totals include both methods

### Dashboard Integration

14. **Check Dashboard Metrics**
    ```
    GET /api/dashboard/metrics?date=2025-09-09
    ```
    ✅ **Expected**:
    - PMS sales reflect meter calculations
    - Stock levels updated based on dispensed volumes
    - Real-time updates working

## Test Scenario 6: Modification Window

### Late Reading Correction

15. **Attempt Next-Day Modification**

    ```
    PUT /api/meter-readings/{reading-id}
    {
      "meterValue": 12455.5,
      "notes": "Corrected reading - originally 12445.5"
    }
    ```

    ✅ **Expected**:

    - Allowed if within modification window (before 6 AM next day)
    - `isModified: true` with audit trail
    - Recalculation triggered automatically

16. **Attempt Expired Modification**
    ```
    # Try to modify reading after 6 AM next day
    ```
    ✅ **Expected**: `403 Forbidden - Modification window expired`

## Validation Checklist

- [ ] Pump configurations create successfully
- [ ] Opening and closing readings record properly
- [ ] Automatic calculations generate correct volumes/revenue
- [ ] Rollover detection and handling works
- [ ] Estimated readings require manager approval
- [ ] Deviation alerts trigger appropriately
- [ ] Existing lubricant sales workflow unchanged
- [ ] Reports integrate both calculation methods
- [ ] Dashboard shows real-time updates
- [ ] Modification window enforced correctly
- [ ] Audit trail captures all changes

## Performance Validation

- [ ] Meter reading entry: < 200ms response
- [ ] Daily calculation generation: < 1 second for 8 pumps
- [ ] Dashboard reload with new data: < 500ms
- [ ] Report generation: < 2 seconds for monthly data

## Rollback Plan

If validation fails:

1. Disable meter-based calculations in feature flags
2. Revert to transaction-based PMS sales
3. Preserve all meter reading data for later retry
4. Maintain full backward compatibility
