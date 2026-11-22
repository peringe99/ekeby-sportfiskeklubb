const siteName = 'Ekeby Sportfiskeklubb'
const siteUrl = 'https://ekebysportfiskeklubb.se'
const defaultTitle = 'Ekeby Sportfiskeklubb – Gemenskap, natur och sportfiske'
const defaultDescription =
  'En förening för dig som älskar fisket, naturen och gemenskapen kring vattnet.'

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }

  element.setAttribute('content', content)
}

function getCanonicalUrl(path) {
  const baseUrl = import.meta.env.BASE_URL
  const routePath = path === '/' ? '' : path.replace(/^\/+/, '')
  return new URL(`${baseUrl}${routePath}`, siteUrl).href
}

function updateOrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: siteName,
    description: defaultDescription,
    url: new URL(import.meta.env.BASE_URL, siteUrl).href,
  }

  let element = document.getElementById('organization-schema')

  if (!element) {
    element = document.createElement('script')
    element.id = 'organization-schema'
    element.type = 'application/ld+json'
    document.head.append(element)
  }

  element.textContent = JSON.stringify(data)
}

export function updateSeo(route) {
  const title = route.meta.title || defaultTitle
  const description = route.meta.description || defaultDescription
  const canonicalUrl = getCanonicalUrl(route.path)

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', route.meta.robots || 'index, follow')
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:locale', 'sv_SE')
  setMeta('property', 'og:site_name', siteName)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('name', 'twitter:card', 'summary')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.append(canonical)
  }
  canonical.setAttribute('href', canonicalUrl)

  updateOrganizationSchema()
}
