"use client"

import { ThemeSettings } from "@/components/dashboard/theme-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your station preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        <ThemeSettings />
      </div>
    </div>
  )
}
