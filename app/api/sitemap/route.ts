import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET() {
  const baseUrl = 'https://zodiacly.online'

  try {
    // Static routes
    const staticUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/create-chart`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/numerology`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/compatibility`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/horoscopes`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/auth/login`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/auth/register`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/privacy`, priority: '0.4', changefreq: 'monthly' },
      { loc: `${baseUrl}/terms`, priority: '0.4', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact`, priority: '0.4', changefreq: 'monthly' },
    ]

    let dynamicUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = []

    try {
      // Get public charts
      const publicCharts = await prisma.natalChart.findMany({
        where: { isPublic: true },
        select: { publicId: true, updatedAt: true },
        take: 100,
      })

      const chartUrls = publicCharts.map((chart) => ({
        loc: `${baseUrl}/chart/${chart.publicId}`,
        priority: '0.5',
        changefreq: 'monthly',
        lastmod: chart.updatedAt.toISOString().split('T')[0],
      }))

      dynamicUrls = chartUrls
    } catch (dbError) {
      console.error('Database error in sitemap, returning static URLs only:', dbError)
      // Continue with static URLs only
    }

    const allUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = [...staticUrls, ...dynamicUrls]

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
