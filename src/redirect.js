const shouldCompress = require('./shouldCompress')
const compress = require('./compress')


function redirect(req, res, buffer) {
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
  console.log("status redirect")
  console.log(res.status)
//   console.log("entered compress from redirect")
//   compress(req, res, buffer)
  //res.status(302).end()
//   console.log("new status")
//   fetch(req.params.url)
//   .then(function(response) {
//     return response.status();
//   })
//   .then(function(myJson) {
//     console.log(myJson);
//   });
  console.log("url status")
  var request = require('request');
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
      console.log(origin.statusCode)
    }
          )
}

module.exports = redirect
