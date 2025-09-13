/**
 * T011: Integration test for report integration (preserving lubricant sales)
 *
 * Tests integration with existing reporting system from quickstart Test Scenario 5
 * Validates that PMS sales use meter calculations while lubricants use transactions
 * MUST FAIL until report integration is implemented
 */

import { db } from "@/db"
import {
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations,
  products,
  transactions,
  transactionItems
} from "@/db/schema"
import { eq } from "drizzle-orm"

describe("Report Integration (PMS + Lubricant Sales) Test", () => {
  let testStationId: string
  let testPumpId: string
  let testUserId: string
  let testPmsProductId: string
  let testLubricantProductId: string

  beforeEach(async () => {
    // Setup test data
    testStationId = "123e4567-e89b-12d3-a456-426614174000"
    testUserId = "123e4567-e89b-12d3-a456-426614174010"
    testPmsProductId = "123e4567-e89b-12d3-a456-426614174011"
    testLubricantProductId = "123e4567-e89b-12d3-a456-426614174012"

    // Create PMS product
    await db.insert(products).values({
      id: testPmsProductId,
      stationId: testStationId,
      name: "Premium PMS",
      type: "pms",
      currentStock: "5000.0",
      unitPrice: "650.00",
      minThreshold: "1000.0",
      unit: "litres"
    })

    // Create lubricant product
    await db.insert(products).values({
      id: testLubricantProductId,
      stationId: testStationId,
      name: "Engine Oil 10W-40",
      type: "lubricant",
      currentStock: "100.0",
      unitPrice: "2500.00",
      minThreshold: "20.0",
      unit: "units"
    })

    // Create pump configuration
    const [pumpConfig] = await db
      .insert(pumpConfigurations)
      .values({
        stationId: testStationId,
        pmsProductId: testPmsProductId,
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
      .delete(transactionItems)
      .where(eq(transactionItems.productId, testLubricantProductId))
    await db
      .delete(transactions)
      .where(eq(transactions.stationId, testStationId))
    await db
      .delete(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.pumpId, testPumpId))
    await db
      .delete(pumpMeterReadings)
      .where(eq(pumpMeterReadings.pumpId, testPumpId))
    await db
      .delete(pumpConfigurations)
      .where(eq(pumpConfigurations.id, testPumpId))
    await db.delete(products).where(eq(products.id, testPmsProductId))
    await db.delete(products).where(eq(products.id, testLubricantProductId))
  })

  describe("Mixed Sales Data Integration", () => {
    it("should integrate PMS meter calculations with lubricant transaction sales in daily report", async () => {
      const testDate = "2025-09-09"

      // Step 1: Record PMS sales via meter readings
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 15000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 15200.0 // 200L PMS sold
        })
      })

      // Trigger PMS calculation
      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: testDate
        })
      })

      // Step 2: Record lubricant sales via traditional transactions
      const transactionResponse = await fetch(
        "http://localhost:3000/api/sales/record",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            items: [
              {
                productId: testLubricantProductId,
                quantity: 5,
                unitPrice: 2500.0
              }
            ],
            totalAmount: 12500.0
          })
        }
      )

      // Step 3: Generate daily report and verify integration
      const reportResponse = await fetch(
        `http://localhost:3000/api/reports/daily?stationId=${testStationId}&date=${testDate}`
      )

      // This MUST FAIL until report integration is implemented
      expect(reportResponse.status).toBe(200)

      const reportData = await reportResponse.json()
      expect(reportData.isSuccess).toBe(true)
      expect(reportData.data).toBeDefined()

      // Verify PMS sales use meter-calculated values
      expect(reportData.data.pmsReport).toBeDefined()
      expect(reportData.data.pmsReport.litresSold).toBe("200.0") // From meter calculation
      expect(parseFloat(reportData.data.pmsReport.revenue)).toBe(200 * 650) // 200L × ₦650

      // Verify lubricant sales use transaction-based values
      expect(reportData.data.lubricantSales).toBeDefined()
      const lubricantSale = reportData.data.lubricantSales.find(
        (ls: any) => ls.productId === testLubricantProductId
      )
      expect(lubricantSale).toBeDefined()
      expect(parseFloat(lubricantSale.totalQuantity)).toBe(5)
      expect(parseFloat(lubricantSale.totalRevenue)).toBe(12500)

      // Verify total sales include both methods
      const totalSales = parseFloat(reportData.data.salesOverview.totalSales)
      const expectedTotal = 200 * 650 + 12500 // PMS + Lubricants
      expect(totalSales).toBe(expectedTotal)
    })

    it("should show historical transition in reports", async () => {
      // Day before transition: Both PMS and lubricants use transactions
      const oldDate = "2025-09-08"

      // Record old-style PMS transaction
      await fetch("http://localhost:3000/api/sales/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          items: [
            {
              productId: testPmsProductId,
              quantity: 150,
              unitPrice: 650.0
            }
          ],
          totalAmount: 97500.0
        })
      })

      // Day after transition: PMS uses meters, lubricants use transactions
      const newDate = "2025-09-09"

      // New-style PMS via meters
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: newDate,
          readingType: "opening",
          meterValue: 20000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: newDate,
          readingType: "closing",
          meterValue: 20150.0 // 150L
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: newDate
        })
      })

      // Generate reports for both days
      const oldReportResponse = await fetch(
        `http://localhost:3000/api/reports/daily?stationId=${testStationId}&date=${oldDate}`
      )

      const newReportResponse = await fetch(
        `http://localhost:3000/api/reports/daily?stationId=${testStationId}&date=${newDate}`
      )

      const oldReport = await oldReportResponse.json()
      const newReport = await newReportResponse.json()

      // Old report: PMS from transactions
      expect(oldReport.data.pmsReport.calculationMethod).toBe(
        "transaction_based"
      )
      expect(parseFloat(oldReport.data.pmsReport.litresSold)).toBe(150)

      // New report: PMS from meter calculations
      expect(newReport.data.pmsReport.calculationMethod).toBe("meter_readings")
      expect(parseFloat(newReport.data.pmsReport.litresSold)).toBe(150)

      // Both should have same volume but different source methods
      expect(parseFloat(oldReport.data.pmsReport.litresSold)).toBe(
        parseFloat(newReport.data.pmsReport.litresSold)
      )
    })
  })

  describe("Dashboard Metrics Integration", () => {
    it("should update dashboard with meter-based PMS data while preserving lubricant transaction data", async () => {
      const testDate = "2025-09-09"

      // Setup PMS meter data
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 25000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 25300.0 // 300L PMS
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: testDate
        })
      })

      // Setup lubricant transaction data
      await fetch("http://localhost:3000/api/sales/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          items: [
            {
              productId: testLubricantProductId,
              quantity: 8,
              unitPrice: 2500.0
            }
          ],
          totalAmount: 20000.0
        })
      })

      // Get dashboard metrics
      const dashboardResponse = await fetch(
        `http://localhost:3000/api/dashboard/metrics?date=${testDate}`
      )

      expect(dashboardResponse.status).toBe(200)
      const dashboardData = await dashboardResponse.json()

      // Verify PMS data comes from meter calculations
      expect(dashboardData.data.pmsSales).toBeDefined()
      expect(dashboardData.data.pmsSales.volume).toBe(300)
      expect(dashboardData.data.pmsSales.revenue).toBe(300 * 650)
      expect(dashboardData.data.pmsSales.source).toBe("meter_readings")

      // Verify lubricant data comes from transactions
      expect(dashboardData.data.lubricantSales).toBeDefined()
      expect(dashboardData.data.lubricantSales.units).toBe(8)
      expect(dashboardData.data.lubricantSales.revenue).toBe(20000)
      expect(dashboardData.data.lubricantSales.source).toBe("transactions")

      // Verify total sales combines both sources
      const expectedTotal = 300 * 650 + 20000
      expect(dashboardData.data.totalSales).toBe(expectedTotal)

      // Verify stock levels are updated correctly
      // PMS stock should be reduced by meter-calculated volume
      expect(dashboardData.data.stockLevels.pms).toBe(5000 - 300) // Original 5000L - 300L dispensed

      // Lubricant stock should be reduced by transaction quantity
      expect(dashboardData.data.stockLevels.lubricants).toBe(100 - 8) // Original 100 - 8 sold
    })

    it("should provide real-time updates when meter readings are entered", async () => {
      const testDate = "2025-09-10"

      // Initial dashboard state
      const initialDashboardResponse = await fetch(
        `http://localhost:3000/api/dashboard/metrics?date=${testDate}`
      )
      const initialData = await initialDashboardResponse.json()

      // Should show no PMS sales initially
      expect(initialData.data.pmsSales.volume).toBe(0)

      // Record opening reading
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 30000.0
        })
      })

      // Dashboard should still show 0 (no calculation yet)
      const midDashboardResponse = await fetch(
        `http://localhost:3000/api/dashboard/metrics?date=${testDate}`
      )
      const midData = await midDashboardResponse.json()
      expect(midData.data.pmsSales.volume).toBe(0)

      // Record closing reading
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 30250.0 // 250L
        })
      })

      // This should trigger automatic calculation and dashboard update
      const finalDashboardResponse = await fetch(
        `http://localhost:3000/api/dashboard/metrics?date=${testDate}`
      )
      const finalData = await finalDashboardResponse.json()

      // Dashboard should now show updated PMS sales
      expect(finalData.data.pmsSales.volume).toBe(250)
      expect(finalData.data.pmsSales.revenue).toBe(250 * 650)
      expect(finalData.data.lastUpdated).toBeTruthy()
    })
  })

  describe("Backward Compatibility", () => {
    it("should maintain existing lubricant sales workflow without changes", async () => {
      // Record lubricant sales exactly as before (no changes to existing flow)
      const transactionResponse = await fetch(
        "http://localhost:3000/api/sales/record",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: testStationId,
            items: [
              {
                productId: testLubricantProductId,
                quantity: 3,
                unitPrice: 2500.0
              }
            ],
            totalAmount: 7500.0
          })
        }
      )

      expect(transactionResponse.status).toBe(201)
      const transactionData = await transactionResponse.json()

      // Should work exactly as before
      expect(transactionData.isSuccess).toBe(true)
      expect(transactionData.data.transaction).toBeDefined()
      expect(transactionData.data.transaction.totalAmount).toBe("7500.00")

      // Verify transaction items
      const items = transactionData.data.transaction.items
      expect(items.length).toBe(1)
      expect(items[0].quantity).toBe("3")
      expect(items[0].unitPrice).toBe("2500.00")
      expect(items[0].totalPrice).toBe("7500.00")

      // Verify stock movement records are created
      const salesHistoryResponse = await fetch(
        `http://localhost:3000/api/sales/history?stationId=${testStationId}`
      )

      const salesHistory = await salesHistoryResponse.json()
      expect(salesHistory.isSuccess).toBe(true)

      const recentTransaction = salesHistory.data.transactions[0]
      expect(recentTransaction.id).toBe(transactionData.data.transaction.id)
    })

    it("should continue to support PMS transactions for stations without meter setup", async () => {
      // Create station without pump configuration
      const nonMeterStationId = "123e4567-e89b-12d3-a456-426614174099"

      await db.insert(products).values({
        stationId: nonMeterStationId,
        name: "Premium PMS (Non-Meter Station)",
        type: "pms",
        currentStock: "3000.0",
        unitPrice: "650.00",
        minThreshold: "500.0",
        unit: "litres"
      })

      // Should still be able to record PMS sales via transactions
      const pmsTransactionResponse = await fetch(
        "http://localhost:3000/api/sales/record",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: nonMeterStationId,
            items: [
              {
                productId: testPmsProductId, // PMS product
                quantity: 100,
                unitPrice: 650.0
              }
            ],
            totalAmount: 65000.0
          })
        }
      )

      expect(pmsTransactionResponse.status).toBe(201)

      // Daily report should show transaction-based PMS sales for this station
      const reportResponse = await fetch(
        `http://localhost:3000/api/reports/daily?stationId=${nonMeterStationId}&date=2025-09-09`
      )

      const reportData = await reportResponse.json()
      expect(reportData.data.pmsReport.calculationMethod).toBe(
        "transaction_based"
      )
      expect(parseFloat(reportData.data.pmsReport.litresSold)).toBe(100)
    })
  })

  describe("Report Data Integrity", () => {
    it("should maintain data consistency between PMS meter calculations and transaction records", async () => {
      const testDate = "2025-09-11"

      // Setup meter readings
      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "opening",
          meterValue: 35000.0
        })
      })

      await fetch("http://localhost:3000/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpId: testPumpId,
          readingDate: testDate,
          readingType: "closing",
          meterValue: 35180.0 // 180L
        })
      })

      await fetch("http://localhost:3000/api/pms-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: testStationId,
          calculationDate: testDate
        })
      })

      // Generate report
      const reportResponse = await fetch(
        `http://localhost:3000/api/reports/daily?stationId=${testStationId}&date=${testDate}`
      )

      const reportData = await reportResponse.json()

      // Verify calculation data matches report data
      const calculationsResponse = await fetch(
        `http://localhost:3000/api/pms-calculations?stationId=${testStationId}&startDate=${testDate}&endDate=${testDate}`
      )

      const calculationsData = await calculationsResponse.json()
      const calculation = calculationsData.data.find(
        (c: any) => c.pumpId === testPumpId
      )

      // Report should exactly match calculation results
      expect(reportData.data.pmsReport.litresSold).toBe(
        calculation.volumeDispensed.toString()
      )
      expect(parseFloat(reportData.data.pmsReport.revenue)).toBe(
        parseFloat(calculation.totalRevenue)
      )
      expect(reportData.data.pmsReport.openingStock).toBe(
        calculation.openingReading.toString()
      )
      expect(reportData.data.pmsReport.closingStock).toBe(
        calculation.closingReading.toString()
      )

      // Timestamps should be consistent
      expect(
        new Date(reportData.data.generatedAt).getTime()
      ).toBeGreaterThanOrEqual(new Date(calculation.calculatedAt).getTime())
    })
  })
})
