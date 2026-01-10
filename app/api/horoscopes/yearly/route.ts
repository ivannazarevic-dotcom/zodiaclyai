import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateYearlyHoroscope, ZodiacSign } from '@/lib/openai/horoscopes'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sign = searchParams.get('sign') as ZodiacSign | null

    // For yearly horoscopes, use January 1st of the current year
    const currentYear = new Date().getFullYear()
    const yearDate = new Date(currentYear, 0, 1) // January 1st
    yearDate.setHours(0, 0, 0, 0)

    if (sign) {
      // Get horoscope for specific sign
      let horoscope = await prisma.horoscope.findFirst({
        where: {
          sign,
          type: 'YEARLY',
          date: yearDate
        }
      })

      // If doesn't exist, generate it
      if (!horoscope) {
        const content = await generateYearlyHoroscope(sign)
        horoscope = await prisma.horoscope.create({
          data: {
            sign,
            type: 'YEARLY',
            date: yearDate,
            content: content as any
          }
        })
      }

      return NextResponse.json({
        success: true,
        horoscope: {
          sign: horoscope.sign,
          content: horoscope.content,
          date: horoscope.date,
          year: currentYear
        }
      })
    } else {
      // Get all yearly horoscopes
      const horoscopes = await prisma.horoscope.findMany({
        where: {
          type: 'YEARLY',
          date: yearDate
        },
        orderBy: {
          sign: 'asc'
        }
      })

      // If we don't have all 12, generate missing ones
      const allSigns: ZodiacSign[] = [
        'ARIES', 'TAURUS', 'GEMINI', 'CANCER',
        'LEO', 'VIRGO', 'LIBRA', 'SCORPIO',
        'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
      ]

      const existingSigns = new Set(horoscopes.map(h => h.sign))
      const missingSigns = allSigns.filter(s => !existingSigns.has(s))

      if (missingSigns.length > 0) {
        const newHoroscopes = await Promise.all(
          missingSigns.map(async (sign) => {
            const content = await generateYearlyHoroscope(sign)
            return prisma.horoscope.create({
              data: {
                sign,
                type: 'YEARLY',
                date: yearDate,
                content: content as any
              }
            })
          })
        )

        horoscopes.push(...newHoroscopes)
      }

      return NextResponse.json({
        success: true,
        horoscopes: horoscopes.map(h => ({
          sign: h.sign,
          content: h.content,
          date: h.date,
          year: currentYear
        }))
      })
    }
  } catch (error) {
    console.error('Error fetching yearly horoscopes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch yearly horoscopes'
      },
      { status: 500 }
    )
  }
}
