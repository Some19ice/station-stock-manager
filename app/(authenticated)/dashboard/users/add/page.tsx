"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UserPlus, ArrowLeft, Mail, Phone, User, Shield } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createStaffMember } from "@/actions/staff-management"

const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["staff", "manager"], {
    required_error: "Please select a role"
  }),
  isActive: z.boolean().default(true),
  canManageInventory: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
  canManageUsers: z.boolean().default(false)
})

type StaffFormData = z.infer<typeof staffSchema>

export default function AddUserPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "staff",
      isActive: true,
      canManageInventory: false,
      canViewReports: false,
      canManageUsers: false
    }
  })

  const watchedRole = form.watch("role")

  const onSubmit = async (data: StaffFormData) => {
    setLoading(true)
    try {
      const result = await createStaffMember(data)
      if (result.isSuccess) {
        toast.success("Staff member added successfully")
        router.push("/dashboard/users")
      } else {
        toast.error(result.error || "Failed to add staff member")
      }
    } catch (error) {
      toast.error("Failed to add staff member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Staff Member</h1>
          <p className="text-muted-foreground">
            Create a new staff account with appropriate permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Staff Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="John" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="Doe" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="email" 
                              placeholder="john.doe@station.com" 
                              className="pl-9" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="+234 803 123 4567" 
                              className="pl-9" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">Sales Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Permissions
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base">Active Account</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Allow this user to access the system
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchedRole === "staff" && (
                      <>
                        <FormField
                          control={form.control}
                          name="canManageInventory"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel className="text-base">Manage Inventory</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Add, edit, and manage product inventory
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="canViewReports"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel className="text-base">View Reports</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Access sales and inventory reports
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {watchedRole === "manager" && (
                      <FormField
                        control={form.control}
                        name="canManageUsers"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel className="text-base">Manage Users</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Add, edit, and manage staff accounts
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Adding..." : "Add Staff Member"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard/users">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedRole === "staff" ? (
                <div>
                  <h4 className="font-semibold text-green-600">Sales Staff</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Record sales transactions</li>
                    <li>• View daily summaries</li>
                    <li>• Access product catalog</li>
                    <li>• Generate receipts</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-blue-600">Manager</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• All staff permissions</li>
                    <li>• Manage inventory</li>
                    <li>• View all reports</li>
                    <li>• Manage staff accounts</li>
                    <li>• Access analytics</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>After adding this staff member:</p>
              <ul className="space-y-1">
                <li>• They'll receive an email invitation</li>
                <li>• They can set up their password</li>
                <li>• Access will be granted based on their role</li>
                <li>• You can modify permissions later</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
