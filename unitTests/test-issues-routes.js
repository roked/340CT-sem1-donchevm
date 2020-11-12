import test from 'ava'
import {
	getFile,
	checkOwner,
	getStatus,
	getAddress,
	getLatLong
} from '../routes/issues.js'
import Issues from '../modules/issues.js'

test('SAVE IMAGE : valid image', async test => {
	// arrange
	test.plan(1)
	const path = 'public/uploads/default.png'
	const name = 'default-test.png'
	// act
	try {
		const fileName = await getFile({size: 1, path: path, name: name})
		// assert
		test.is(fileName, 'default-test.png', 'file is not saved')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('SAVE IMAGE : image missing', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const fileName = await getFile()
		// assert
		test.is(fileName, 'default.png', 'file is not saved')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('SAVE IMAGE : image not selected', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const fileName = await getFile({size: 0})
		// assert
		test.is(fileName, 'default.png', 'file is not saved')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('CHECK OWNER : the owner of the issue', async test => {
	// arrange
	test.plan(1)
	const issue = await new Issues()
	const user = 'donchevm'
	// act
	try {
		await issue.createIssue({title: 'Test Issue', loc: 'CV1 3ET', des: 'This is a test.',
			status: 'New', img: 'test.png', author: 'donchevm'})
		const issues = await issue.getAllIssues()
		const testIssue = issues[0]
		const result = await checkOwner(user, testIssue)
		// assert
		test.truthy(result)
	} catch(err) {
		test.fail('error thrown')
	}
})

test('CHECK OWNER : not the owner of the issue', async test => {
	// arrange
	test.plan(1)
	const issue = await new Issues()
	const user = 'mitko'
	// act
	try {
		await issue.createIssue({title: 'Test Issue', loc: 'CV1 3ET', des: 'This is a test.',
			status: 'New', img: 'test.png', author: 'donchevm'})
		const issues = await issue.getAllIssues()
		const testIssue = issues[0]
		const result = checkOwner(user, testIssue)
		// assert
		test.falsy(result)
	} catch(err) {
		test.fail('error thrown')
	}
})

test('CHECK OWNER : missing params', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		checkOwner()
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Missing or invalid parameter', 'incorrect error message')
	}
})

test('CHECK OWNER : invalid params', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		checkOwner(1234, 'wrong')
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Missing or invalid parameter', 'incorrect error message')
	}
})

//N.B. - there is a monthly limit of the API for requests
test('GET LAT LONG : valid ip address', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const result = await getLatLong('2a02:c7d:7614:2d00:f116:28f1:81f2:a877')
		// assert
		test.deepEqual(result, { latitude: '51.5073509', longitude: '-0.1277583',}
			, 'not able to retrieve address')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('GET ADDRESS : valid latitude and longitude', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const result = await getAddress(52.406822, -1.519693)
		// assert
		test.is(result, 'CV1 3LD', 'not able to retrieve address')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('GET STATUS : get statuses of an issue ', async test => {
	// arrange
	test.plan(1)
	const issue = await new Issues()
	// act
	try {
		await issue.createIssue({title: 'Test Issue', loc: 'CV1 3ET', des: 'This is a test.',
			status: 'New', img: 'test.png', author: 'donchevm'})
		const issues = await issue.getAllIssues()
		const finailIssue = issues[0]
		const status = getStatus(finailIssue)
		// assert
		test.not(status, null, 'statuses not available')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('GET STATUS : missing issue ', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		getStatus()
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'No issue provided', 'incorrect error message')
	}
})

test('GET STATUS : invalid input ', async test => {
	// arrange
	test.plan(1)
	await new Issues()
	// act
	try {
		getStatus('invalid')
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'No issue provided', 'incorrect error message')
	}
})
