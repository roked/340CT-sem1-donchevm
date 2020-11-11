/**
 * @name JsDocs server file
 * @description Contains the implementation of the JsDocs server.
 */
import Koa from 'koa'
import serve from 'koa-static'
import mount from 'koa-mount'

const app = new Koa()

app.use(mount('/', serve('docs/jsdoc')))

const defaultPort = 8080
const port = process.env.PORT || defaultPort

//run the server
app.listen(port, async() => console.log(`listening on port ${port}`))
