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
    const customer = await getCustomerByUserId(user.id)
    membership = customer?.membership ?? "free"
    
    const roleResult = await getUserRole(user.id)
    userRole = roleResult.isSuccess ? roleResult.data : undefined
  }

  return <Header userMembership={membership} userRole={userRole} />
}
