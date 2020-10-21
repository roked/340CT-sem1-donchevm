
import Router from 'koa-router'
import mime from 'mime-types'
import fs from 'fs-extra'
import regex from 'regex'

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
    //check if the postcode is valid
    const isValid = await validPostcode(ctx.request.body.location)
    if(!isValid) throw Error('Not vallid postcode!')
		// call the create function in the issue's module
		await issue.createIssue(ctx.request.body.title, ctx.request.body.location, ctx.request.body.description, ctx.request.body.status, image, user).then(() => {
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
    await ctx.render('issue', {issue: issueInfo, author: isOwner, resolving: isResolving, resolved: isResolved})
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
	try {
		// call the get issue function in the issue's module
		const issueInfo = await issue.getIssue(id)
    //change the status (if it was status resolving - change to resolved)
    issueInfo.status = (issueInfo.status === 'resolving') ? 'resolved' : 'resolving'   
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
 * The function to check if the postcode is valid.
 *
 * @name Check passcode validity
 * @params {String} postcode - the postcode string
 * @returns {Boolean} true if the posctode is valid
 */
async function validPostcode(postcode) {
  //remove the empty spaces
  postcode = postcode.replace(/\s/g, "");
  //this is an expression used for the purpose of validation
  var regex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} ?[0-9][A-Z]{2}$/i;
  //using regex to compare the postcode with the expression
  return regex.test(postcode);
}

export default router 
