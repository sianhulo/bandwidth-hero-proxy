function redirect(req, res) {
  if (res.headersSent) return

  res.setHeader('content-length', 0)
  res.removeHeader('cache-control')
  res.removeHeader('expires')
  res.removeHeader('date')
  res.removeHeader('etag')
  console.log("url")
  console.log(req.params.url)
  url = decodeURIComponent(req.params.url)             // ensure that the url doesn't get double encoded
  urlMatch = url.match(/(https?:\/\/)(?!.*\1)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/)[0] // if there's only one url it'll return the same, if there's more than one (determined by the existance of http://) it'll return the last instance
  if(urlMatch) url = urlMatch // so that if regex returns null it doesn't overwrite the url
  res.setHeader('location', encodeURI(url))
  req.params.url = url
  console.log("params.url")
  console.log(req.params.url)
  if (shouldCompress(req)) {
    console.log("entered compress from redirect")
    compress(req, res, buffer)
  }
  //res.status(302).end()
}

module.exports = redirect
