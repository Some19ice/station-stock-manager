# Research: PMS Sales Refactor

**Created**: Tuesday, September 9, 2025  
**Purpose**: Resolve NEEDS CLARIFICATION items from specification

## Research Tasks

### 1. Multiple Pumps Per Station Handling

**Decision**: Support multiple PMS pumps per station with individual meter tracking

**Rationale**:

- Gas stations typically have 4-8 pumps for PMS products
- Each pump has independent meters that must be tracked separately
- Allows for pump-specific maintenance, calibration, and troubleshooting
- Enables detection of individual pump malfunctions

**Alternatives considered**:

- Single aggregated meter reading (rejected - loses granular control)
- Average calculations across pumps (rejected - masks individual pump issues)

**Implementation approach**:

- Database table for pump configurations per station
- Daily meter readings captured per pump
- Aggregated calculations for station-level reporting

### 2. Meter Rollover Scenarios

**Decision**: Handle meter rollovers with validation and rollover detection

**Rationale**:

- Mechanical meters can rollover after reaching maximum value (e.g., 999,999.9)
- Digital meters may reset to zero during maintenance
- Need automatic detection and manual override capability

**Alternatives considered**:

- Ignore rollovers (rejected - causes data loss)
- Manual-only rollover handling (rejected - error-prone)

**Implementation approach**:

- Detect when closing < opening reading
- Prompt user to confirm rollover vs. data entry error
- Calculate actual dispensed volume accounting for rollover
- Log rollover events for audit trail

### 3. Data Modification Time Limits

**Decision**: Allow modifications until next business day opening (6 AM next day)

**Rationale**:

- Staff may discover errors after initial entry
- End-of-day reconciliation may require corrections
- Prevents historical tampering while allowing reasonable correction window
- Aligns with typical gas station operating procedures

**Alternatives considered**:

- No modifications allowed (rejected - too restrictive)
- 24-hour window (rejected - too long for business cycle)
- Manager-only modifications (considered for future enhancement)

**Implementation approach**:

- Time-based validation on meter reading updates
- Audit log of all modifications with timestamps
- Warning notifications for late modifications

### 4. Significant Deviation Thresholds

**Decision**: 20% variance from rolling 7-day average triggers alert

**Rationale**:

- Gas station sales typically have predictable daily patterns
- 20% variance indicates potential meter issues or unusual activity
- 7-day rolling average accounts for weekly patterns (weekends vs. weekdays)
- Configurable threshold per station for different contexts

**Alternatives considered**:

- Fixed volume thresholds (rejected - doesn't scale across stations)
- Same-day comparison (rejected - doesn't account for legitimate variance)
- 30% threshold (rejected - too permissive for catching issues)

**Implementation approach**:

- Calculate rolling averages for each pump
- Compare daily calculations against threshold
- Generate alerts for investigation
- Allow threshold configuration per station

### 5. Fallback Mechanism for Missing Readings

**Decision**: Three-tier fallback system

**Rationale**:

- Equipment failures, staff absences, or system issues may prevent readings
- Business must continue operations with reasonable estimates
- Audit trail must document when estimates are used

**Alternatives considered**:

- Block operations until readings entered (rejected - disrupts business)
- Use previous day's volumes (rejected - inaccurate)

**Implementation approach**:

1. **Primary**: Staff-entered meter readings
2. **Secondary**: Estimated based on transaction volumes (if PMS transactions still recorded)
3. **Tertiary**: Previous day volume + variance based on historical patterns

- Clear flagging of estimated vs. actual readings
- Required manager approval for estimates
- Priority alerts to obtain actual readings

### 6. Pump Maintenance/Calibration Periods

**Decision**: Maintenance mode with service tracking

**Rationale**:

- Pumps require periodic maintenance, calibration, and repairs
- Sales calculations must account for pump downtime
- Maintenance history helps with troubleshooting

**Alternatives considered**:

- Ignore maintenance periods (rejected - skews calculations)
- Manual calculation adjustments (rejected - error-prone)

**Implementation approach**:

- Pump status tracking (active/maintenance/calibration/repair)
- Exclude maintenance periods from calculations
- Service log integration with meter reading system
- Automatic resumption when pump returns to service

## Best Practices Research

### Drizzle ORM Schema Changes

**Approach**: Use Drizzle migrations for new tables

- Create pump_configurations table
- Create pump_meter_readings table
- Create daily_pms_calculations table
- Maintain foreign key relationships
- Add indexes for date-based queries

### Real-time Updates Architecture

**Approach**: Server Actions with optimistic updates

- Use React Server Actions for data mutations
- Implement optimistic UI updates
- Error handling with rollback capability
- Real-time dashboard refresh using React 19 features

### Integration with Existing Reports

**Approach**: Extend existing report actions

- Modify actions/reports.ts to use meter-based calculations
- Maintain backward compatibility for historical data
- Add new PMS-specific reporting endpoints
- Update dashboard queries to aggregate meter data

## Summary

All NEEDS CLARIFICATION items have been researched and resolved with specific implementation approaches. The decisions prioritize operational flexibility, data accuracy, and integration with existing systems while maintaining audit capabilities and business continuity.
