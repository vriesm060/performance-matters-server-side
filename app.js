// Require Node modules:
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var pug = require('pug');
var app = express();

// Require .env files:
require('dotenv').config({ path: './vars.env' });

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

// Require the routes:
var routes = require('./routes');

app.use('/', routes);

app.listen(process.env.PORT);
