import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get recent webhook events
    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        processed: true,
        createdAt: true,
        payload: true,
      },
    })

    // Get users with stripe data
    const usersWithStripe = await prisma.user.findMany({
      where: {
        OR: [
          { stripeCustomerId: { not: null } },
          { stripeSubscriptionId: { not: null } },
        ],
      },
      select: {
        id: true,
        email: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        webhookEvents: {
          total: events.length,
          events: events.map((e) => ({
            id: e.id,
            type: e.type,
            processed: e.processed,
            createdAt: e.createdAt,
            hasUserId: !!(e.payload as any)?.metadata?.userId,
            userId: (e.payload as any)?.metadata?.userId,
            customerId: (e.payload as any)?.customer,
            subscriptionId: (e.payload as any)?.subscription,
          })),
        },
        users: {
          total: usersWithStripe.length,
          users: usersWithStripe,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('[Debug] Error fetching webhook debug data:', error)
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
