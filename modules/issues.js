
import sqlite from 'sqlite-async'

class Issues {

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the issues
			const sql = 'CREATE TABLE IF NOT EXISTS issues\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, location TEXT NOT NULL, des TEXT NOT NULL, status TEXT NOT NULL, img TEXT, author TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * create a new issue
	 * @param {String} title the chosen brief title
	 * @param {String} loc the chosen location (provided as a valid postcode).
	 * @param {String} stat the chosen status
	 * @param {String} des the chosen detailed formatted description.
	 * @param {String} img the chosen optional image - the name of the file which will be pulled from the server storage.
	 * @param {String} author - the name of the author of the issue
	 * @returns {Boolean} returns true if the new issue has been added
	 */
	async createIssue(title, loc, des, stat, img, author) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM issues WHERE title="${title}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`Title "${title}" already in use`)
		sql = `INSERT INTO issues(title, location, des, status, img, author) VALUES("${title}", "${loc}", "${des}", "${stat}", "${img}", "${author}")`
		await this.db.run(sql)
		return true
	}

  /**
	 * pull all issue from the DB
	 * @returns {Boolean} returns all issues
	 */
	async getAllIssues() {
		let sql = `SELECT * FROM issues;`
		const record = await this.db.all(sql)
		if(!record) throw new Error(`not existing issues yet`)
		return record
	}
    
	/**
	 * pull the issue information from the DB
	 * @param {Integer} id the unique id of the issue
	 * @returns {Object} returns the information
	 */
	async getIssue(id) {
		let sql = `SELECT * FROM issues WHERE id="${id}";`
		const record = await this.db.get(sql)
		if(!record) throw new Error(`not existing information for issue with ID: "${id}"`)
		return record
	}
  
   /**
	 * update the issue information
	 * @param {Object} issue the issue object which contains the updated information
	 * @returns {Boolean} returns true if everything is fine
	 */
	async updateIssue(issue) {
		let sql = `UPDATE issues SET status="${issue.status}" WHERE id="${issue.id}";`
		const record = await this.db.run(sql)
		if(!record) throw new Error(`not existing information for issue with ID: "${id}"`)
		return true
	}
  
  /**
	 * clear the DB after tasting
	 * @returns {Boolean} true if the db is clear
	 */
	async delleteAll() {
		let sql = `DROP TABLE issues;`
		const record = await this.db.run(sql)
		if(record) throw new Error(`Something went wrong!`)
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Issues
