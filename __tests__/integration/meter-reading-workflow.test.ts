/**
 * T007: Integration test for daily meter reading workflow
 *
 * Tests the complete workflow from quickstart Test Scenario 1
 * Validates end-to-end meter reading capture and calculation process
 * MUST FAIL until full workflow is implemented
 */

import { db } from "@/db"
import {
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations
} from "@/db/schema"
import { eq, and } from "drizzle-orm"

describe("Daily Meter Reading Workflow Integration", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testProductId: string

  beforeEach(async () => {
    // Setup test data
    testStationId = "123e4567-e89b-12d3-a456-426614174000"
    testUserId = "123e4567-e89b-12d3-a456-426614174010"
    testProductId = "123e4567-e89b-12d3-a456-426614174011"

    // This will FAIL until pump configuration is implemented
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
      .delete(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.pumpId, testPumpId))
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
  })

  describe("Complete Daily Workflow", () => {
    it("should complete full daily meter reading and calculation workflow", async () => {
      const testDate = "2025-09-09"

      // Step 1: Record morning opening reading
      const response1 = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 12345.5,
            notes: "Morning opening - Pump 1"
          })
        }
      )

      // This MUST FAIL until meter readings API is implemented
      expect(response1.status).toBe(201)
      const openingData = await response1.json()
      expect(openingData.isSuccess).toBe(true)
      expect(openingData.data.isEstimated).toBe(false)

      // Step 2: Verify daily status shows opening recorded
      const response2 = await fetch(
        `http://localhost:3000/api/meter-readings/daily-status?stationId=${testStationId}&date=${testDate}`
      )

      expect(response2.status).toBe(200)
      const statusData = await response2.json()
      expect(statusData.isSuccess).toBe(true)

      const pumpStatus = statusData.data.pumps.find(
        (p: any) => p.pumpId === testPumpId
      )
      expect(pumpStatus.hasOpening).toBe(true)
      expect(pumpStatus.hasClosing).toBe(false)
      expect(pumpStatus.openingValue).toBe(12345.5)

      // Step 3: Record evening closing reading
      const response3 = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 12445.5,
            notes: "Evening closing - Pump 1"
          })
        }
      )

      expect(response3.status).toBe(201)
      const closingData = await response3.json()
      expect(closingData.isSuccess).toBe(true)

      // Step 4: Verify automatic calculation was triggered
      const response4 = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      expect(response4.status).toBe(200)
      const calculationsData = await response4.json()
      expect(calculationsData.isSuccess).toBe(true)
      expect(calculationsData.data.length).toBeGreaterThan(0)

      const calculation = calculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )
      expect(calculation).toBeDefined()
      expect(calculation.volumeDispensed).toBe(100.0) // 12445.5 - 12345.5
      expect(calculation.calculationMethod).toBe("meter_readings")
      expect(calculation.isEstimated).toBe(false)
      expect(calculation.openingReading).toBe(12345.5)
      expect(calculation.closingReading).toBe(12445.5)
      expect(calculation.totalRevenue).toBeGreaterThan(0) // Volume × unit price

      // Step 5: Verify daily status shows both readings recorded
      const response5 = await fetch(
        `http://localhost:3000/api/meter-readings/daily-status?stationId=${testStationId}&date=${testDate}`
      )

      const finalStatusData = await response5.json()
      const finalPumpStatus = finalStatusData.data.pumps.find(
        (p: any) => p.pumpId === testPumpId
      )
      expect(finalPumpStatus.hasOpening).toBe(true)
      expect(finalPumpStatus.hasClosing).toBe(true)
      expect(finalPumpStatus.closingValue).toBe(12445.5)
    })

    it("should handle multiple pumps in same workflow", async () => {
      // Create second pump
      const [pump2Config] = await db
        .insert(pumpConfigurations)
        .values({
          stationId: testStationId,
          pmsProductId: testProductId,
          pumpNumber: "Test Pump 2",
          meterCapacity: 999999.9,
          installDate: "2025-09-09",
          status: "active"
        })
        .returning()

      const testDate = "2025-09-09"

      try {
        // Record readings for both pumps using bulk API
        const response = await fetch(
          "http://localhost:3000/api/meter-readings/bulk",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stationId: testStationId,
              readingDate: testDate,
              readingType: "opening",
              readings: [
                {
                  pumpId: testPumpId,
                  meterValue: 10000.0,
                  notes: "Pump 1 opening"
                },
                {
                  pumpId: pump2Config.id,
                  meterValue: 20000.0,
                  notes: "Pump 2 opening"
                }
              ]
            })
          }
        )

        expect(response.status).toBe(201)
        const bulkData = await response.json()
        expect(bulkData.data.recordedCount).toBe(2)
        expect(bulkData.data.errors.length).toBe(0)

        // Verify both pumps show in daily status
        const statusResponse = await fetch(
          `http://localhost:3000/api/meter-readings/daily-status?stationId=${testStationId}&date=${testDate}`
        )

        const statusData = await statusResponse.json()
        expect(statusData.data.pumps.length).toBe(2)

        const pump1Status = statusData.data.pumps.find(
          (p: any) => p.pumpId === testPumpId
        )
        const pump2Status = statusData.data.pumps.find(
          (p: any) => p.pumpId === pump2Config.id
        )

        expect(pump1Status.hasOpening).toBe(true)
        expect(pump2Status.hasOpening).toBe(true)
        expect(pump1Status.openingValue).toBe(10000.0)
        expect(pump2Status.openingValue).toBe(20000.0)
      } finally {
        // Cleanup
        await db
          .delete(pumpMeterReadings)
          .where(eq(pumpMeterReadings.pumpId, pump2Config.id))
        await db
          .delete(pumpConfigurations)
          .where(eq(pumpConfigurations.id, pump2Config.id))
      }
    })

    it("should validate business rules during workflow", async () => {
      const testDate = "2025-09-09"

      // Try to record closing reading without opening reading
      const response = await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 12445.5,
          notes: "Closing without opening"
        })
      })

      // Should either fail or create pending calculation
      if (response.status === 400) {
        const errorData = await response.json()
        expect(errorData.isSuccess).toBe(false)
        expect(errorData.error).toContain("opening reading")
      } else {
        // If allowed, should mark calculation as requiring estimation
        expect(response.status).toBe(201)
      }
    })

    it("should prevent duplicate readings for same pump/date/type", async () => {
      const testDate = "2025-09-09"

      // Record first opening reading
      const response1 = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 12345.5,
            notes: "First opening"
          })
        }
      )

      expect(response1.status).toBe(201)

      // Try to record second opening reading for same pump/date
      const response2 = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 12350.0,
            notes: "Duplicate opening"
          })
        }
      )

      expect(response2.status).toBe(400)
      const errorData = await response2.json()
      expect(errorData.isSuccess).toBe(false)
      expect(errorData.error).toContain("duplicate")
    })
  })
})
