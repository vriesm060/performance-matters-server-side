// Require node modules:
var express = require('express');
var pug = require('pug');
var app = express();

// Require dotenv:
require('dotenv').config({ path: './vars.env' });

// Require local modules:
var routes = require('./routes');

app.use(express.static('public'));
app.set('view engine', 'pug');

// Use routes:
app.use('/', routes);

app.listen(process.env.PORT);
