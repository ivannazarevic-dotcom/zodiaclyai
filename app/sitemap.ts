import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zodiacly.online'

  // Static routes
  const routes = [
    '',
    '/create-chart',
    '/compatibility',
    '/numerology',
    '/horoscopes',
    '/blog',
    '/auth/login',
    '/auth/register',
    '/privacy',
    '/terms',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  try {
    // Get all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const blogRoutes = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Get all public charts for sharing
    const publicCharts = await prisma.natalChart.findMany({
      where: { isPublic: true },
      select: {
        publicId: true,
        updatedAt: true,
      },
      take: 100, // Limit to most recent 100 public charts
    })

    const chartRoutes = publicCharts.map((chart) => ({
      url: `${baseUrl}/chart/${chart.publicId}`,
      lastModified: chart.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...routes, ...blogRoutes, ...chartRoutes]
  } catch (error) {
    // If database connection fails during build, return static routes only
    console.error('Sitemap generation error (returning static routes only):', error)
    return routes
  }
}
