# Local Community Project - 340CT Assessme
#### - Author: Mitko Donchev
#### - SID: 7683343

# Steps to run the project

1. Run ```npm i``` to get the latest npm modules
2. Make sure the node version is grater then ```v12.18.4``` - version used during dev ```v14.11.0```
3. Make sure you have all rights to read/write on all files and dir - in case of an issue run ```ls -l``` and check the user and group owner

## Finally run ```npm start```
 * website available on ```{server}:{port}```
#### Important
* The default port is ```8080``` (this can be changed in ```index.js```)

# JsDocs

 - JsDocs are available after running ```node docs.js```
 - After that visit the docs on ```{server}:{port}(Default: 8080)```

 * during dev: update jsDocs ```sudo ./node_modules/jsdoc/jsdoc.js -c jsdoc.conf.json```

# Available routes

  * Home - route: "/" (retrieves and displays all issues)
  * Register - route: "/register"
  * Login - route: "/login"
  * New Issue - route: "/new"
  * Selected Issue - route: "/:id"

## Heroku live server release

- https://donchevm-sem1.herokuapp.com/
