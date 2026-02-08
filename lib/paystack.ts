const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = "https://api.paystack.co"

interface PaystackResponse<T = unknown> {
  status: boolean
  message: string
  data: T
}

interface PaystackInitializeData {
  authorization_url: string
  access_code: string
  reference: string
}

interface PaystackVerifyData {
  id: number
  status: string
  reference: string
  amount: number
  currency: string
  channel: string
  customer: {
    id: number
    customer_code: string
    email: string
    first_name: string | null
    last_name: string | null
  }
  authorization: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
  }
  plan?: {
    plan_code: string
    name: string
    amount: number
    interval: string
  }
}

interface PaystackSubscriptionData {
  customer: number
  plan: number
  status: string
  subscription_code: string
  email_token: string
  authorization: {
    authorization_code: string
  }
  next_payment_date: string
}

export type {
  PaystackResponse,
  PaystackInitializeData,
  PaystackVerifyData,
  PaystackSubscriptionData
}

async function paystackFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Paystack API error: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  return response.json()
}

export const paystack = {
  /**
   * Initialize a transaction
   */
  async initializeTransaction(params: {
    email: string
    amount: number // in kobo
    reference?: string
    callback_url?: string
    plan?: string
    metadata?: Record<string, unknown>
  }): Promise<PaystackResponse<PaystackInitializeData>> {
    return paystackFetch<PaystackInitializeData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(params)
    })
  },

  /**
   * Verify a transaction by reference
   */
  async verifyTransaction(
    reference: string
  ): Promise<PaystackResponse<PaystackVerifyData>> {
    return paystackFetch<PaystackVerifyData>(
      `/transaction/verify/${encodeURIComponent(reference)}`
    )
  },

  /**
   * Create a subscription
   */
  async createSubscription(params: {
    customer: string // customer code or email
    plan: string // plan code
    authorization?: string // authorization code
    start_date?: string
  }): Promise<PaystackResponse<PaystackSubscriptionData>> {
    return paystackFetch<PaystackSubscriptionData>("/subscription", {
      method: "POST",
      body: JSON.stringify(params)
    })
  },

  /**
   * Disable (cancel) a subscription
   */
  async cancelSubscription(params: {
    code: string // subscription code
    token: string // email token
  }): Promise<PaystackResponse<null>> {
    return paystackFetch<null>("/subscription/disable", {
      method: "POST",
      body: JSON.stringify(params)
    })
  },

  /**
   * Fetch a subscription
   */
  async fetchSubscription(
    subscriptionCodeOrId: string
  ): Promise<PaystackResponse<PaystackSubscriptionData>> {
    return paystackFetch<PaystackSubscriptionData>(
      `/subscription/${encodeURIComponent(subscriptionCodeOrId)}`
    )
  },

  /**
   * Create or fetch a customer
   */
  async createCustomer(params: {
    email: string
    first_name?: string
    last_name?: string
    metadata?: Record<string, unknown>
  }): Promise<
    PaystackResponse<{ customer_code: string; id: number; email: string }>
  > {
    return paystackFetch<{
      customer_code: string
      id: number
      email: string
    }>("/customer", {
      method: "POST",
      body: JSON.stringify(params)
    })
  }
}

// Pricing plans in kobo (100 kobo = 1 NGN)
export const PAYSTACK_PLANS = {
  SINGLE_STATION: {
    name: "Single Station",
    amount: 2500000, // 25,000 NGN/mo
    displayPrice: "\u20A625,000",
    interval: "monthly" as const
  },
  MULTI_STATION: {
    name: "Multi-Station Chain",
    amount: 7500000, // 75,000 NGN/mo
    displayPrice: "\u20A675,000",
    interval: "monthly" as const
  },
  PILOT_OFFER: {
    name: "Pilot Offer",
    amount: 1500000, // 15,000 NGN/mo
    displayPrice: "\u20A615,000",
    interval: "monthly" as const,
    description: "Special rate for first 3 months"
  }
} as const
