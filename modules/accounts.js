/**
  * @name Account module
  * @module database/accounts
  * @description Contains the implementation of the accounts DB and methods to work with the DB.
  * @author Mitko Donchev
*/
import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

const saltRounds = 10

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Accounts {

	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			//we need this table to store the user accounts
			//worker = if the user is identified as council worker 0(false), 1(true)
			const sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT, worker INTEGER DEFAULT 0);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Registers a new user
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @param {Integer} worker if user is from council or not
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async register(user, pass, email, worker) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`username "${user}" already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.records !== 0) throw new Error(`email address "${email}" is already in use`)
		pass = await bcrypt.hash(pass, saltRounds)
		sql = `INSERT INTO users(user, pass, email, worker) VALUES("${user}", "${pass}", "${email}", "${worker}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * Checks to see if a set of login credentials are valid
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
	 */
	async login(username, password) {
		let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)
		sql = `SELECT pass FROM users WHERE user = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.pass)
		if(valid === false) throw new Error(`invalid password for account "${username}"`)
		return true
	}

	/**
	 * Checks if the user is a worker or a resident
	 * @param {String} username the username to check
	 * @returns {Integer} returns 0 if false and 1 if true
	 */
	async isWorker(username) {
		const sql = `SELECT worker FROM users WHERE user="${username}";`
		const records = await this.db.get(sql)
		if(!records) throw new Error(`something went wrong with user "${username}"`)
		return records
	}

	/**
	 * Clear the DB after tasting or if corrupted
	 * @returns {Boolean} true if the db is clear
	 */
	async delleteAll() {
		const sql = 'DROP TABLE users;'
		const record = await this.db.run(sql)
		if(record) throw new Error('Something went wrong!')
		return true
	}

	/**
	 * Close the database
	 */
	async close() {
		await this.db.close()
	}
}

/**
* Export the accounts class
*/
export default Accounts
