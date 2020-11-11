/**
 * @module router/issues
 * @description Contains the implementation all routes related to issues.
 * @author Mitko Donchev
 */
import Router from 'koa-router'
import fs from 'fs-extra'
import fetch from 'node-fetch'

import Issues from '../modules/issues.js'

const router = new Router({prefix: '/issue'})
const dbName = 'website.db'

/**
 * This middleware will check if the user is authenticated.
 *
 * @name User authentication
 * @params {Object} ctx context
 */
async function checkAuth(ctx, next) {
  //check if the user is authenticated
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login')
	await next()
}

router.use(checkAuth)

/**
 * The add new issue page.
 *
 * @name Add new issue
 * @route {GET} /
 */
router.get('/new', async ctx => {
	try {
		await userLocation(ctx)
		await ctx.render('new', ctx.hbs)
	} catch (err) {
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to post new issue and add it to the DB.
 *
 * @name Issue Script
 * @route {POST} /issue/new
 */
router.post('/new', async ctx => {
	const issue = await new Issues(dbName) //connect with the DB
	try {
		const {user} = ctx.session //get the author's name
		const image = await getFile(ctx) //get the image from the input
		//get the address based on the user's current location.
		const address = await userLocation(ctx)
		const {title, description, status} = ctx.request.body //get all values
		//create an issue object and store everything inside
		const issueObject = {title: title, loc: address, des: description, status: status, img: image, author: user}
		// call the create function in the issue's module
		await issue.createIssue(issueObject).then(() => {
			ctx.redirect('/')
		}).catch(err => {
			console.log(err)
			ctx.render('new', ctx.hbs)
		})
	} catch (err) {
		await ctx.render('new', ctx.hbs)
	} finally {
		issue.close()
	}
})

/**
 * The script to get an issue using it's ID.
 *
 * @name Show Issue Info Script
 * @route {GET} /issue/:id
 */
router.get('/:id', async ctx => {
	const issue = await new Issues(dbName) 	//connect with the DB
	const {user} = ctx.session 	//get the author's name
	//get the issue id from the request params
	const {id} = ctx.params
	//check if the user is a council worker (return true or false)
	const {isWorker} = ctx.session
	try {
		//call the get info function in the issue's module
		const issueInfo = await issue.getIssue(id)
		const isOwner = await checkOwner(user, issueInfo) //check the owner
		//check status (returns a map)
		const allStatus = getStatus(issueInfo)
		await ctx.render('issue', {
			issue: issueInfo, author: isOwner, resolving: allStatus.get('resolving'),
			resolved: allStatus.get('resolved'), verified: allStatus.get('verified'),
			isResolvedByC: allStatus.get('resolved by the council'), worker: isWorker
		})
	} catch (err) {
		await ctx.redirect('/')
	} finally {
		issue.close()
	}
})

/**
 * The script to update an issue.
 *
 * @name Update Issue Info Script
 * @route {PUT} /issue/:id
 */
router.put('/:id', async ctx => {
	//connect with the DB
	const issue = await new Issues(dbName)
	//get the issue id from the request params
	const {id} = ctx.params
	//get the status from body if there is one
	const {status} = ctx.request.body
	try {
		// call the get issue function in the issue's module
		const issueInfo = await issue.getIssue(id)
		//change the status (if it was status resolving change to resolved)
		issueInfo.status = status === 'resolved by the council' ? 'resolved by the council' : status === 'verified'
			? 'verified' : issueInfo.status === 'resolving' ? 'resolved' : 'resolving'
		// call the update issue function in the issue's module
		await issue.updateIssue(issueInfo).then(() => {
			ctx.redirect('/')
		}).catch(err => ctx.hbs.msg = err.message)
	} catch (err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('index', ctx.hbs)
	} finally {
		issue.close()
	}
})

/**
 * The function to get the file from the frontend and store it.
 *
 * @name Get file function
 * @params {Object} ctx context
 * @returns {String} the name of the file which will be stored in the DB and used as reference
 */
async function getFile(ctx) {
	const image = ctx.request.files.image
	if (image.size === 0) return 'default.png'
	try {
		await fs.copy(image.path, `public/uploads/${image.name}`)
		return image.name
	} catch (err) {
		console.log(err.message)
	}
}

/**
 * The function to check the owner of the issue.
 *
 * @name Check owner function
 * @params {String} user user who checks the issue
 * @params {Object} issue the issue info
 * @returns {Boolean} true if the owner match
 */
async function checkOwner(user, issue) {
	return user === issue.author
}

/**
 * The function will automatically select the location of the issue based on the user's current location
 *
 * @name Select the correct location
 * @params {Object} ctx context
 * @returns {String} the location based on the user's current location
 */
async function userLocation(ctx) {
	try {
		//get the client ip address from request header
		const key = 'x-forwarded-for'
		const ip = ctx.header[key]
		//get the user lat and long
		const latLong = await getLatLong(ip)
		//get a readable address
		return await getAddress(latLong.latitude, latLong.longitude)
	} catch (err) {
		console.log(err.message)
	}
}

/**
 * The function will automatically get the latitude and longitude based on the user's current location
 *
 * @name Get the latitude and longitude
 * @params {Integer} ip the public ip address
 * @returns {Object} the latitude and longitude based on the user's current location
 */
async function getLatLong(ip) {
	const settings = {method: 'Get'}
	//fetch the data from the api and return the result
	return await fetch(`http://ipwhois.app/json/${ip}?objects=latitude,longitude`, settings)
		.then(res => res.json())
		.then((json) => json)
}

/**
 * The function will automatically retireve the postcode using latitude and longitude
 *
 * @name Get the postcode
 * @params {Integer} lat the latitude
 * @params {Integer} long the longitude
 * @returns {Object} information about the address (postcode)
 */
async function getAddress(lat, long) {
	const settings = {method: 'Get'} //method 'get'
	//fetch the data from the api and return the result
	return await fetch(`http://api.postcodes.io/postcodes?lon=${long}&lat=${lat}`, settings)
		.then(res => res.json())
		.then((json) => json.result[0].postcode)
}

/**
 * The function will get the actual status
 *
 * @name Get the status
 * @params {Object} issue - the issue info
 * @returns {Object} map of activated (and skiped) statuses
 */
function getStatus(issue) {
	const allStatus = ['resolving', 'resolved', 'verified', 'resolved by the council']
	const statuses = new Map() // create a map to store the statuses

	for (let i = 0; i < allStatus.length; i++) {
		statuses.set(allStatus[i], issue.status === allStatus[i])
	}
	return statuses //return the satus map
}

export default router
