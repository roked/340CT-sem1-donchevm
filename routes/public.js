
import Router from 'koa-router'
import fetch from 'node-fetch'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Issues from '../modules/issues.js'
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

		//get a sorted map of issues - key/value = distance/issue(object) (closest first)
		const sortedIssues = await sortIssues(issues, ctx)

		await ctx.render('index', {issues: sortedIssues, authorised: ctx.hbs.authorised, isWorker: isWorker})
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
		const ifWorker = worker === 'i_am_worker' ? 1 : 0
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
		ctx.session.isWorker = isWorker.worker === 1 ? true : false
		const referrer = body.referrer || '/'
		return ctx.redirect(`${referrer}`)
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

/**
 * The function will get the user location and get the distance between them and each issue location
 *
 * @name Sort the issues (closest first)
 * @params {Array} issues - all issues
 * @params {Object} ctx - context
 * @returns {Map} a map object which contains key/value - distance/issue(object)
 */
async function sortIssues(issues, ctx) {
	try{
		const userLoc = await userLocation(ctx) //get the location of the user
		let plus = 0.000001
		const issuesData = new Map() //create a map and store (distance, issue)
		for(const issue of issues) {
			const latLon = await getLatAndLong(issue.location)
			let distance = getDistance(userLoc.latitude,userLoc.longitude,latLon.latitude,latLon.longitude)
			if(issuesData.has(distance)) { //prevent duplication add a 0.01 to the distance
				distance += plus
				plus += plus
			}
			issuesData.set(distance, issue)
		}
		const mapSorted = new Map([...issuesData.entries()].sort()) //sort the map using sort functions on all entries
		return mapSorted //return the sorted map
	} catch (err) {
		console.log(err)
	}
}

/**
 * The function will automatically select the location of the issue based on the user's current location
 *
 * @name Select the correct location
 * @returns {String} the location based on the user's current location
 */
async function userLocation(ctx) {
	try{
		//get the client ip address from request header
		const key = 'x-forwarded-for'
		const ip = ctx.header[key]

		//get the user lat and long
		const latLong = await getLatLong(ip)

		return latLong
	} catch(err) {
		console.log(err.message)
	}
}

/**
 * The function will automatically get the latitude and longitude based on the user's current location
 *
 * @name Get the latitude and longitude
 * @params {Integer} ip - the public ip address
 * @returns {Object} the latitude and longitude based on the user's current location
 */
async function getLatLong(ip) {
	const settings = { method: 'Get' }

	const getData = await fetch(`http://ipwhois.app/json/${ip}?objects=latitude,longitude`, settings)
		.then(res => res.json())
		.then((json) => json)

	return getData
}

/**
 * The function will automatically provide the latitude and longitude using a postcode
 *
 * @name Get the latitude and longitude from a postcode
 * @params {String} postcode - the postcode of an issue
 * @returns {Object} information about the address (including long and lat)
 */
async function getLatAndLong(postcode) {
	const settings = { method: 'Get' }

	const getData = await fetch(`http://api.postcodes.io/postcodes/${postcode}`, settings)
		.then(res => res.json())
		.then((json) => json.result)

	return getData
}

/**
 * The function will calculate the distance between the user location and all issues and sort them (closest first)
 *
 * @name Closest issue
 * @params {Integer} lat1 - destination 1 latitude
 * @params {Integer} lon1 - destination 1 latitude
 * @params {Integer} lat2 - destination 2 latitude
 * @params {Integer} lon2 - destination 2 latitude
 * @returns {Array} sorted list of locations
 *
 * Reference https://en.wikipedia.org/wiki/Haversine_formula, http://www.movable-type.co.uk/scripts/latlong.html
 */
function getDistance(lat1,lon1,lat2,lon2) {
	const radius = 6371 // Radius of the earth in km
	const half = 2
	const hundred = 100
	const disLat = deg2rad(lat2-lat1) // deg2rad below
	const disLon = deg2rad(lon2-lon1)
	const a =
    Math.sin(disLat/half) * Math.sin(disLat/half) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(disLon/half) * Math.sin(disLon/half)

	const c = half * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	const distance = radius * c
	// returns the distance in km / rounded to second decimal place
	return Math.round((distance + Number.EPSILON) * hundred) / hundred
}

function deg2rad(deg) {
	const halfD = 180 //180 degree
	return deg * (Math.PI/halfD)
}

export default router
