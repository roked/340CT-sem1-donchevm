import Router from 'koa-router'
import mime from 'mime-types'
import fs from 'fs-extra'
import fetch from 'node-fetch'

import Issues from '../modules/issues.js'

const router = new Router({ prefix: '/issue' })
const dbName = 'website.db'

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
	} catch(err) {
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
  //connect with the DB
	const issue = await new Issues(dbName)
	try {
    //get the author's name
    const {user} = ctx.session
    //get the image from the input
    const image = await getFile(ctx)
    //get the address based on the user's current location.
    const address = await userLocation(ctx)
    //get all values from the body
    const {title, description, status} = ctx.request.body

		// call the create function in the issue's module
		await issue.createIssue(title, address, description, status, image, user).then(() => {
      ctx.redirect('/')
    }).catch(err => {
      ctx.hbs.msg = err.message 
      console.log(err)
      ctx.render('new', ctx.hbs)
    })
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
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
  //connect with the DB
  const issue = await new Issues(dbName)
  //get the author's name
  const {user} = ctx.session
  //get the issue id from the request params
	const {id} = ctx.params
	try {
		// call theget info function in the issue's module
		const issueInfo = await issue.getIssue(id)
    //check the owner
    const isOwner = await checkOwner(user, issueInfo)
    //check status
    const isResolving = (issueInfo.status === 'resolving') ? true : false
    const isResolved = (issueInfo.status === 'resolved') ? true : false
    const isVerified = (issueInfo.status === 'verified') ? true : false
    await ctx.render('issue', {issue: issueInfo, author: isOwner, resolving: isResolving, resolved: isResolved, verified: isVerified})
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
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
    //change the status (if it was status resolving - change to resolved)
    issueInfo.status = (status === 'verified') ? 'verified' : (issueInfo.status === 'resolving') ? 'resolved' : 'resolving'   
    // call the updaet issue function in the issue's module
		await issue.updateIssue(issueInfo).then(() => {
      ctx.redirect('/')
    }).catch(err => ctx.hbs.msg = err.message)
	} catch(err) {
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
 * @params {Object} ctx - context 
 * @returns {String} the name of the file which will be stored in the DB and used as reference
 */
async function getFile(ctx){
  const image = ctx.request.files.image
  if(image.size === 0) return 'default.png'
  try {
    await fs.copy(image.path, `public/uploads/${image.name}`)
    return image.name
  } catch(err) {
    console.log(err.message)
  } 
}
  
/**
 * The function to check the owner of the issue.
 *
 * @name Check owner function
 * @params {String} user - user who checks the issue
 * @params {Object} issue - the issue
 * @returns {Boolean} true if the owner match
 */
async function checkOwner(user, issue){
  return (user === issue.author) ? true : false
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

    //get a readable address 
    const address = await getAddress(latLong.latitude, latLong.longitude)
    
    return address
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
 * The function will automatically provide a postcode the latitude and longitude
 *
 * @name Get the postcode
 * @params {Integer} lat - the latitude
 * @params {Integer} long - the longitude
 * @returns {Object} information about the address (postcode)
 */
async function getAddress(lat, long) { 
  const settings = { method: "Get" }
  
  let getData = await fetch(`http://api.postcodes.io/postcodes?lon=${long}&lat=${lat}`, settings)
    .then(res => res.json())
    .then((json) => {
        return json.result[0].postcode
    })
  
  return getData
}

export default router 
