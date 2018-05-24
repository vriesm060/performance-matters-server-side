
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var pug = require('pug');
var app = express();

require('dotenv').config({ path: './vars.env' });

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

// Sparql object with all queries and query url:
var sparql = {
	encodedQuery: function (query) { return encodeURIComponent(query); },
	queryUrl: function (query) {
		return `
			https://api.data.adamlink.nl/datasets/AdamNet/all/services/hva2018/sparql?default-graph-uri=&query=
			${this.encodedQuery(query)}
			&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on
		`;
	},
	streetsQuery: function () {
		var query = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX hg: <http://rdf.histograph.io/>
			PREFIX geo: <http://www.opengis.net/ont/geosparql#>
			PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

			SELECT ?street ?name ?wkt WHERE {
			  ?street a hg:Street .
			  ?street rdfs:label ?name .
			  ?street geo:hasGeometry ?geo .
			  ?geo geo:asWKT ?wkt .
			}
			LIMIT 10
		`;

		return this.queryUrl(query);
	},
	streetDetailsQuery: function (slug, id) {
		var query = `
			PREFIX dct: <http://purl.org/dc/terms/>
			PREFIX foaf: <http://xmlns.com/foaf/0.1/>
			PREFIX dc: <http://purl.org/dc/elements/1.1/>
			PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>

			SELECT ?item ?img YEAR(?date) WHERE {
			  ?item dct:spatial <https://adamlink.nl/geo/street/${slug}/${id}> .
			  ?item foaf:depiction ?img .
			  ?item dc:type "foto"^^xsd:string.
			  ?item sem:hasBeginTimeStamp ?date .
			}
			ORDER BY ?date
		`;

		return this.queryUrl(query);
	}
};

// Parse the multiline string geometry into a readable array for Leaflet JS:
function parseMultiLineString(str) {
	str = str.replace('MULTILINESTRING((', '');
	str = str.replace('LINESTRING(', '');
	str = str.replace(')', '');
	var pointsAsString = str.split(',');

	var points = pointsAsString.map(function (d) {
		return d.split(' ');
	});

	return points;
}

// Local data storage:
var streetsData = [];

// Search results:
var searchResults = [];

// Street detail for current street:
var streetDetails = [];

// Images for current year:
var images = [];

// Render the homepage:
app.get('/', function (req, res) {

	// Empty the streetsData:
	streetsData.splice(0, streetsData.length);

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

		streetsData = streets;

		res.render('index', {
			streets: JSON.stringify(streetsData),
			search: searchResults,
			details: JSON.stringify(streetDetails)
		});

		// Empty the searchResults:
		searchResults.splice(0, searchResults.length);

		// Empty the current street details:
		streetDetails.splice(0, streetDetails.length);
		// if (!images.length) {
		// 	streetDetails.splice(0, streetDetails.length);
		// }

	});
});

// Get the search results and give them back to the homepage:
app.get('/search', function (req, res) {
	var key = Object.keys(req.query)[0];
	var val = req.query[key];

	var results = streetsData.filter(function (street) {
		if (street.properties.streetName.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
			return street;
		}
	});

	searchResults = results;

	res.redirect('/');
});

app.get('/details/:slug/:id', function (req, res) {
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

		streetDetails = years;

		res.redirect('/');
	});
});

// Server side rendering of images per year when no JS is available:
app.get('/images/:year', function (req, res) {
	console.log('year:', req.params.year);

	res.redirect('/');
});

app.listen(process.env.PORT);
