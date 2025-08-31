"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, Mail, Calendar, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ScheduledReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly'
  frequency: string
  recipients: string[]
  format: 'pdf' | 'csv' | 'excel'
  enabled: boolean
  nextRun: Date
}

export function ReportScheduler() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'daily' as const,
    frequency: 'daily',
    recipients: [''],
    format: 'pdf' as const,
    enabled: true
  })

  const addRecipient = () => {
    setNewReport(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }))
  }

  const updateRecipient = (index: number, email: string) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? email : r)
    }))
  }

  const removeRecipient = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }))
  }

  const createScheduledReport = () => {
    if (!newReport.name || newReport.recipients.some(r => !r.includes('@'))) {
      toast.error("Please fill all required fields with valid emails")
      return
    }

    const report: ScheduledReport = {
      id: Date.now().toString(),
      ...newReport,
      recipients: newReport.recipients.filter(r => r.trim()),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    }

    setScheduledReports(prev => [...prev, report])
    setNewReport({
      name: '',
      type: 'daily',
      frequency: 'daily',
      recipients: [''],
      format: 'pdf',
      enabled: true
    })
    setIsCreating(false)
    toast.success("Scheduled report created successfully")
  }

  const toggleReport = (id: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    )
  }

  const deleteReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id))
    toast.success("Scheduled report deleted")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{report.name}</h4>
                    <Badge variant={report.enabled ? "default" : "secondary"}>
                      {report.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.type} • {report.format.toUpperCase()} • {report.recipients.length} recipient(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next run: {report.nextRun.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={report.enabled}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {scheduledReports.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No scheduled reports yet. Create one to get started.
              </p>
            )}
          </div>

          <Button
            onClick={() => setIsCreating(true)}
            className="w-full mt-4"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Report
          </Button>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Scheduled Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={newReport.name}
                onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Sales Summary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={newReport.type} onValueChange={(value: string) => 
                  setNewReport(prev => ({ ...prev, type: value as "daily" }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={newReport.frequency} onValueChange={(value) => 
                  setNewReport(prev => ({ ...prev, frequency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Every Day</SelectItem>
                    <SelectItem value="weekly">Every Week</SelectItem>
                    <SelectItem value="monthly">Every Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Format</Label>
                <Select value={newReport.format} onValueChange={(value: string) => 
                  setNewReport(prev => ({ ...prev, format: value as "pdf" }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Email Recipients</Label>
              <div className="space-y-2">
                {newReport.recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="email@example.com"
                    />
                    {newReport.recipients.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRecipient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createScheduledReport}>
                Create Schedule
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
