export default {
  async fetch(request, env) {
    return await handleRequest(request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  }
}

const blogBaseUrl = 'https://obake.land'
const assetBaseUrl = 'https://blog-bga.pages.dev'

async function createOgpOnlyResponse (pathname) {
  let title = 'ブログ'
  let description = '日報とか学んだこととかメモするブログ'
  let ogpUrl = assetBaseUrl + '/index-og.png'
  const requestUrl = blogBaseUrl + pathname

  // ブログページ向け
  if (pathname.startsWith('/blog/')) {
    const pageId = pathname.replace('/blog/', '')
    const res = await fetch(`${assetBaseUrl}/${pageId}.json`)
    const data = await res.json()
    title = data.metaData.title
    description = data.metaData.description
    ogpUrl = `${assetBaseUrl}/${pageId}-og.png`
  }

  // タグページ向け
  if (pathname.startsWith('/tags/')) {
    const tagName = pathname.replace('/tags/', '')
    title = `${tagName} の記事一覧`
    description = `${tagName} のタグがついた記事一覧`
    ogpUrl = `${assetBaseUrl}/${tagName}-og.png`
  }

  return `

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="description" content="${description}"/>
		<meta name='image' content="${ogpUrl}" />
    <meta property=og:url content="${requestUrl}" >
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
		<meta property="og:site_name" content='piのプログラミング日記' />
    <meta property=og:image content="${ogpUrl}">
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@2ndPINEW" />
    <meta name="twitter:title" content="${description}"/>
    <meta name=twitter:image content="${ogpUrl}">
  </head>
</html>

`
}

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  const userAgent = request.headers.get('User-Agent') ?? ''

  if (
    userAgent.indexOf('Twitterbot') >= 0 ||
    userAgent.indexOf('facebookexternalhit') >= 0 ||
    userAgent.indexOf('Discordbot') >= 0 ||
    userAgent.indexOf('SkypeUriPreview') >= 0 ||
    userAgent.indexOf('LinkExpanding') >= 0 ||
    userAgent.indexOf('PlurkBot') >= 0
  ) {
    const template = await createOgpOnlyResponse(pathname)
    return new Response(template,
      {
        headers: {
          "Content-Type": "text/html"
        }
      }
    )
  }


  return fetch('https://blog-front-5z7.pages.dev' + pathname);
}
