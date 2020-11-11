/**
 * @module router/routes
 * @description Combains all routes, apply body parser and exports.
 * @author Mitko Donchev
 */
import Router from 'koa-router'
import bodyParser from 'koa-body'

import publicRouter from './public.js'
import issuesRouter from './issues.js'

const mainRouter = new Router()

mainRouter.use(bodyParser({multipart: true}))

//array of all routes
const nestedRoutes = [publicRouter, issuesRouter]
for (const router of nestedRoutes) {
	mainRouter.use(router.routes())
	mainRouter.use(router.allowedMethods())
}

//exporting the main router
export default mainRouter
