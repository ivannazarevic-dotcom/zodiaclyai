import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/charts/public/[publicId] - View public chart (no auth required)
export async function GET(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params

    // Find chart by publicId
    const chart = await prisma.natalChart.findUnique({
      where: { publicId },
      include: {
        user: {
          select: {
            email: true // Only include email for display
          }
        }
      }
    })

    if (!chart) {
      return NextResponse.json(
        { success: false, error: 'Chart not found' },
        { status: 404 }
      )
    }

    // Check if chart is public
    if (!chart.isPublic) {
      return NextResponse.json(
        { success: false, error: 'This chart is private' },
        { status: 403 }
      )
    }

    // Increment view count
    await prisma.natalChart.update({
      where: { id: chart.id },
      data: {
        viewCount: { increment: 1 }
      }
    })

    // Return chart data (excluding userId for privacy)
    return NextResponse.json({
      success: true,
      data: {
        id: chart.id,
        publicId: chart.publicId,
        location: chart.location,
        birthDate: chart.birthDate,
        chartData: chart.chartData,
        aiReading: chart.aiReading, // Include AI reading if available
        createdAt: chart.createdAt,
        viewCount: chart.viewCount + 1,
        shareCount: chart.shareCount,
        ownerEmail: chart.user.email.split('@')[0] + '***' // Partially hide email
      }
    })
  } catch (error) {
    console.error('Failed to fetch public chart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load chart' },
      { status: 500 }
    )
  }
}
