const request = require('request')
const pick = require('lodash').pick
const shouldCompress = require('./shouldCompress')
const redirect = require('./redirect')
const compress = require('./compress')
const bypass = require('./bypass')
const copyHeaders = require('./copyHeaders')

function proxy(req, res) {
  request.get(
    req.params.url,
    {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': 'Bandwidth-Hero Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1 bandwidth-hero'
      },
      timeout: 10000,
      maxRedirects: 5,
      encoding: null,
      strictSSL: false,
      gzip: true,
      jar: true
    },
    (err, origin, buffer) => {
      if (err || origin.statusCode >= 400) {
        console.log("params proxy")
        console.log(req.params.url)
        console.log("redirecting from proxy")
        url = decodeURIComponent(req.params.url)             // ensure that the url doesn't get double encoded
        urlMatch = url.match(/(https?:\/\/)(?!.*\1)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/)[0] // if there's only one url it'll return the same, if there's more than one (determined by the existance of http://) it'll return the last instance
        if(urlMatch) req.params.url = urlMatch // so that if regex returns null it doesn't overwrite the url
        console.log("proxy url")
        console.log(req.params.url)
        return redirect(req, res, buffer)
      }

      copyHeaders(origin, res)
      res.setHeader('content-encoding', 'identity')
      req.params.originType = origin.headers['content-type'] || ''
      req.params.originSize = buffer.length

      if (shouldCompress(req)) {
        console.log("entered compress")
        compress(req, res, buffer)
      } else {
        console.log("entered bypass")
        bypass(req, res, buffer)
      }
    }
  )
}

module.exports = proxy
