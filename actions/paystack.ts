"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { paystack, PAYSTACK_PLANS } from "@/lib/paystack"
import {
  getCustomerByUserId,
  updateCustomerByUserId,
  updateCustomerByPaystackCode
} from "./customers"

export async function initializeTransaction(
  planKey: keyof typeof PAYSTACK_PLANS
) {
  const { userId } = await auth()
  if (!userId) {
    return { isSuccess: false, error: "Not authenticated" }
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  if (!email) {
    return { isSuccess: false, error: "No email address found for user" }
  }

  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return { isSuccess: false, error: "Customer not found" }
  }

  const plan = PAYSTACK_PLANS[planKey]
  if (!plan) {
    return { isSuccess: false, error: "Invalid plan selected" }
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const result = await paystack.initializeTransaction({
      email,
      amount: plan.amount,
      callback_url: `${appUrl}/dashboard?payment=success`,
      metadata: {
        userId,
        customerId: customer.id,
        planKey,
        planName: plan.name
      }
    })

    if (!result.status) {
      return { isSuccess: false, error: result.message }
    }

    return {
      isSuccess: true,
      data: {
        authorizationUrl: result.data.authorization_url,
        reference: result.data.reference
      }
    }
  } catch (error) {
    console.error("Paystack initialize transaction error:", error)
    return {
      isSuccess: false,
      error:
        error instanceof Error ? error.message : "Failed to initialize payment"
    }
  }
}

export async function verifyTransaction(reference: string) {
  const { userId } = await auth()
  if (!userId) {
    return { isSuccess: false, error: "Not authenticated" }
  }

  try {
    const result = await paystack.verifyTransaction(reference)

    if (!result.status || result.data.status !== "success") {
      return {
        isSuccess: false,
        error: `Transaction verification failed: ${result.data.status || result.message}`
      }
    }

    // Update customer with Paystack details
    await updateCustomerByUserId(userId, {
      membership: "pro",
      paystackCustomerCode: result.data.customer.customer_code,
      paystackAuthorizationCode: result.data.authorization.authorization_code,
      paystackLastPayment: new Date(),
      updatedAt: new Date()
    })

    return {
      isSuccess: true,
      data: {
        status: result.data.status,
        reference: result.data.reference,
        amount: result.data.amount,
        customerCode: result.data.customer.customer_code
      }
    }
  } catch (error) {
    console.error("Paystack verify transaction error:", error)
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to verify payment"
    }
  }
}

export async function createSubscription(planCode: string) {
  const { userId } = await auth()
  if (!userId) {
    return { isSuccess: false, error: "Not authenticated" }
  }

  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return { isSuccess: false, error: "Customer not found" }
  }

  if (!customer.paystackCustomerCode) {
    return {
      isSuccess: false,
      error:
        "No Paystack customer record. Please make an initial payment first."
    }
  }

  try {
    const result = await paystack.createSubscription({
      customer: customer.paystackCustomerCode,
      plan: planCode,
      authorization: customer.paystackAuthorizationCode || undefined
    })

    if (!result.status) {
      return { isSuccess: false, error: result.message }
    }

    await updateCustomerByUserId(userId, {
      paystackSubscriptionCode: result.data.subscription_code,
      membership: "pro",
      updatedAt: new Date()
    })

    return {
      isSuccess: true,
      data: {
        subscriptionCode: result.data.subscription_code,
        nextPaymentDate: result.data.next_payment_date
      }
    }
  } catch (error) {
    console.error("Paystack create subscription error:", error)
    return {
      isSuccess: false,
      error:
        error instanceof Error ? error.message : "Failed to create subscription"
    }
  }
}

export async function cancelSubscription() {
  const { userId } = await auth()
  if (!userId) {
    return { isSuccess: false, error: "Not authenticated" }
  }

  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return { isSuccess: false, error: "Customer not found" }
  }

  if (!customer.paystackSubscriptionCode) {
    return { isSuccess: false, error: "No active subscription found" }
  }

  try {
    // Fetch the subscription to get the email token needed for cancellation
    const subscription = await paystack.fetchSubscription(
      customer.paystackSubscriptionCode
    )

    if (!subscription.status) {
      return { isSuccess: false, error: "Could not fetch subscription details" }
    }

    const result = await paystack.cancelSubscription({
      code: customer.paystackSubscriptionCode,
      token: subscription.data.email_token
    })

    if (!result.status) {
      return { isSuccess: false, error: result.message }
    }

    await updateCustomerByUserId(userId, {
      membership: "free",
      paystackSubscriptionCode: null,
      updatedAt: new Date()
    })

    return { isSuccess: true }
  } catch (error) {
    console.error("Paystack cancel subscription error:", error)
    return {
      isSuccess: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel subscription"
    }
  }
}
