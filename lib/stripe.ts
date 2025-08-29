// Stripe functionality is disabled
console.log("Stripe functionality is disabled")

// Export a mock stripe object to prevent import errors
export const stripe = {
  webhooks: {
    constructEvent: () => {
      throw new Error("Stripe functionality is disabled")
    }
  },
  subscriptions: {
    retrieve: () => {
      throw new Error("Stripe functionality is disabled")
    }
  },
  products: {
    retrieve: () => {
      throw new Error("Stripe functionality is disabled")
    }
  }
}
