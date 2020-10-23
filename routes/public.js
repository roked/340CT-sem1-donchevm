
import Router from 'koa-router'
import fetch from 'node-fetch'

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
    
    //sort the issues (closest first)
    await sortIssues(issues, ctx)
    
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


async function sortIssues(issues, ctx) {
  try{
    //get the location of the user
    const userLoc = await userLocation(ctx)

    let sortedIssues = issues
    let distances = []

    for(const issue of issues){
      const latLon = await getLatAndLong(issue.location)
      const distance = getDistance(userLoc.latitude,userLoc.longitude,latLon.latitude,latLon.longitude) 
      distances.push(distance)
    }

    console.log(distances)
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
  const settings = { method: "Get" }
  
  let getData = await fetch(`http://ipwhois.app/json/${ip}?objects=latitude,longitude`, settings)
    .then(res => res.json())
    .then((json) => {
        return json
    })
  
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
  const settings = { method: "Get" }
  
  let getData = await fetch(`http://api.postcodes.io/postcodes/${postcode}`, settings)
    .then(res => res.json())
    .then((json) => {
        return json.result
    })
  
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
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d; // returns the distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export default router
