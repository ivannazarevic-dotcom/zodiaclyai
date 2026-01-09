import { stripe, PRICE_IDS } from './client'
import { prisma } from '@/lib/db/prisma'

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceType: 'monthly' | 'yearly'
): Promise<string> {
  const priceId = priceType === 'monthly' ? PRICE_IDS.PRO_MONTHLY : PRICE_IDS.PRO_YEARLY

  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  let customerId = user?.stripeCustomerId

  // Create a new customer if one doesn't exist OR if the existing customer is invalid
  // (e.g., test mode customer when using live keys)
  if (customerId) {
    try {
      // Verify the customer exists in current Stripe environment
      await stripe.customers.retrieve(customerId)
    } catch (error: any) {
      // Customer doesn't exist (likely test mode customer with live keys)
      // Reset customer ID to create a new one
      console.log(`Customer ${customerId} not found in current Stripe environment. Creating new customer.`)
      customerId = null
      
      // Clear the invalid customer ID from database
      await prisma.user.update({
        where: { id: userId },
        data: { 
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionStatus: null
        },
      })
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })
    customerId = customer.id

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    metadata: {
      userId,
    },
  })

  return session.url!
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return session.url
}
