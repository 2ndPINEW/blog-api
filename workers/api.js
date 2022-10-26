export default {
  async fetch(request, env) {
    return await handleRequest(request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  }
}

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  if (pathname.startsWith('/search/tags/')) {
    const targetTag = pathname.replace('/search/tags/', '')
    const res = await fetch('https://blog-bga.pages.dev/page-0.json')
    const data = await res.json()
    const contents = data.contents.filter(content => {
      return content.tags.some(tag => targetTag === tag)
    })
    const responseHeaders = {}
    res.headers.forEach((value, key) => {
      if (key !== 'content-type') {
        responseHeaders[key] = value
      }
    })

    return new Response(JSON.stringify({ contents }),
      {
        headers: {
          ...responseHeaders,
          "Content-Type": "application/json"
        }
      }
    )
    
  }

  return fetch(`https://blog-bga.pages.dev/${pathname}`);
}
