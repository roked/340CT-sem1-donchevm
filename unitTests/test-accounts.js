import test from 'ava'
import Accounts from '../modules/accounts.js'

test('REGISTER : register and log in with a valid account', async test => {
	// arrange
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
	// act
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
	  const login = await account.login('donchevm', 'password')
		// assert
		test.is(login, true, 'unable to log in')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER : register and log in with council worker account', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk', 1)
		const login = await account.login('donchevm', 'password')
		test.is(login, true, 'unable to log in')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER : register a duplicate username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "donchevm" already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('', 'password', 'donchevm@coventry.uk')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', '', 'donchevm@coventry.uk')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', '')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if duplicate email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		await account.register('mitko', 'newpassword', 'donchevm@coventry.uk')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'email address "donchevm@coventry.uk" is already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN : invalid username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		await account.login('mitko', 'password')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "mitko" not found', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN : invalid password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		await account.login('donchevm', 'bad')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'invalid password for account "donchevm"', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('WORKER : valid worker account', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk', 1)
		const isWorker = await account.isWorker('donchevm', 'password')
		test.is(isWorker.worker, 1, 'not a worker')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('WORKER : invalid worker account', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		const isWorker = await account.isWorker('donchevm', 'password')
		test.is(isWorker.worker, 'undefined', 'is worker')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('DELETE : clear the database', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register('donchevm', 'password', 'donchevm@coventry.uk')
		const isClear = await account.delleteAll()
		test.truthy(isClear)
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})
