/**
 * T012: Integration test for modification window enforcement
 *
 * Tests the time window validation from quickstart Test Scenario 6
 * Validates 6 AM next day cutoff and audit trail requirements
 * MUST FAIL until modification window logic is implemented
 */

import { db } from "@/db"
import { pumpConfigurations, pumpMeterReadings } from "@/db/schema"
import { eq } from "drizzle-orm"

describe("Modification Window Enforcement Integration", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testProductId: string
  let testReadingId: string

  beforeEach(async () => {
    // Setup test data
    testStationId = "123e4567-e89b-12d3-a456-426614174000"
    testUserId = "123e4567-e89b-12d3-a456-426614174010"
    testProductId = "123e4567-e89b-12d3-a456-426614174011"

    const [pumpConfig] = await db
      .insert(pumpConfigurations)
      .values({
        stationId: testStationId,
        pmsProductId: testProductId,
        pumpNumber: "Test Pump 1",
        meterCapacity: 999999.9,
        installDate: "2025-09-09",
        status: "active"
      })
      .returning()

    testPumpId = pumpConfig.id
  })

  afterEach(async () => {
    // Cleanup test data
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
  })

  describe("Within Modification Window", () => {
    it("should allow modifications within same day", async () => {
      const testDate = "2025-09-09"

      // Record initial reading
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 40000.0,
            notes: "Initial opening reading"
          })
        }
      )

      // This MUST FAIL until meter readings API is implemented
      expect(createResponse.status).toBe(201)
      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Attempt modification within same day
      const modifyResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meterValue: 40005.0,
            notes: "Corrected reading - initially 40000.0"
          })
        }
      )

      expect(modifyResponse.status).toBe(200)

      // Verify modification was applied
      const readingsResponse = await fetch(
        `http://localhost:3000/api/meter-readings?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const readingsData = await readingsResponse.json()
      const modifiedReading = readingsData.data.find(
        (r: any) => r.id === testReadingId
      )

      expect(modifiedReading.meterValue).toBe(40005.0)
      expect(modifiedReading.notes).toBe(
        "Corrected reading - initially 40000.0"
      )
      expect(modifiedReading.isModified).toBe(true)
      expect(modifiedReading.originalValue).toBe(40000.0)
      expect(modifiedReading.modifiedBy).toBe(testUserId)
      expect(modifiedReading.modifiedAt).toBeTruthy()
    })

    it("should allow modifications until 6 AM next business day", async () => {
      const testDate = "2025-09-09" // Monday

      // Create reading late in the day (simulating)
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 40150.0,
            notes: "Evening closing reading"
          })
        }
      )

      expect(createResponse.status).toBe(201)
      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Simulate early morning modification (before 6 AM next day)
      // This would be allowed in the real system based on current time
      const earlyModifyResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Simulated-Time": "2025-09-10T05:30:00Z" // 5:30 AM next day
          },
          body: JSON.stringify({
            meterValue: 40155.0,
            notes: "Early morning correction"
          })
        }
      )

      expect(earlyModifyResponse.status).toBe(200)
    })

    it("should create proper audit trail for modifications", async () => {
      const testDate = "2025-09-10"

      // Initial reading
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 45000.0,
            notes: "Original reading"
          })
        }
      )

      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // First modification
      await fetch(`http://localhost:3000/api/meter-readings/${testReadingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterValue: 45010.0,
          notes: "First correction"
        })
      })

      // Second modification
      await fetch(`http://localhost:3000/api/meter-readings/${testReadingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterValue: 45015.0,
          notes: "Second correction"
        })
      })

      // Verify audit trail
      const readingsResponse = await fetch(
        `http://localhost:3000/api/meter-readings?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const readingsData = await readingsResponse.json()
      const finalReading = readingsData.data.find(
        (r: any) => r.id === testReadingId
      )

      // Should show final state
      expect(finalReading.meterValue).toBe(45015.0)
      expect(finalReading.notes).toBe("Second correction")
      expect(finalReading.isModified).toBe(true)
      expect(finalReading.originalValue).toBe(45000.0) // Original value preserved
      expect(finalReading.modifiedBy).toBe(testUserId)
      expect(finalReading.modifiedAt).toBeTruthy()

      // Should trigger recalculation if closing reading exists
      // (This would be tested in a full workflow scenario)
    })
  })

  describe("Outside Modification Window", () => {
    it("should reject modifications after 6 AM next business day", async () => {
      const testDate = "2025-09-11"

      // Create reading
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 50000.0,
            notes: "Original reading"
          })
        }
      )

      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Simulate modification attempt after 6 AM next day
      const lateModifyResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Simulated-Time": "2025-09-12T06:30:00Z" // 6:30 AM next day
          },
          body: JSON.stringify({
            meterValue: 50005.0,
            notes: "Attempted late correction"
          })
        }
      )

      expect(lateModifyResponse.status).toBe(403)
      const errorData = await lateModifyResponse.json()
      expect(errorData.isSuccess).toBe(false)
      expect(errorData.error).toContain("Modification window expired")

      // Verify reading was not modified
      const readingsResponse = await fetch(
        `http://localhost:3000/api/meter-readings?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const readingsData = await readingsResponse.json()
      const unchangedReading = readingsData.data.find(
        (r: any) => r.id === testReadingId
      )

      expect(unchangedReading.meterValue).toBe(50000.0) // Unchanged
      expect(unchangedReading.isModified).toBe(false)
    })

    it("should handle weekend and holiday modifications correctly", async () => {
      // Friday reading
      const fridayDate = "2025-09-12" // Friday

      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: fridayDate,
            readingType: "closing",
            meterValue: 55000.0,
            notes: "Friday closing"
          })
        }
      )

      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Saturday modification (next business day is Monday)
      const saturdayModifyResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Simulated-Time": "2025-09-13T10:00:00Z" // Saturday 10 AM
          },
          body: JSON.stringify({
            meterValue: 55005.0,
            notes: "Weekend correction"
          })
        }
      )

      // Should be allowed (before Monday 6 AM)
      expect(saturdayModifyResponse.status).toBe(200)

      // Monday after 6 AM modification
      const mondayLateModifyResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Simulated-Time": "2025-09-15T08:00:00Z" // Monday 8 AM
          },
          body: JSON.stringify({
            meterValue: 55010.0,
            notes: "Monday late correction"
          })
        }
      )

      // Should be rejected (after Monday 6 AM)
      expect(mondayLateModifyResponse.status).toBe(403)
    })
  })

  describe("Manager Override Capabilities", () => {
    it("should allow manager override of expired modification window", async () => {
      const testDate = "2025-09-13"
      const managerId = "123e4567-e89b-12d3-a456-426614174020"

      // Create reading
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 60000.0,
            notes: "Original reading"
          })
        }
      )

      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Manager override after deadline
      const managerOverrideResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Manager-Override": "true",
            "X-Manager-Id": managerId,
            "X-Simulated-Time": "2025-09-15T10:00:00Z" // Well past deadline
          },
          body: JSON.stringify({
            meterValue: 60008.0,
            notes:
              "Manager override correction due to equipment calibration issue"
          })
        }
      )

      expect(managerOverrideResponse.status).toBe(200)

      // Verify override is logged
      const readingsResponse = await fetch(
        `http://localhost:3000/api/meter-readings?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const readingsData = await readingsResponse.json()
      const overriddenReading = readingsData.data.find(
        (r: any) => r.id === testReadingId
      )

      expect(overriddenReading.meterValue).toBe(60008.0)
      expect(overriddenReading.isModified).toBe(true)
      expect(overriddenReading.modifiedBy).toBe(managerId)
      expect(overriddenReading.notes).toContain("Manager override")
    })

    it("should reject non-manager override attempts", async () => {
      const testDate = "2025-09-14"
      const regularUserId = "123e4567-e89b-12d3-a456-426614174030"

      // Create reading
      const createResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 65000.0,
            notes: "Original reading"
          })
        }
      )

      const createData = await createResponse.json()
      testReadingId = createData.data.id

      // Regular user attempts override
      const unauthorizedOverrideResponse = await fetch(
        `http://localhost:3000/api/meter-readings/${testReadingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Manager-Override": "true",
            "X-Manager-Id": regularUserId, // Regular user, not manager
            "X-Simulated-Time": "2025-09-16T10:00:00Z"
          },
          body: JSON.stringify({
            meterValue: 65005.0,
            notes: "Unauthorized override attempt"
          })
        }
      )

      expect(unauthorizedOverrideResponse.status).toBe(403)
      const errorData = await unauthorizedOverrideResponse.json()
      expect(errorData.error).toContain("manager")
    })
  })

  describe("Modification Impact on Calculations", () => {
    it("should trigger recalculation when meter reading is modified", async () => {
      const testDate = "2025-09-15"

      // Create complete set of readings
      const openingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 70000.0
          })
        }
      )

      const closingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 70200.0 // 200L
          })
        }
      )

      const openingData = await openingResponse.json()
      const closingData = await closingResponse.json()

      // Trigger initial calculation
      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: testDate
        })
      })

      // Verify initial calculation
      const initialCalculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const initialCalculationsData = await initialCalculationsResponse.json()
      const initialCalculation = initialCalculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )
      expect(initialCalculation.volumeDispensed).toBe(200.0)

      // Modify closing reading
      await fetch(
        `http://localhost:3000/api/meter-readings/${closingData.data.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meterValue: 70250.0, // Changed to 250L total
            notes: "Corrected closing reading"
          })
        }
      )

      // Verify calculation was updated automatically
      const updatedCalculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const updatedCalculationsData = await updatedCalculationsResponse.json()
      const updatedCalculation = updatedCalculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(updatedCalculation.volumeDispensed).toBe(250.0) // Updated volume
      expect(updatedCalculation.closingReading).toBe(70250.0) // Updated closing reading
      expect(updatedCalculation.updatedAt).not.toBe(
        initialCalculation.updatedAt
      ) // Timestamp updated
    })

    it("should maintain calculation consistency after multiple modifications", async () => {
      const testDate = "2025-09-16"

      // Setup initial readings and calculation
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 75000.0
        })
      })

      const closingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 75300.0
          })
        }
      )

      const closingData = await closingResponse.json()

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: testDate
        })
      })

      // Multiple modifications
      await fetch(
        `http://localhost:3000/api/meter-readings/${closingData.data.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meterValue: 75350.0,
            notes: "First correction"
          })
        }
      )

      await fetch(
        `http://localhost:3000/api/meter-readings/${closingData.data.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meterValue: 75320.0,
            notes: "Second correction"
          })
        }
      )

      // Verify final consistency
      const finalCalculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const finalReadingsResponse = await fetch(
        `http://localhost:3000/api/meter-readings?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const finalCalculationsData = await finalCalculationsResponse.json()
      const finalReadingsData = await finalReadingsResponse.json()

      const calculation = finalCalculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )
      const closingReading = finalReadingsData.data.find(
        (r: any) => r.pumpId === testPumpId && r.readingType === "closing"
      )

      // Calculation should reflect final reading state
      expect(calculation.volumeDispensed).toBe(320.0) // 75320 - 75000
      expect(calculation.closingReading).toBe(closingReading.meterValue)
      expect(calculation.totalRevenue).toBe(320.0 * 650) // Volume × unit price
    })
  })
})
