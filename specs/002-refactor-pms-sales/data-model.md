# Data Model: PMS Sales Refactor

**Created**: Tuesday, September 9, 2025  
**Purpose**: Define entities and relationships for meter-based PMS sales capture

## Core Entities

### 1. Pump Configuration

**Purpose**: Define pump setup and capabilities per station

```typescript
interface PumpConfiguration {
  id: string
  stationId: string
  pumpNumber: string // "Pump 1", "Pump 2A", etc.
  pmsProductId: string // Link to products table where type = 'pms'
  isActive: boolean
  meterCapacity: number // Maximum meter reading before rollover
  installDate: Date
  lastCalibrationDate: Date | null
  status: "active" | "maintenance" | "calibration" | "repair"
  createdAt: Date
  updatedAt: Date
}
```

**Relationships**:

- Belongs to Station (station.id)
- Associated with PMS Product (products.id where type = 'pms')
- Has many PumpMeterReadings

**Validation Rules**:

- pumpNumber must be unique within station
- meterCapacity > 0
- installDate <= current date
- lastCalibrationDate <= current date if not null

### 2. Pump Meter Reading

**Purpose**: Store daily opening and closing meter readings per pump

```typescript
interface PumpMeterReading {
  id: string
  pumpId: string // Reference to PumpConfiguration
  readingDate: Date // Date without time (YYYY-MM-DD)
  readingType: "opening" | "closing"
  meterValue: number // Actual meter reading
  recordedBy: string // User ID who entered the reading
  recordedAt: Date // Timestamp when reading was entered
  isEstimated: boolean // True if estimated due to missing data
  estimationMethod: "transaction_based" | "historical_average" | "manual" | null
  notes: string | null // Optional notes about reading
  isModified: boolean // Track if reading was changed after initial entry
  originalValue: number | null // Store original value if modified
  modifiedBy: string | null // User who modified
  modifiedAt: Date | null // When modification occurred
  createdAt: Date
}
```

**Relationships**:

- Belongs to PumpConfiguration (pump_configurations.id)
- Recorded by User (users.id)
- Modified by User (users.id)

**Validation Rules**:

- Only one opening and one closing reading per pump per date
- meterValue >= 0
- recordedAt cannot be in future
- If isModified, must have originalValue, modifiedBy, modifiedAt
- Closing reading date must be same as opening reading date

### 3. Daily PMS Calculation

**Purpose**: Store calculated sales volumes and revenue from meter readings

```typescript
interface DailyPMSCalculation {
  id: string
  pumpId: string // Reference to PumpConfiguration
  calculationDate: Date // Date of calculation (YYYY-MM-DD)
  openingReading: number
  closingReading: number
  volumeDispensed: number // Calculated volume (handles rollovers)
  unitPrice: number // PMS price on calculation date
  totalRevenue: number // volumeDispensed * unitPrice
  hasRollover: boolean // True if meter rollover occurred
  rolloverValue: number | null // Meter capacity if rollover happened
  deviationFromAverage: number // Percentage deviation from 7-day avg
  isEstimated: boolean // True if based on estimated readings
  calculationMethod: "meter_readings" | "estimated" | "manual_override"
  calculatedBy: string // User ID (system or user for overrides)
  calculatedAt: Date
  approvedBy: string | null // Manager approval for estimates/overrides
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

**Relationships**:

- Belongs to PumpConfiguration (pump_configurations.id)
- Calculated by User (users.id)
- Approved by User (users.id)

**Validation Rules**:

- One calculation per pump per date
- volumeDispensed >= 0
- If hasRollover, must have rolloverValue
- If isEstimated or calculationMethod != 'meter_readings', should have approvedBy

### 4. PMS Sales Record

**Purpose**: Aggregated daily PMS sales per station for reporting integration

```typescript
interface PMSSalesRecord {
  id: string
  stationId: string
  recordDate: Date
  totalVolumeDispensed: number // Sum across all pumps
  totalRevenue: number // Sum across all pumps
  averageUnitPrice: number // Weighted average
  pumpCount: number // Number of active pumps
  estimatedVolumeCount: number // Volume from estimated readings
  calculationDetails: {
    pumpCalculations: Array<{
      pumpId: string
      pumpNumber: string
      volume: number
      revenue: number
      isEstimated: boolean
    }>
  }
  createdAt: Date
  updatedAt: Date
}
```

**Relationships**:

- Belongs to Station (stations.id)
- Derived from DailyPMSCalculations

**Validation Rules**:

- One record per station per date
- totalVolumeDispensed = sum of pump volumes
- totalRevenue = sum of pump revenues

## State Transitions

### Pump Status Transitions

```
active → maintenance → active
active → calibration → active
active → repair → active
maintenance → repair → active
calibration → repair → active
```

### Meter Reading Lifecycle

```
1. Opening reading entered → Pending closing reading
2. Closing reading entered → Ready for calculation
3. Calculation generated → Complete
4. Modification allowed → Updated (if within time window)
```

### Calculation Approval Flow

```
1. Auto-calculated from actual readings → Approved
2. Estimated calculation → Pending approval → Approved/Rejected
3. Manual override → Pending approval → Approved/Rejected
```

## Database Schema Changes

### New Tables

- `pump_configurations`
- `pump_meter_readings`
- `daily_pms_calculations`
- `pms_sales_records`

### Index Requirements

- `pump_meter_readings`: (pump_id, reading_date, reading_type)
- `daily_pms_calculations`: (pump_id, calculation_date)
- `pms_sales_records`: (station_id, record_date)

### Migration Considerations

- Existing `products` table unchanged (maintains PMS products)
- Existing `transactions`/`transaction_items` preserved for lubricants
- New tables start with fresh data (no historical migration needed)
- Reports will show transition date between old/new calculation methods
