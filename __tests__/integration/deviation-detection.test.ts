/**
 * T010: Integration test for deviation detection
 *
 * Tests the deviation detection logic from quickstart Test Scenario 4
 * Validates 20% threshold and alert generation system
 * MUST FAIL until deviation detection algorithm is implemented
 */

import { db } from "@/db"
import {
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations
} from "@/db/schema"
import { eq } from "drizzle-orm"

describe("Deviation Detection Integration", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testProductId: string

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
      .delete(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.pumpId, testPumpId))
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
  })

  describe("Baseline Pattern Establishment", () => {
    it("should establish 7-day rolling average baseline", async () => {
      // Create 7 days of consistent readings to establish baseline
      const baseVolume = 120.0 // 120L per day baseline
      const dates = [
        "2025-09-01",
        "2025-09-02",
        "2025-09-03",
        "2025-09-04",
        "2025-09-05",
        "2025-09-06",
        "2025-09-07"
      ]

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const openingValue = 10000.0 + i * 120
        const closingValue = openingValue + baseVolume

        // Record readings
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: openingValue
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: closingValue
          })
        })

        // Trigger calculation
        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: date
          })
        })
      }

      // Verify all calculations have low deviation (within baseline)
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=2025-09-01&endDate=2025-09-07`
      )

      // This MUST FAIL until calculations API is implemented
      expect(calculationsResponse.status).toBe(200)

      const calculationsData = await calculationsResponse.json()
      const calculations = calculationsData.data.filter(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculations.length).toBe(7)

      // All should have low deviation from average
      calculations.forEach((calc: any) => {
        expect(calc.volumeDispensed).toBeCloseTo(baseVolume, 1)
        expect(Math.abs(calc.deviationFromAverage)).toBeLessThan(10) // Well within 20% threshold
      })
    })
  })

  describe("High Volume Deviation Detection", () => {
    it("should detect and flag high volume day (>20% above average)", async () => {
      // Setup baseline week
      const baseVolume = 100.0
      const baselineDates = [
        "2025-09-01",
        "2025-09-02",
        "2025-09-03",
        "2025-09-04",
        "2025-09-05",
        "2025-09-06",
        "2025-09-07"
      ]

      for (let i = 0; i < baselineDates.length; i++) {
        const date = baselineDates[i]
        const openingValue = 20000.0 + i * 100
        const closingValue = openingValue + baseVolume

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: openingValue
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: closingValue
          })
        })

        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: date
          })
        })
      }

      // High volume day (500L vs normal 100L = 400% increase)
      const highVolumeDate = "2025-09-08"
      const highVolumeOpening = 20700.0
      const highVolumeClosing = 21200.0 // 500L dispensed

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: highVolumeDate,
          readingType: "opening",
          meterValue: highVolumeOpening
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: highVolumeDate,
          readingType: "closing",
          meterValue: highVolumeClosing
        })
      })

      const calculationResponse = await fetch(
        "http://localhost:3000/api/pms-calculations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: highVolumeDate
          })
        }
      )

      const calculationData = await calculationResponse.json()
      const calculation = calculationData.data.calculations.find(
        (c: any) => c.pumpId === testPumpId
      )

      expect(calculation.volumeDispensed).toBe(500.0)
      expect(calculation.deviationFromAverage).toBeGreaterThan(20) // Significant positive deviation

      // Should appear in deviations report
      const deviationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=20`
      )

      expect(deviationsResponse.status).toBe(200)
      const deviationsData = await deviationsResponse.json()

      const highVolumeDeviation = deviationsData.data.find(
        (d: any) =>
          d.pumpId === testPumpId && d.calculationDate === highVolumeDate
      )

      expect(highVolumeDeviation).toBeDefined()
      expect(highVolumeDeviation.volumeDispensed).toBe(500.0)
      expect(highVolumeDeviation.averageVolume).toBeCloseTo(100.0, 1)
      expect(highVolumeDeviation.deviationPercent).toBeGreaterThan(400) // 400% above average
    })

    it("should detect and flag low volume day (>20% below average)", async () => {
      // Setup baseline
      const baseVolume = 150.0
      const baselineDates = [
        "2025-09-10",
        "2025-09-11",
        "2025-09-12",
        "2025-09-13",
        "2025-09-14",
        "2025-09-15",
        "2025-09-16"
      ]

      for (let i = 0; i < baselineDates.length; i++) {
        const date = baselineDates[i]
        const openingValue = 30000.0 + i * 150
        const closingValue = openingValue + baseVolume

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: openingValue
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: closingValue
          })
        })

        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: date
          })
        })
      }

      // Low volume day (50L vs normal 150L = 67% decrease)
      const lowVolumeDate = "2025-09-17"
      const lowVolumeOpening = 31050.0
      const lowVolumeClosing = 31100.0 // Only 50L dispensed

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: lowVolumeDate,
          readingType: "opening",
          meterValue: lowVolumeOpening
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: lowVolumeDate,
          readingType: "closing",
          meterValue: lowVolumeClosing
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: lowVolumeDate
        })
      })

      // Check deviations
      const deviationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=20`
      )

      const deviationsData = await deviationsResponse.json()
      const lowVolumeDeviation = deviationsData.data.find(
        (d: any) =>
          d.pumpId === testPumpId && d.calculationDate === lowVolumeDate
      )

      expect(lowVolumeDeviation).toBeDefined()
      expect(lowVolumeDeviation.volumeDispensed).toBe(50.0)
      expect(lowVolumeDeviation.averageVolume).toBeCloseTo(150.0, 1)
      expect(lowVolumeDeviation.deviationPercent).toBeLessThan(-20) // Significant negative deviation
    })
  })

  describe("Deviation Threshold Configuration", () => {
    it("should respect custom deviation thresholds", async () => {
      // Setup baseline
      const baseVolume = 200.0
      const date = "2025-09-20"

      // Create baseline data
      const baselineDates = [
        "2025-09-13",
        "2025-09-14",
        "2025-09-15",
        "2025-09-16",
        "2025-09-17",
        "2025-09-18",
        "2025-09-19"
      ]

      for (let i = 0; i < baselineDates.length; i++) {
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: baselineDates[i],
            readingType: "opening",
            meterValue: 40000.0 + i * 200
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: baselineDates[i],
            readingType: "closing",
            meterValue: 40000.0 + i * 200 + baseVolume
          })
        })

        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: baselineDates[i]
          })
        })
      }

      // Moderate deviation day (250L vs 200L = 25% increase)
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: date,
          readingType: "opening",
          meterValue: 41400.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: date,
          readingType: "closing",
          meterValue: 41650.0 // 250L
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: date
        })
      })

      // Should appear with 20% threshold
      const deviations20Response = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=20`
      )

      const deviations20Data = await deviations20Response.json()
      const deviation20 = deviations20Data.data.find(
        (d: any) => d.pumpId === testPumpId && d.calculationDate === date
      )
      expect(deviation20).toBeDefined()

      // Should NOT appear with 30% threshold
      const deviations30Response = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=30`
      )

      const deviations30Data = await deviations30Response.json()
      const deviation30 = deviations30Data.data.find(
        (d: any) => d.pumpId === testPumpId && d.calculationDate === date
      )
      expect(deviation30).toBeUndefined()

      // Should appear with 10% threshold
      const deviations10Response = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=10`
      )

      const deviations10Data = await deviations10Response.json()
      const deviation10 = deviations10Data.data.find(
        (d: any) => d.pumpId === testPumpId && d.calculationDate === date
      )
      expect(deviation10).toBeDefined()
    })

    it("should use configurable rolling period for average calculation", async () => {
      // Setup data for different periods
      const volumes = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190] // 10 days of increasing volume
      const dates = []

      for (let i = 0; i < 10; i++) {
        const date = `2025-09-${String(21 + i).padStart(2, "0")}`
        dates.push(date)

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "opening",
            meterValue: 50000.0 + i * 200
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: date,
            readingType: "closing",
            meterValue: 50000.0 + i * 200 + volumes[i]
          })
        })

        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: date
          })
        })
      }

      // Test different rolling periods
      const testDate = dates[9] // Last date

      // 3-day average vs 7-day average should give different results
      const deviations3DayResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=0&days=3`
      )

      const deviations7DayResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=0&days=7`
      )

      const deviations3DayData = await deviations3DayResponse.json()
      const deviations7DayData = await deviations7DayResponse.json()

      const deviation3Day = deviations3DayData.data.find(
        (d: any) => d.pumpId === testPumpId && d.calculationDate === testDate
      )

      const deviation7Day = deviations7DayData.data.find(
        (d: any) => d.pumpId === testPumpId && d.calculationDate === testDate
      )

      // 3-day average should be higher (based on 170, 180, 190) vs 7-day average (140-190)
      expect(deviation3Day.averageVolume).toBeGreaterThan(
        deviation7Day.averageVolume
      )
    })
  })

  describe("Multiple Pump Deviation Analysis", () => {
    let testPump2Id: string

    beforeEach(async () => {
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

      testPump2Id = pump2Config.id
    })

    afterEach(async () => {
      await db
        .delete(dailyPmsCalculations)
        .where(eq(dailyPmsCalculations.pumpId, testPump2Id))
      await db
        .delete(pumpMeterReadings)
        .where(eq(pumpMeterReadings.pumpId, testPump2Id))
      await db
        .delete(pumpConfigurations)
        .where(eq(pumpConfigurations.id, testPump2Id))
    })

    it("should detect deviations independently per pump", async () => {
      const date = "2025-09-25"

      // Setup baselines for both pumps (different patterns)
      const baselineDates = [
        "2025-09-18",
        "2025-09-19",
        "2025-09-20",
        "2025-09-21",
        "2025-09-22",
        "2025-09-23",
        "2025-09-24"
      ]

      for (let i = 0; i < baselineDates.length; i++) {
        // Pump 1: 100L/day baseline
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: baselineDates[i],
            readingType: "opening",
            meterValue: 60000.0 + i * 100
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPumpId,
            readingDate: baselineDates[i],
            readingType: "closing",
            meterValue: 60000.0 + i * 100 + 100
          })
        })

        // Pump 2: 200L/day baseline
        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPump2Id,
            readingDate: baselineDates[i],
            readingType: "opening",
            meterValue: 70000.0 + i * 200
          })
        })

        await fetch("http://localhost:3000/api/meter-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pumpId: testPump2Id,
            readingDate: baselineDates[i],
            readingType: "closing",
            meterValue: 70000.0 + i * 200 + 200
          })
        })

        await fetch("http://localhost:3000/api/pms-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            calculationDate: baselineDates[i]
          })
        })
      }

      // Test day: Pump 1 normal (100L), Pump 2 high deviation (400L)
      // Pump 1: Normal day
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: date,
          readingType: "opening",
          meterValue: 60700.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: date,
          readingType: "closing",
          meterValue: 60800.0 // 100L normal
        })
      })

      // Pump 2: High deviation day
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPump2Id,
          readingDate: date,
          readingType: "opening",
          meterValue: 71400.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPump2Id,
          readingDate: date,
          readingType: "closing",
          meterValue: 71800.0 // 400L vs normal 200L
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: date
        })
      })

      // Check deviations
      const deviationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations/deviations?stationId=${testStationId}&thresholdPercent=20`
      )

      const deviationsData = await deviationsResponse.json()

      // Should only show Pump 2 deviation
      const pump1Deviation = deviationsData.data.find(
        (d: any) => d.pumpId === testPumpId
      )
      const pump2Deviation = deviationsData.data.find(
        (d: any) => d.pumpId === testPump2Id
      )

      expect(pump1Deviation).toBeUndefined() // Normal operation, no deviation
      expect(pump2Deviation).toBeDefined() // High deviation detected
      expect(pump2Deviation.volumeDispensed).toBe(400)
      expect(pump2Deviation.averageVolume).toBeCloseTo(200, 1)
      expect(pump2Deviation.deviationPercent).toBeCloseTo(100, 5) // 100% above average
    })
  })
})
