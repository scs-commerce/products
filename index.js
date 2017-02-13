const path = require('path')
const express = require('express')
const morgan = require('morgan')
const urlFactory = require('url-factory').default

const config = require('./package.json').config

const products = require('./products')
const pagedProducts = products.paged

const app = express()
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.set('view engine', 'pug')

app.get('/', (req, res, next) => {
  const link = linkFactory(req)

  const page = (req.query.page && parseInt(req.query.page)) || 0

  if (pagedProducts[page]) {
    res.status(200).render('product-list', { products: pagedProducts[page], page, pageCount: pagedProducts.length, link })
  } else {
    next()
  }
})

app.get('/:id', (req, res, next) => {
  const product = products.find(parseInt(req.params.id))

  if (product) {
    return res.status(200).render('product', { product })
  }

  next()
})

app.use((req, res, next) => {
  res.status(404).render('404')
})

app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).render('500', { error })
})

const port = process.env.PORT || config.port
console.log(`start listening on port ${port}`)
app.listen(port)

function stripTrailingSlash (host) {
  const cleaned = host.replace(/\/$/, '')
  console.log(cleaned)
  return cleaned
}

function linkFactory (req) {
  return urlFactory(`//${stripTrailingSlash(req.headers.host)}`)
}
