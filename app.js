// Require Node modules:
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var pug = require('pug');
var app = express();

var express = require('express');
var router = express.Router();

var storage = require('./data/storage.js');
var sparql = require('./data/queries.js');
var parseMultiLineString = require('./data/parseMultiLineString.js');

// Require .env files:
require('dotenv').config({ path: './vars.env' });

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

// Render the homepage:
router.get('/', function (req, res) {
	// Empty allStreets data:
	storage.allStreets.splice(0, storage.allStreets.length);

	request(sparql.streetsQuery(), function (err, response, body) {
		var data = JSON.parse(body);
		var rows = data.results.bindings;

		// Map the streets data:
		var streets = rows.map(function (row) {
			var link = row.street.value;
			var slug = link.slice((link.indexOf('street/') + 7), link.lastIndexOf('/'));
			var id = link.slice(link.lastIndexOf('/') + 1);

			return {
				'type': 'Feature',
				'properties': {
					'streetName': row.name.value,
					'link': link,
					'slug': slug,
					'id': id
				},
				'geometry': parseMultiLineString(row.wkt.value)
			};
		});

		// Add new streets data:
		storage.allStreets = streets;

		res.render('index', {
			streets: JSON.stringify(storage.allStreets),
			search: storage.searchResults,
			details: JSON.stringify(storage.streetDetailsCopy),
			images: JSON.stringify(storage.images)
		});

		// Empty the searchResults:
		storage.searchResults.splice(0, storage.searchResults.length);

		// Empty the current street details:
		if (storage.streetDetailsCopy.length) {
			storage.streetDetailsCopy.splice(0, storage.streetDetailsCopy.length);
		}

		// Empty the images array:
		storage.images.splice(0, storage.images.length);
	});
});

// Get the search results and give them back to the homepage:
router.get('/search', function (req, res) {
	console.log(req.query);
  var key = Object.keys(req.query)[0];
	var val = req.query[key];

	var results = storage.allStreets.filter(function (street) {
		if (street.properties.streetName.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
			return street;
		}
	});

	storage.searchResults = results;

	res.redirect('/');
});

// Get street details:
router.get('/details/:slug/:id', function (req, res) {
	request(sparql.streetDetailsQuery(req.params.slug, req.params.id), function (err, response, body) {
		var data = JSON.parse(body);
		var rows = data.results.bindings;

		// Map all the years from the data:
		var allYears = rows.map(function (item) {
			return item['callret-2'].value;
		});

		// Get rid of all the duplicate years:
		var noDuplicates = allYears.filter(function (year, i, self) {
			if (self.indexOf(year) == i) {
				return year;
			}
		});

		// Map the unique years into a new object, with room for the images:
		var years = noDuplicates.map(function (item) {
			return {
				'year': item,
				'images': []
			};
		});

		// Add all the images that corresponds with the given year:
		rows.forEach(function (item) {
			var idx = years.map(function (obj) {
				return obj.year;
			}).indexOf(item['callret-2'].value);

			years[idx].images.push(item.img);
		});

		// Calculate the distance every year in details should go on the timeline:
		var yearsInBetween = Number(years[years.length - 1].year) - Number(years[0].year) + 1;
	  var yearWidth = 100 / yearsInBetween;

		years.forEach(function (item) {
			item.left = ((Number(item.year) - Number(years[0].year)) * yearWidth);
	  });

		storage.streetDetails = years;
		storage.streetDetailsCopy = storage.streetDetails.slice();

		res.redirect('/');
	});
});

// Server side rendering of images per year when no JS is available:
router.get('/images/:year', function (req, res) {
	var img = storage.streetDetails.filter(function (item) {
		if (item.year === req.params.year) {
			return item;
		}
	});

	storage.images = img[0].images;
	storage.streetDetailsCopy = storage.streetDetails.slice();

	res.redirect('/');
});

app.listen(process.env.PORT);
