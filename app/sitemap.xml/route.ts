import { NextResponse } from 'next/server'
import { seoConfig } from '../../utils/seoConfig'

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://remont-stiralok.vercel.app'
  const now = new Date().toISOString()

  const routes = Object.keys(seoConfig).filter((p) => typeof p === 'string' && p.startsWith('/'))

  const urlEntries = routes
    .map((path) => {
      const loc = `${BASE}${path === '/' ? '' : path}`
      let priority = 0.9
      let changefreq: 'daily' | 'weekly' = 'weekly'
      if (path === '/') {
        priority = 1.0
        changefreq = 'daily'
      } else if (path === '/articles') {
        priority = 0.8
        changefreq = 'weekly'
      }
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
