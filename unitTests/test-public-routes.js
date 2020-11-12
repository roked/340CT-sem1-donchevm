import test from 'ava'
import {
	getDistance,
	getLatAndLong,
	getLatLong,
	sortIssues
} from '../routes/public.js'

test('SORT BY DISTANCE : providing an array and ip address', async test => {
	// arrange
	test.plan(1)
	const issues = [{location: 'CV1 3ET'}, {location: 'CV1 5GD'}, {location: 'CV1 4AJ'}]
	const ip = '2a02:c7d:7614:2d00:f116:28f1:81f2:a877'
	const ctx = {header: {'x-forwarded-for': ip}}
	// act
	try {
		const result = await sortIssues(issues, ctx)
		const sortedArray = []
		for(const iter of result.keys()) {
			sortedArray.push(iter)
		}
		// assert
		test.deepEqual(sortedArray, [137.92, 138.13, 138.33], 'not able to sort the array')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('SORT BY DISTANCE : invalid inputs', async test => {
	// arrange
	test.plan(1)
	const issues = ['invalid']
	const ip = 'noIP'
	const ctx = {header: {'x-forwarded-for': ip}}
	// act
	try {
		await sortIssues(issues, ctx)
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Missing or invalid parameters', 'incorrect error message')
	}
})

test('SORT BY DISTANCE : missing inputs', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		await sortIssues()
		// assert
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'Missing or invalid parameters', 'incorrect error message')
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
			, 'not able to retrieve location')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('GET LAT LONG : using valid postcode', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const result = await getLatAndLong('CV1 3LD')
		// assert
		test.deepEqual(result.latitude + result.longitude, 50.887318, 'not able to retrieve location')
	} catch(err) {
		test.fail('error thrown')
	}
})

test('GET DISTANCE : get distance between two geo points in km', async test => {
	// arrange
	test.plan(1)
	// act
	try {
		const result = getDistance(51.5073509, 52.5073509, -0.1277583, -0.1277583)
		// assert
		test.deepEqual(result, 7551.75, 'not able to calculate distance')
	} catch(err) {
		test.fail('error thrown')
	}
})
