import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import {
  verifyWebhookSignature,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from '@/lib/stripe/webhooks'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  console.log('[Webhook] ======================================')
  console.log('[Webhook] Stripe webhook received at:', new Date().toISOString())
  
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    console.log('[Webhook] Body length:', body.length)
    console.log('[Webhook] Signature present:', !!signature)

    if (!signature) {
      console.error('[Webhook] ❌ No signature in request!')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    console.log('[Webhook] Verifying webhook signature...')
    
    // Verify webhook signature
    const event = await verifyWebhookSignature(body, signature)
    
    console.log('[Webhook] ✅ Signature verified!')
    console.log('[Webhook] Event type:', event.type)
    console.log('[Webhook] Event ID:', event.id)

    // Log webhook event to database (wrapped in try-catch)
    try {
      await prisma.webhookEvent.create({
        data: {
          type: event.type,
          payload: event as any,
          processed: false,
        },
      })
      console.log('[Webhook] Event logged to database')
    } catch (dbError: any) {
      console.error('[Webhook] ⚠️ Failed to log event to database:', dbError.message)
      // Continue processing even if logging fails
    }

    // Handle different event types
    console.log('[Webhook] Processing event type:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('[Webhook] Handling checkout.session.completed')
        await handleCheckoutSessionCompleted(event.data.object as any)
        console.log('[Webhook] ✅ checkout.session.completed handled successfully')
        break

      case 'customer.subscription.created':
        console.log('[Webhook] Handling customer.subscription.created')
        await handleSubscriptionCreated(event.data.object as any)
        console.log('[Webhook] ✅ customer.subscription.created handled successfully')
        break

      case 'customer.subscription.updated':
        console.log('[Webhook] Handling customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object as any)
        console.log('[Webhook] ✅ customer.subscription.updated handled successfully')
        break

      case 'customer.subscription.deleted':
        console.log('[Webhook] Handling customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object as any)
        console.log('[Webhook] ✅ customer.subscription.deleted handled successfully')
        break

      default:
        console.log('[Webhook] ⚠️ Unhandled event type:', event.type)
    }

    // Mark as processed (wrapped in try-catch)
    try {
      await prisma.webhookEvent.updateMany({
        where: {
          type: event.type,
          processed: false,
        },
        data: {
          processed: true,
        },
      })
      console.log('[Webhook] Event marked as processed')
    } catch (dbError: any) {
      console.error('[Webhook] ⚠️ Failed to mark event as processed:', dbError.message)
      // This is not critical, continue
    }

    console.log('[Webhook] ✅ Webhook processing complete!')
    console.log('[Webhook] ======================================')
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] ❌❌❌ FATAL ERROR ❌❌❌')
    console.error('[Webhook] Error message:', error.message)
    console.error('[Webhook] Error stack:', error.stack)
    console.error('[Webhook] Error code:', error.code)
    console.error('[Webhook] ======================================')
    
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
