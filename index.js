
import Koa from 'koa'
import serve from 'koa-static'
import views from 'koa-views'
import session from 'koa-session'
import handlebars from 'handlebars'

import { apiRouter } from './routes/routes.js'

const app = new Koa()
app.keys = ['darkSecret']

const defaultPort = 8080
const port = process.env.PORT || defaultPort

app.use(serve('public'))
app.use(session(app))
app.use(views('views', { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

//register custom handlebars helper
handlebars.registerHelper('conditions', function(v1, operator, v2, options) {
	switch(operator) {
		case '===':
			return v1 === v2 ? options.fn(this) : options.inverse(this)
		case '!==':
			return v1 !== v2 ? options.fn(this) : options.inverse(this)
		case '&&':
			return v1 && v2 ? options.fn(this) : options.inverse(this)
		case '||':
			return v1 || v2 ? options.fn(this) : options.inverse(this)
		default:
			return options.inverse(this)
	}
})

app.use( async(ctx, next) => {
	console.log(`${ctx.method} ${ctx.path}`)
	ctx.hbs = {
		authorised: ctx.session.authorised,
		host: `https://${ctx.host}`
	}
	for(const key in ctx.query) ctx.hbs[key] = ctx.query[key]
	await next()
})

app.use(apiRouter.routes(), apiRouter.allowedMethods())

app.listen(port, async() => console.log(`listening on port ${port}`))
