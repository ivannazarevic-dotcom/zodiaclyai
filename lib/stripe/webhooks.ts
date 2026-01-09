import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'
import { stripe } from './client'

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log('[Webhook] checkout.session.completed received')
  console.log('[Webhook] Session ID:', session.id)
  console.log('[Webhook] Customer ID:', session.customer)
  console.log('[Webhook] Subscription ID:', session.subscription)
  console.log('[Webhook] Metadata:', JSON.stringify(session.metadata))

  const userId = session.metadata?.userId
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('[Webhook] ERROR: No userId in session metadata!')
    console.error('[Webhook] Full session object:', JSON.stringify(session, null, 2))
    throw new Error('No userId in session metadata')
  }

  console.log('[Webhook] Attempting to upgrade user:', userId)

  try {
    // Update user to PRO plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'PRO',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'ACTIVE',
      },
    })

    console.log('[Webhook] ✅ SUCCESS! User upgraded to PRO:', {
      userId: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      stripeCustomerId: updatedUser.stripeCustomerId,
      subscriptionStatus: updatedUser.subscriptionStatus,
    })
  } catch (error: any) {
    console.error('[Webhook] ❌ ERROR updating user:', error)
    console.error('[Webhook] Error details:', {
      message: error.message,
      code: error.code,
      userId,
      customerId,
      subscriptionId,
    })
    throw error
  }
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.warn(`No user found for subscription ${subscription.id}`)
    return
  }

  const status = subscription.status

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status.toUpperCase() as any,
      plan: status === 'active' ? 'PRO' : 'FREE',
    },
  })

  console.log(`Subscription ${subscription.id} updated to ${status}`)
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.warn(`No user found for subscription ${subscription.id}`)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE',
      subscriptionStatus: 'CANCELED',
    },
  })

  console.log(`User ${user.id} downgraded to FREE`)
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
