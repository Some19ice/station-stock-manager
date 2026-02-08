import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { updateCustomerByPaystackCode } from "@/actions/customers"
import { getCustomerByUserId } from "@/actions/customers"
import { db } from "@/db"
import { customers } from "@/db/schema/customers"
import { eq } from "drizzle-orm"

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(body)
    .digest("hex")

  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      )
    }

    if (!verifyPaystackSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body) as {
      event: string
      data: Record<string, unknown>
    }

    switch (event.event) {
      case "charge.success": {
        const data = event.data as {
          reference: string
          amount: number
          customer: { customer_code: string; email: string }
          authorization: { authorization_code: string }
          metadata?: { userId?: string; customerId?: string; planKey?: string }
        }

        if (data.metadata?.userId) {
          // Find customer by userId from metadata and update
          const customer = await getCustomerByUserId(data.metadata.userId)
          if (customer) {
            await db
              .update(customers)
              .set({
                membership: "pro",
                paystackCustomerCode: data.customer.customer_code,
                paystackAuthorizationCode:
                  data.authorization.authorization_code,
                paystackLastPayment: new Date(),
                updatedAt: new Date()
              })
              .where(eq(customers.userId, data.metadata.userId))
          }
        } else if (data.customer?.customer_code) {
          // Fallback: update by paystack customer code
          await updateCustomerByPaystackCode(data.customer.customer_code, {
            membership: "pro",
            paystackAuthorizationCode: data.authorization.authorization_code,
            paystackLastPayment: new Date(),
            updatedAt: new Date()
          })
        }

        break
      }

      case "subscription.create": {
        const data = event.data as {
          subscription_code: string
          customer: { customer_code: string }
          plan: { plan_code: string; name: string }
          next_payment_date: string
        }

        await updateCustomerByPaystackCode(data.customer.customer_code, {
          paystackSubscriptionCode: data.subscription_code,
          membership: "pro",
          updatedAt: new Date()
        })

        break
      }

      case "subscription.disable":
      case "subscription.not_renew": {
        const data = event.data as {
          subscription_code: string
          customer: { customer_code: string }
        }

        await updateCustomerByPaystackCode(data.customer.customer_code, {
          membership: "free",
          paystackSubscriptionCode: null,
          updatedAt: new Date()
        })

        break
      }

      case "invoice.payment_failed": {
        const data = event.data as {
          customer: { customer_code: string }
          subscription: { subscription_code: string }
        }

        console.warn(
          `Payment failed for customer ${data.customer.customer_code}, subscription ${data.subscription.subscription_code}`
        )

        // Optionally downgrade after repeated failures
        // For now, just log it - Paystack will retry automatically
        break
      }

      default:
        console.log(`Unhandled Paystack webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
