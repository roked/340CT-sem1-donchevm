import test from 'ava'
import Issues from '../modules/issues.js'

test('CREATE : create a valid issue', async test => {
  // arrange
	test.plan(1)
	const issue = await new Issues()
  // act
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
	  const issues = await issue.getAllIssues()
    // assert
		test.is(issues.length, 1, 'fail to create new issue')
	} catch(err) {
    console.log(err)
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('CREATE : create a duplicate issue', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
    await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Title "Test Issue" already in use', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank title', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank location', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank description', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "",
                    status: "New", img: "test.png", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank status', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "", img: "test.png", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank img name', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "", author: "donchevm"})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : error if blank author', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: ""})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing info', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('CREATE : wrong input will not crash', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: true, loc: "CV1 3ET", des: false,
                    status: "New", img: "test.png", author: "donchevm"})
	  const issues = await issue.getAllIssues()
		test.is(issues.length, 1, 'fail to create new issue')
	} catch(err) {
    console.log(err)
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('GET INFO : valid issue', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
	  const issues = await issue.getAllIssues()
    const issueID = issues[0].id
    const getIssue = await issue.getIssue(issueID)
		test.not(getIssue, null, 'unable to get issue with this id')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('GET INFO : invalid issue id', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.getIssue("invalid123")
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'not existing information for issue with ID: "invalid123"', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('GET ALL : no existing issues', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.getAllIssues()
    test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'not existing issues yet', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('GET ALL : multi issues', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
    await issue.createIssue({title: "Test Issue 1", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
    await issue.createIssue({title: "Test Issue 2", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
		const issues = await issue.getAllIssues()
		test.is(issues.length, 2, 'fail to get all issues')
	} catch(err) {
    console.log(err)
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('UPDATE : update issue', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
	  const issues = await issue.getAllIssues()
    const issueID = issues[0].id
    const updatedIssue = await issue.updateIssue({status: "verified", id: `${issueID}`})
		test.is(updatedIssue, true, 'unable to update issue')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('UPDATE : update issue and check status', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
		await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
	  const issues = await issue.getAllIssues()
    const issueID = issues[0].id
    await issue.updateIssue({status: "resolving", id: `${issueID}`})
    const getIssue = await issue.getIssue(issueID)
		test.is(getIssue.status, "resolving", 'status not changed')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})

test('UPDATE : missing id', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
    await issue.updateIssue({status: "resolving", id: ""})
    test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, "missing info id", 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('UPDATE : wrong issue id', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
    await issue.updateIssue({status: "resolving", id: "wrongId"})
    test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'cannot update the information for issue with ID: "wrongId"', 'incorrect error message')
	} finally {
		issue.close()
	}
})

test('DELETE : clear the database', async test => {
	test.plan(1)
	const issue = await new Issues()
	try {
    await issue.createIssue({title: "Test Issue", loc: "CV1 3ET", des: "This is a test.",
                    status: "New", img: "test.png", author: "donchevm"})
    const issues = await issue.getAllIssues()
    const isClear = await issue.delleteAll()
    test.truthy(isClear)
	} catch(err) {
		test.fail('error thrown')
	} finally {
		issue.close()
	}
})
