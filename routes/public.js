/**
 * @module router/public
 * @description Contains the implementation all routes related to home page and the user.
 * @author Mitko Donchev
 */
import Router from 'koa-router'
import fetch from 'node-fetch'
import Accounts from '../modules/accounts.js'
import Issues from '../modules/issues.js'

const router = new Router()

const dbName = 'website.db'

/**
 * The public home page, it shows all issues.
 *
 * @name Home Page
 * @author Mitko Donchev
 * @route {GET} /
 */
router.get('/', async ctx => {
	const issue = await new Issues(dbName)
	try {
		//check if the user is a council worker (return true or false)
		const {isWorker} = ctx.session
		const issues = await issue.getAllIssues()

		//get a sorted map of issues - key/value = distance/issue(object) (closest first)
		const sortedIssues = await sortIssues(issues, ctx)

		await ctx.render('index', {issues: sortedIssues, authorised: ctx.hbs.authorised, isWorker: isWorker})
	} catch (err) {
		console.log(err)
	} finally {
		issue.close()
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
		const ifWorker = worker === 'i_am_worker' ? 1 : 0
		// call the functions in the module
		await account.register(user, pass, email, ifWorker)
		ctx.redirect(`/login?msg=new user "${user}" added, you need to log in`)
	} catch (err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})


/**
 * The script executed after finishing a registration.
 *
 * @name Validation Script
 * @route {GET} /postregister
 */
router.get('/postregister', async ctx => await ctx.render('validate'))

/**
 * The script to validate the user.
 *
 * @name Validation Script
 * @route {GET} /validate/:user/:token
 */
router.get('/validate/:user/:token', async ctx => {
	try {
		console.log('VALIDATE')
		console.log(`URL --> ${ctx.request.url}`)
		if (!ctx.request.url.includes('.css')) {
			const milliseconds = 1000
			const now = Math.floor(Date.now() / milliseconds)
			const account = await new Accounts(dbName)
			await account.checkToken(ctx.params.user, ctx.params.token, now)
			ctx.hbs.msg = `account "${ctx.params.user}" has been validated`
			await ctx.render('login', ctx.hbs)
		}
	} catch (err) {
		await ctx.render('login', ctx.hbs)
	}
})

/**
 * The user login page.
 *
 * @name Login Page
 * @route {GET} /login
 */
router.get('/login', async ctx => {
	console.log(ctx.hbs)
	//render login page
	await ctx.render('login', ctx.hbs)
})

/**
 * The script to process user login.
 *
 * @name Login Script
 * @route {POST} /login
 */
router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		await account.login(body.user, body.pass)
		const isWorker = await account.isWorker(body.user)
		ctx.session.authorised = true //if authorized
		ctx.session.user = body.user
		ctx.session.isWorker = isWorker.worker === 1
		const referrer = body.referrer || '/'
		return ctx.redirect(`${referrer}`)
	} catch (err) {
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		account.close()
	}
})

/**
 * Logout user.
 *
 * @name Logout
 * @route {GET} /logout
 */
router.get('/logout', async ctx => {
	ctx.session.authorised = false
	ctx.redirect('/')
})

/**
 * The function will get the user location and get the distance between them and each issue location
 *
 * @name Sort the issues (closest first)
 * @author Mitko Donchev
 * @params {Array} issues - all issues
 * @params {Object} ctx - context
 * @returns {Map} a map object which contains key/value - distance/issue(object)
 */
export async function sortIssues(issues, ctx) {
	try {
		const userLoc = await userLocation(ctx) //get the location of the user
		let plus = 0.000001
		const issuesData = new Map() //create a map and store (distance, issue)
		for (const issue of issues) {
			const latLon = await getLatAndLong(issue.location)
			let distance = getDistance(userLoc.latitude, userLoc.longitude, latLon.latitude, latLon.longitude)
			if (issuesData.has(distance)) { //prevent duplication add a 0.01 to the distance
				distance += plus
				plus += plus
			}
			issuesData.set(distance, issue)
		}
		//sort the map using sort functions on all entries
		return new Map([...issuesData.entries()].sort()) //return the sorted map
	} catch (err) {
		throw new Error('Missing or invalid parameters')
	}
}

/**
 * The function will automatically select the location of the issue based on the user's current location
 *
 * @name Select the correct location
 * @author Mitko Donchev
 * @returns {String} the location based on the user's current location
 */
async function userLocation(ctx) {
	try {
		//get the client ip address from request header
		const key = 'x-forwarded-for'
		const ip = ctx.header[key]

		//get the user lat and long
		return await getLatLong(ip)
	} catch (err) {
		throw new Error('Missing or invalid parameters')
	}
}

/**
 * The function will automatically get the latitude and longitude based on the user's current location
 *
 * @name Get the latitude and longitude
 * @author Mitko Donchev
 * @params {Integer} ip - the public ip address
 * @returns {Object} the latitude and longitude based on the user's current location
 */
export async function getLatLong(ip) {
	try {
		const settings = {method: 'Get'}
		//fetch the data from the api and return the result
		return await fetch(`http://ipwhois.app/json/${ip}?objects=latitude,longitude`, settings)
			.then(res => res.json())
			.then((json) => json)
	} catch (err) {
		console.log(err)
	}
}

/**
 * The function will automatically provide the latitude and longitude using a postcode
 *
 * @name Get the latitude and longitude from a postcode
 * @author Mitko Donchev
 * @params {String} postcode the postcode of an issue
 * @returns {Object} information about the address (including long and lat)
 */
export async function getLatAndLong(postcode) {
	try {
		const settings = {method: 'Get'}
		//fetch the data from the api and return the result
		return await fetch(`http://api.postcodes.io/postcodes/${postcode}`, settings)
			.then(res => res.json())
			.then((json) => json.result)
	} catch (err) {
		console.log(err)
	}
}

/**
 * The function will calculate the distance between the user location and all issues and sort them (closest first)
 *
 * @name Closest issue
 * @author Mitko Donchev
 * @params {Integer} lat1 destination 1 latitude
 * @params {Integer} lon1 destination 1 latitude
 * @params {Integer} lat2 destination 2 latitude
 * @params {Integer} lon2 destination 2 latitude
 * @returns {Array} sorted list of locations
 *
 * Reference https://en.wikipedia.org/wiki/Haversine_formula, http://www.movable-type.co.uk/scripts/latlong.html
 */
export function getDistance(lat1, lon1, lat2, lon2) {
	const radius = 6371 // Radius of the earth in km
	const half = 2
	const hundred = 100
	const disLat = deg2rad(lat2 - lat1) // deg2rad below
	const disLon = deg2rad(lon2 - lon1)
	const a =
		Math.sin(disLat / half) * Math.sin(disLat / half) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(disLon / half) * Math.sin(disLon / half)

	const c = half * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = radius * c
	// returns the distance in km / rounded to second decimal place
	return Math.round((distance + Number.EPSILON) * hundred) / hundred
}

//calculate the radius
function deg2rad(deg) {
	const halfD = 180 //180 degree
	return deg * (Math.PI / halfD)
}

export default router
