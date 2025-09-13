/**
 * T008: Integration test for meter rollover handling
 *
 * Tests the rollover detection and handling from quickstart Test Scenario 2
 * Validates automatic rollover detection and manual rollover confirmation
 * MUST FAIL until rollover logic is implemented
 */

import { db } from "@/db"
import {
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations
} from "@/db/schema"
import { eq } from "drizzle-orm"

describe("Meter Rollover Handling Integration", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testProductId: string

  beforeEach(async () => {
    // Setup test data
    testStationId = "123e4567-e89b-12d3-a456-426614174000"
    testUserId = "123e4567-e89b-12d3-a456-426614174010"
    testProductId = "123e4567-e89b-12d3-a456-426614174011"

    // Create pump with known capacity
    const [pumpConfig] = await db
      .insert(pumpConfigurations)
      .values({
        stationId: testStationId,
        pmsProductId: testProductId,
        pumpNumber: "Test Pump 1",
        meterCapacity: 999999.9, // Known capacity for rollover testing
        installDate: "2025-09-09",
        status: "active"
      })
      .returning()

    testPumpId = pumpConfig.id
  })

  afterEach(async () => {
    // Cleanup test data
    await db
      .delete(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.pumpId, testPumpId))
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
  })

  describe("Automatic Rollover Detection", () => {
    it("should detect potential rollover when closing < opening", async () => {
      const testDate = "2025-09-10"

      // Record opening reading near capacity
      const openingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 999950.0
          })
        }
      )

      // This MUST FAIL until meter readings API is implemented
      expect(openingResponse.status).toBe(201)

      // Record closing reading that appears to be after rollover
      const closingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 100.0
          })
        }
      )

      expect(closingResponse.status).toBe(201)

      // Check if automatic calculation detects rollover
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      expect(calculationsResponse.status).toBe(200)
      const calculationsData = await calculationsResponse.json()

      const calculation = calculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )

      // Should either automatically handle rollover or flag for manual review
      if (calculation) {
        if (calculation.hasRollover) {
          // Automatic rollover handled
          expect(calculation.volumeDispensed).toBeCloseTo(149.9) // (999999.9 - 999950.0) + 100.0
          expect(calculation.rolloverValue).toBe(999999.9)
        } else {
          // Flagged for manual review (negative volume or estimation required)
          expect(calculation.isEstimated).toBe(true)
          expect(calculation.calculationMethod).toBe("estimated")
        }
      } else {
        // No calculation created - waiting for rollover confirmation
        expect(calculationsData.data.length).toBe(0)
      }
    })

    it("should handle normal reading progression without rollover", async () => {
      const testDate = "2025-09-11"

      // Record normal progression (closing > opening)
      const openingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 500000.0
          })
        }
      )

      expect(openingResponse.status).toBe(201)

      const closingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 500150.0
          })
        }
      )

      expect(closingResponse.status).toBe(201)

      // Verify normal calculation without rollover
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const calculationsData = await calculationsResponse.json()
      const calculation = calculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation).toBeDefined()
      expect(calculation.hasRollover).toBe(false)
      expect(calculation.volumeDispensed).toBe(150.0)
      expect(calculation.rolloverValue).toBeNull()
      expect(calculation.calculationMethod).toBe("meter_readings")
    })
  })

  describe("Manual Rollover Confirmation", () => {
    it("should handle manual rollover confirmation via API", async () => {
      const testDate = "2025-09-10"

      // Setup readings that require rollover confirmation
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 999950.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 100.0
        })
      })

      // Manually confirm rollover
      const rolloverResponse = await fetch(
        "http://localhost:3000/api/pms-calculations/rollover",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            calculationDate: testDate,
            rolloverValue: 999999.9,
            newReading: 100.0
          })
        }
      )

      // This MUST FAIL until rollover API is implemented
      expect(rolloverResponse.status).toBe(200)

      // Verify calculation was created/updated with rollover
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const calculationsData = await calculationsResponse.json()
      const calculation = calculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation).toBeDefined()
      expect(calculation.hasRollover).toBe(true)
      expect(calculation.rolloverValue).toBe(999999.9)
      expect(calculation.volumeDispensed).toBeCloseTo(149.9)
      expect(calculation.calculationMethod).toBe("meter_readings")
    })

    it("should validate rollover parameters", async () => {
      // Test invalid rollover value (negative)
      const invalidRolloverResponse1 = await fetch(
        "http://localhost:3000/api/pms-calculations/rollover",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            calculationDate: "2025-09-10",
            rolloverValue: -1,
            newReading: 100.0
          })
        }
      )

      expect(invalidRolloverResponse1.status).toBe(400)

      // Test invalid new reading (negative)
      const invalidRolloverResponse2 = await fetch(
        "http://localhost:3000/api/pms-calculations/rollover",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            calculationDate: "2025-09-10",
            rolloverValue: 999999.9,
            newReading: -50
          })
        }
      )

      expect(invalidRolloverResponse2.status).toBe(400)

      // Test rollover value exceeding pump capacity
      const invalidRolloverResponse3 = await fetch(
        "http://localhost:3000/api/pms-calculations/rollover",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            calculationDate: "2025-09-10",
            rolloverValue: 1000000.0, // Exceeds capacity
            newReading: 100.0
          })
        }
      )

      expect(invalidRolloverResponse3.status).toBe(400)
    })
  })

  describe("Complex Rollover Scenarios", () => {
    it("should handle multiple rollovers in sequence", async () => {
      // Day 1: Normal operation near capacity
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-08",
          readingType: "opening",
          meterValue: 999800.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-08",
          readingType: "closing",
          meterValue: 999950.0
        })
      })

      // Day 2: Rollover occurs
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-09",
          readingType: "opening",
          meterValue: 999950.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-09",
          readingType: "closing",
          meterValue: 100.0
        })
      })

      // Confirm rollover
      await fetch("http://localhost:3000/api/pms-calculations/rollover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          calculationDate: "2025-09-09",
          rolloverValue: 999999.9,
          newReading: 100.0
        })
      })

      // Day 3: Normal operation from new base
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-10",
          readingType: "opening",
          meterValue: 100.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-10",
          readingType: "closing",
          meterValue: 250.0
        })
      })

      // Verify all calculations are correct
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=2025-09-08&endDate=2025-09-10`
      )

      const calculationsData = await calculationsResponse.json()
      const calculations = calculationsData.data.filter(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculations.length).toBe(3)

      // Day 1: Normal calculation
      const day1Calc = calculations.find(
        (c: any) => c.calculationDate === "2025-09-08"
      )
      expect(day1Calc.hasRollover).toBe(false)
      expect(day1Calc.volumeDispensed).toBe(150.0)

      // Day 2: Rollover calculation
      const day2Calc = calculations.find(
        (c: any) => c.calculationDate === "2025-09-09"
      )
      expect(day2Calc.hasRollover).toBe(true)
      expect(day2Calc.volumeDispensed).toBeCloseTo(149.9)

      // Day 3: Normal calculation from new base
      const day3Calc = calculations.find(
        (c: any) => c.calculationDate === "2025-09-10"
      )
      expect(day3Calc.hasRollover).toBe(false)
      expect(day3Calc.volumeDispensed).toBe(150.0)
    })
  })
})
