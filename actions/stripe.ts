"use server"

import { auth } from "@clerk/nextjs/server"
import { SelectCustomer } from "@/db/schema"
import {
  getCustomerByUserId,
  createCustomer,
  updateCustomerByUserId,
  updateCustomerByStripeCustomerId
} from "./customers"

// Types
type MembershipStatus = SelectCustomer["membership"]

// Stripe functionality is disabled
console.log("Stripe functionality is disabled")

const getMembershipStatus = (
  status: any,
  membership: MembershipStatus
): MembershipStatus => {
  // Stripe disabled - return free membership
  return "free"
}

const getSubscription = async (subscriptionId: string) => {
  // Stripe disabled
  throw new Error("Stripe functionality is disabled")
}

export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
) => {
  console.log(
    "Stripe functionality is disabled - updateStripeCustomer called but will not execute"
  )
  return { isSuccess: false, error: "Stripe functionality is disabled" }
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<MembershipStatus> => {
  console.log(
    "Stripe functionality is disabled - manageSubscriptionStatusChange called but will not execute"
  )
  return "free"
}

export const createCheckoutUrl = async (
  paymentLinkUrl: string
): Promise<{ url: string | null; error: string | null }> => {
  console.log(
    "Stripe functionality is disabled - createCheckoutUrl called but will not execute"
  )
  return { url: null, error: "Stripe functionality is disabled" }
}
