/**
 * Main Application File for Dillinger.
 */

'use strict'

var config = require('./config')()
  , connect = require('connect')
  , methodOverride = require('method-override')
  , logger = require('morgan')
  , favicon = require('serve-favicon')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , cookieSession = require('cookie-session')
  , express = require('express')
  , routes = require('./routes')
  , serveStatic = require('serve-static')
  , errorHandler = require('errorhandler')
  , path = require('path')
  , fs = require('fs')
  , app = express()
  , core = require('./plugins/core/server.js')
  , dropbox = require('./plugins/dropbox/server.js')
  , github = require('./plugins/github/server.js')
  , googledrive = require('./plugins/googledrive/server.js')
  , onedrive = require('./plugins/onedrive/server.js')
  , env = process.env.NODE_ENV || 'development';

app.set('port', process.env.PORT || 8080)
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

// May not need to use favicon if using nginx for serving
// static assets. Just comment it out below.
app.use(favicon(path.join(__dirname, 'public/favicon.ico')))

if(env === 'development'){
  app.use(logger('dev'))
}
else{
  app.use(logger('short'))
}

app.use(compress())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(cookieParser('your secret here'))
app.use(cookieSession({
  name: 'dillinger-session',
  keys: ['open', 'source']
}))

// May not need to use serveStatic if using nginx for serving
// static assets. Just comment it out below.
app.use(serveStatic(__dirname + '/public'))

// Setup local variables to be available in the views.
app.locals.title = config.title || 'Dillinger.'
app.locals.description = config.description || 'Dillinger, the last Markdown Editor, ever.'

if (config.googleWebmasterMeta) {
  app.locals.googleWebmasterMeta = config.googleWebmasterMeta
}

if (config.keywords) {
  app.locals.keywords = config.keywords
}

if (config.author) {
  app.locals.author = config.author
}

app.locals.node_version = process.version.replace('v', '')
app.locals.app_version = require('./package.json').version
app.locals.env = process.env.NODE_ENV

// At startup time so sync is ok.
app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8')

if ('development' == env) {
  app.use(errorHandler())
}

app.get('/', routes.index)
app.get('/not-implemented', routes.not_implemented)

app.use(core)
app.use(dropbox)
app.use(github)
app.use(googledrive)
app.use(onedrive)

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'))
    console.log('\nhttp://localhost:' + app.get('port') + '\n')
})
