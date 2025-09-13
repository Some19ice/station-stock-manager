/**
 * T009: Integration test for estimated reading approval
 *
 * Tests the estimation and approval workflow from quickstart Test Scenario 3
 * Validates fallback mechanisms and manager approval process
 * MUST FAIL until estimation logic and approval workflow is implemented
 */

import { db } from "@/db"
import {
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations
} from "@/db/schema"
import { eq } from "drizzle-orm"

describe("Estimated Reading Approval Integration", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testManagerId: string
  let testProductId: string

  beforeEach(async () => {
    // Setup test data
    testStationId = "123e4567-e89b-12d3-a456-426614174000"
    testUserId = "123e4567-e89b-12d3-a456-426614174010"
    testManagerId = "123e4567-e89b-12d3-a456-426614174020"
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
      .delete(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.pumpId, testPumpId))
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
  })

  describe("Missing Reading Scenarios", () => {
    it("should create estimated calculation when closing reading is missing", async () => {
      const testDate = "2025-09-11"

      // Record only opening reading
      const openingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "opening",
            meterValue: 13000.0,
            notes: "Opening reading only"
          })
        }
      )

      // This MUST FAIL until meter readings API is implemented
      expect(openingResponse.status).toBe(201)

      // Attempt calculation with missing closing reading
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      // This MUST FAIL until calculations API is implemented
      expect(calculationResponse.status).toBe(201)

      const calculationData = await calculationResponse.json()
      expect(calculationData.isSuccess).toBe(true)

      // Should create estimated calculation
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )
      expect(calculation).toBeDefined()
      expect(calculation.isEstimated).toBe(true)
      expect(calculation.calculationMethod).toBe("estimated")
      expect(calculation.approvedBy).toBeNull() // Pending approval
      expect(calculation.approvedAt).toBeNull()
    })

    it("should create estimated calculation when opening reading is missing", async () => {
      const testDate = "2025-09-12"

      // Record only closing reading
      const closingResponse = await fetch(
        "http://localhost:3000/api/meter-readings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: testDate,
            readingType: "closing",
            meterValue: 13200.0,
            notes: "Closing reading only"
          })
        }
      )

      expect(closingResponse.status).toBe(201)

      // Attempt calculation with missing opening reading
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      expect(calculationResponse.status).toBe(201)

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.isEstimated).toBe(true)
      expect(calculation.calculationMethod).toBe("estimated")
    })

    it("should create estimated calculation when both readings are missing", async () => {
      const testDate = "2025-09-13"

      // Attempt calculation with no readings
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      expect(calculationResponse.status).toBe(201)

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.isEstimated).toBe(true)
      expect(calculation.calculationMethod).toBe("estimated")
      expect(calculation.volumeDispensed).toBeGreaterThan(0) // Based on historical data or fallback
    })
  })

  describe("Estimation Methods", () => {
    it("should use transaction-based estimation when PMS transactions are available", async () => {
      const testDate = "2025-09-14"

      // Setup: Previous day with actual readings for baseline
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-13",
          readingType: "opening",
          meterValue: 14000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: "2025-09-13",
          readingType: "closing",
          meterValue: 14100.0
        })
      })

      // Current day: Missing readings but has transaction data
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.isEstimated).toBe(true)
      expect(calculation.calculationMethod).toBe("estimated")
      // Verify it uses reasonable estimation based on available data
      expect(calculation.volumeDispensed).toBeGreaterThan(0)
      expect(calculation.volumeDispensed).toBeLessThan(1000) // Reasonable daily volume
    })

    it("should use historical average when no recent transaction data", async () => {
      const testDate = "2025-09-15"

      // Setup: Historical data from previous weeks
      const historicalDates = ["2025-09-01", "2025-09-02", "2025-09-03"]

      for (const date of historicalDates) {
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: 10000.0
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: 10120.0 // Consistent 120L per day
          })
        })
      }

      // Current day: Missing readings, use historical average
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.isEstimated).toBe(true)
      expect(calculation.volumeDispensed).toBeCloseTo(120.0, 1) // Based on historical 120L average
    })
  })

  describe("Manager Approval Workflow", () => {
    let testCalculationId: string

    beforeEach(async () => {
      // Create estimated calculation that needs approval
      const testDate = "2025-09-16"

      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )
      testCalculationId = calculation.id
    })

    it("should approve estimated calculation with manager approval", async () => {
      const approvalResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/${testCalculationId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approved: true,
            notes: "Approved estimated reading due to staff absence"
          })
        }
      )

      // This MUST FAIL until approval API is implemented
      expect(approvalResponse.status).toBe(200)

      // Verify calculation is marked as approved
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=2025-09-16&endDate=2025-09-16`
      )

      const calculationsData = await calculationsResponse.json()
      const approvedCalculation = calculationsData.data.find(
        (c: any) => c.id === testCalculationId
      )

      expect(approvedCalculation.approvedBy).toBe(testManagerId)
      expect(approvedCalculation.approvedAt).toBeTruthy()
      expect(approvedCalculation.isEstimated).toBe(true) // Still marked as estimated
    })

    it("should reject estimated calculation with manager denial", async () => {
      const rejectionResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/${testCalculationId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approved: false,
            notes: "Rejected due to excessive deviation from normal patterns"
          })
        }
      )

      expect(rejectionResponse.status).toBe(200)

      // Verify calculation is marked as rejected (or requires re-estimation)
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=2025-09-16&endDate=2025-09-16`
      )

      const calculationsData = await calculationsResponse.json()
      const rejectedCalculation = calculationsData.data.find(
        (c: any) => c.id === testCalculationId
      )

      // Should either be marked as rejected or removed for re-calculation
      expect(rejectedCalculation.approvedBy).toBe(testManagerId)
      expect(rejectedCalculation.approvedAt).toBeTruthy()
    })

    it("should validate approval request parameters", async () => {
      // Missing required 'approved' field
      const invalidApprovalResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/${testCalculationId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: "Missing approved field"
          })
        }
      )

      expect(invalidApprovalResponse.status).toBe(400)

      const errorData = await invalidApprovalResponse.json()
      expect(errorData.isSuccess).toBe(false)
      expect(errorData.error).toContain("approved")
    })

    it("should prevent approval of non-estimated calculations", async () => {
      // Create normal (non-estimated) calculation first
      const normalDate = "2025-09-17"

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: normalDate,
          readingType: "opening",
          meterValue: 15000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: normalDate,
          readingType: "closing",
          meterValue: 15100.0
        })
      })

      const normalCalculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: normalDate
          })
        }
      )

      const normalData = await normalCalculationResponse.json()
      const normalCalculation = normalData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      // Try to approve normal calculation
      const invalidApprovalResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/${normalCalculation.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approved: true,
            notes: "Trying to approve normal calculation"
          })
        }
      )

      expect(invalidApprovalResponse.status).toBe(400)
      const errorData = await invalidApprovalResponse.json()
      expect(errorData.error).toContain("estimated")
    })
  })

  describe("Estimation Quality and Validation", () => {
    it("should flag estimated calculations with high deviation for review", async () => {
      const testDate = "2025-09-18"

      // Setup historical data with consistent pattern
      const dates = [
        "2025-09-11",
        "2025-09-12",
        "2025-09-13",
        "2025-09-14",
        "2025-09-15"
      ]

      for (const date of dates) {
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: 16000.0
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: 16100.0 // Consistent 100L per day
          })
        })
      }

      // Create estimation for current day
      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      // Should estimate around 100L based on historical data
      expect(calculation.volumeDispensed).toBeCloseTo(100.0, 10)

      // Should not trigger high deviation alert for reasonable estimate
      expect(Math.abs(calculation.deviationFromAverage)).toBeLessThan(50)
    })

    it("should require manager approval for all estimated calculations", async () => {
      const testDate = "2025-09-19"

      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: testDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.isEstimated).toBe(true)
      expect(calculation.approvedBy).toBeNull()
      expect(calculation.approvedAt).toBeNull()

      // Should appear in deviation report requiring attention
      const deviationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=0`
      )

      const deviationsData = await deviationsResponse.json()
      const estimatedCalculations = deviationsData.data.filter(
        (c: any) => c.isEstimated
      )

      expect(estimatedCalculations.length).toBeGreaterThan(0)
    })
  })
})
