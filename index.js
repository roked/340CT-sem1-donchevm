/**
 * @name Main server file
 * @description Contains the implementation of the server.
 */
import Koa from 'koa'
import serve from 'koa-static'
import views from 'koa-views'
import session from 'koa-session'
import methodOverride from 'koa-methodoverride'
import Handlebars from 'handlebars'
import router from './routes/routes.js'

const app = new Koa({
	proxy: true,
	proxyIpHeader: 'X-Real-IP'
})
app.keys = ['darkSecret']

const defaultPort = 8080
const port = process.env.PORT || defaultPort

async function getHandlebarData(ctx, next) {
	console.log(`${ctx.method} ${ctx.path}`)
	ctx.hbs = {
		authorised: ctx.session.authorised,
		host: `https://${ctx.host}`
	}
	for (const key in ctx.query) ctx.hbs[key] = ctx.query[key]
	await next()
}

app.use(methodOverride('_method'))
app.use(serve('public'))
app.use(session(app))
app.use(views('views', {
	extension: 'handlebars'
}, {
	map: {
		handlebars: 'handlebars'
	}
}))

//register a helper (custom function)
//in order to iterate the map object (sorted issues) in handlebars
Handlebars.registerHelper('eachMap', (map, block) => {
	let output = ''

	for (const [key, value] of map) {
		output += block.fn({
			key,
			value
		})
	}

	//return the two values - key and issue object
	return output
})

app.use(getHandlebarData)

app.use(router.routes())
app.use(router.allowedMethods())

//run server
app.listen(port, async() => console.log(`listening on port ${port}`))
