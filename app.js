
var express = require('express')
var app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')

// app.use(function (req, res, next) {
// 	console.log('LOGGED')
// 	next()
// })

app.get('/', function (req, res) {
	res.render('index', {
		title: 'OBA App Server Side',
		h1: 'Hello World!'
	})
})

app.listen(3000)