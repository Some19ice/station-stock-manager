import { getCustomerByUserId } from "@/actions/customers"
import { getUserRole } from "@/actions/auth"
import { SelectCustomer } from "@/db/schema/customers"
import { currentUser } from "@clerk/nextjs/server"
import { Header } from "./header"

export async function HeaderWrapper() {
  const user = await currentUser()
  let membership: SelectCustomer["membership"] | null = null
  let userRole: string | undefined

  if (user) {
    try {
      const customer = await getCustomerByUserId(user.id)
      membership = customer?.membership ?? "free"
      
      const roleResult = await getUserRole(user.id)
      userRole = roleResult.isSuccess ? roleResult.data : undefined
    } catch (error) {
      // Gracefully handle missing customer records
      console.log("Customer record not found, using defaults")
      membership = "free"
      userRole = undefined
    }
  }

  return <Header userMembership={membership} userRole={userRole} />
}
