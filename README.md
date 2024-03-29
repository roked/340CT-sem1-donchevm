[![Build Status](https://travis-ci.com/roked/340CT-sem1-donchevm.svg?token=nmV8psp4V6ME72ugk3q1&branch=master)](https://travis-ci.com/roked/340CT-sem1-donchevm)

# Warning! The website will work only for the UK residents with an UK IP address. API limitation.

# Local Community Project - 340CT Assessment project
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

 * during dev: update jsDocs ```sudo ./node_modules/jsdoc/jsdoc.js -c jsdoc.conf```

# Testing

#### Two tests are available:
   1. You can run linter - ```npm run linter```
   2. And unit testing with ava - ```npm test```

  N.B - There won't be any errors. That's for sure.

# Available routes

  * Home - route: "/" (retrieves and displays all issues)
  * Register - route: "/register"
  * Login - route: "/login"
  * New Issue - route: "/new"
  * Selected Issue - route: "/:id"

## Heroku live server release

- https://donchevm-sem1.herokuapp.com/
