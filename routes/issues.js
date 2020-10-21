
import Router from 'koa-router'
import mime from 'mime-types'
import fs from 'fs-extra'

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
    //get the image from the input
    const image = await getFile(ctx)
		// call the create function in the issue's module
		await issue.createIssue(ctx.request.body.title, ctx.request.body.location, ctx.request.body.description, ctx.request.body.status, image).then(() => {
      ctx.redirect('/')
    }).catch(err => ctx.hbs.msg = err.message)
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
  //get the issue id from the request params
	const {id} = ctx.params
	try {
		// call theget info function in the issue's module
		const issueInfo = await issue.getIssue(id)
    await ctx.render('issue', {issue: issueInfo})
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
    //change the status
    issueInfo.status = 'resolving'
    
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

export default router 
