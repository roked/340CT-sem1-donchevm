
import Router from 'koa-router'
import bodyParser from 'koa-body'

import { publicRouter } from './public.js'
import { secureRouter } from './secure.js'
import { issuesRouter } from './issues.js'

const apiRouter = new Router()

apiRouter.use(bodyParser({multipart: true}))

const nestedRoutes = [publicRouter, secureRouter, issuesRouter]
for (const router of nestedRoutes) apiRouter.use(router.routes(), router.allowedMethods())

export { apiRouter }
