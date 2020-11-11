/**
  * @name Issues module
  * @module database/issues
  * @description Contains the implementation of the issues DB and methods to work with the DB.
  * @author Mitko Donchev
*/
import sqlite from 'sqlite-async'

/**
 * Issues
 * ES6 module that handles creating issues and modifying them.
 */
class Issues {

	/**
   * Create an issue object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the issues
			const sql = 'CREATE TABLE IF NOT EXISTS issues\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, \
         location TEXT NOT NULL, des TEXT NOT NULL, status TEXT NOT NULL, \
         img TEXT, author TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, \
         updated_at TEXT DEFAULT CURRENT_TIMESTAMP);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Create a new issue
	 * @param {Object} issue - the info about the issue
	 * @returns {Boolean} returns true if the new issue has been added
	 */
	async createIssue(issue) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing info')
		})
		let sql = `SELECT COUNT(id) as records FROM issues WHERE title="${issue.title}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`Title "${issue.title}" already in use`)
		sql = `INSERT INTO issues(title, location, des, status, img, author) 
            VALUES("${issue.title}", "${issue.loc}", "${issue.des}", 
                    "${issue.status}", "${issue.img}", "${issue.author}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * Pull all issues from the DB
	 * @returns {Object} returns all issues
	 */
	async getAllIssues() {
		const sql = 'SELECT * FROM issues;'
		const record = await this.db.all(sql)
		if(!record) throw new Error('not existing issues yet')
		return record
	}

	/**
	 * Pull the issue information from the DB
	 * @param {Integer} id the unique id of the issue
	 * @returns {Object} returns the issue
	 */
	async getIssue(id) {
		const sql = `SELECT * FROM issues WHERE id="${id}";`
		const record = await this.db.get(sql)
		if(!record) throw new Error(`not existing information for issue with ID: "${id}"`)
		return record
	}

	/**
	 * Update issue's information
	 * @param {Object} issue the issue object which contains the updated information
	 * @returns {Boolean} returns true if everything is fine
	 */
	async updateIssue(issue) {
		const sql = `UPDATE issues SET status="${issue.status}" WHERE id="${issue.id}";`
		const record = await this.db.run(sql)
		if(!record) throw new Error(`not existing information for issue with ID: "${issue.id}"`)
		return true
	}

	/**
	 * Clear the DB after tasting or if corrupted
	 * @returns {Boolean} true if the db is clear
	 */
	async delleteAll() {
		const sql = 'DROP TABLE issues;'
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
* Export the issues class
*/
export default Issues
