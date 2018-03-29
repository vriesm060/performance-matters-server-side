# OBA App Server Side

## Running the server
In order to run the server locally, I did the following things:

* Created a new directory for the server side app
* Created a new `package.json` file with the endpoint `app.js`
* Installed [Express JS](https://expressjs.com/) through NPM and saved it in the dependencies list
* Installed nodemon NPM script in order to update the server each time a file is saved
* Installed [EJS](http://ejs.co/) through NPM and saved it in the dependencies list
* Added the following code to the `app.js` file, in order to run the server:
```
var express = require('express')
var app = express()

app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.listen(3000)
```

## Build it yourself
`git clone`, run `npm install` and `npm build` to build the site.
Run `npm start` to start the server on port 3000.

## Get data

* Installed request through NPM and saved it in the dependencies list