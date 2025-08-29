// Stripe webhooks disabled - returning early
export async function POST(req: Request) {
  console.log("Stripe webhooks are disabled")
  return new Response(JSON.stringify({ received: true, disabled: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  })
}
