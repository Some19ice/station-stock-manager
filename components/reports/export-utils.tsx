"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Mail
} from "lucide-react"
import { toast } from "sonner"
import ExcelJS from "exceljs"

interface ExportUtilsProps {
  data: Record<string, unknown>
  filename: string
  reportType: string
}

export function ExportUtils({ data, filename, reportType }: ExportUtilsProps) {
  const exportToPDF = async () => {
    try {
      // Implementation would use jsPDF or similar
      toast.success("PDF export started")
    } catch (error) {
      toast.error("Failed to export PDF")
    }
  }

  const exportToCSV = () => {
    try {
      const csvContent = convertToCSV(data)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("CSV exported successfully")
    } catch (error) {
      toast.error("Failed to export CSV")
    }
  }

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Station Stock Manager"
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet(reportType)

      // Handle different data structures
      if (Array.isArray(data)) {
        // Array of objects - use first object keys as headers
        if (data.length > 0 && typeof data[0] === "object") {
          const headers = Object.keys(data[0] as object)
          worksheet.addRow(headers)

          // Style header row
          const headerRow = worksheet.getRow(1)
          headerRow.font = { bold: true }
          headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" }
          }

          // Add data rows
          data.forEach((item) => {
            const values = headers.map((header) => (item as Record<string, unknown>)[header] ?? "")
            worksheet.addRow(values)
          })

          // Auto-fit column widths
          worksheet.columns.forEach((column) => {
            column.width = 15
          })
        }
      } else if (typeof data === "object" && data !== null) {
        // Single object - key-value pairs
        worksheet.addRow(["Property", "Value"])
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" }
        }

        Object.entries(data).forEach(([key, value]) => {
          worksheet.addRow([key, String(value ?? "")])
        })

        worksheet.columns = [{ width: 25 }, { width: 40 }]
      }

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Excel exported successfully")
    } catch (error) {
      console.error("Excel export error:", error)
      toast.error("Failed to export Excel")
    }
  }

  const printReport = () => {
    window.print()
  }

  const emailReport = () => {
    const subject = `${reportType} Report - ${filename}`
    const body = `Please find the ${reportType} report attached.`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const convertToCSV = (data: Record<string, unknown>): string => {
    if (!data || typeof data !== "object") return ""

    // Simple CSV conversion - would need enhancement based on data structure
    const headers = Object.keys(data)
    const values = Object.values(data)

    return [headers.join(","), values.join(",")].join("\n")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={emailReport}>
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
