
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Issues   from '../modules/issues.js'
const dbName = 'website.db'

/**
 * The public home page, it shows all issues.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
    //check if the user is a council worker (return true or false)
    const {isWorker} = ctx.session   
    const issue = await new Issues(dbName)
    const issues = await issue.getAllIssues()
		await ctx.render('index', {issues: issues, authorised: ctx.hbs.authorised, isWorker: isWorker})
	} catch(err) {
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
    //get all values from the body
    const {user, pass, email, worker} = ctx.request.body
    //check if the user is a worker
    const ifWorker = (worker === 'i_am_worker') ? 1 : 0
		// call the functions in the module
		await account.register(user, pass, email, ifWorker)
		ctx.redirect(`/login?msg=new user "${user}" added, you need to log in`)
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

router.get('/postregister', async ctx => await ctx.render('validate'))

router.get('/validate/:user/:token', async ctx => {
	try {
		console.log('VALIDATE')
		console.log(`URL --> ${ctx.request.url}`)
		if(!ctx.request.url.includes('.css')) {
			console.log(ctx.params)
			const milliseconds = 1000
			const now = Math.floor(Date.now() / milliseconds)
			const account = await new Accounts(dbName)
			await account.checkToken(ctx.params.user, ctx.params.token, now)
			ctx.hbs.msg = `account "${ctx.params.user}" has been validated`
			await ctx.render('login', ctx.hbs)
		}
	} catch(err) {
		await ctx.render('login', ctx.hbs)
	}
})

router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login', ctx.hbs)
})

router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		await account.login(body.user, body.pass)
    const isWorker = await account.isWorker(body.user)
		ctx.session.authorised = true
    ctx.session.user = body.user
    ctx.session.isWorker = (isWorker.worker === 1) ? true : false
		const referrer = body.referrer || '/'
		return ctx.redirect(`${referrer}?msg=you are now logged in...`)
	} catch(err) {
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		account.close()
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = false
	ctx.redirect('/')
})

export default router
