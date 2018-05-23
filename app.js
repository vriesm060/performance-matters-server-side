
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var pug = require('pug');
var app = express();

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

// Render the homepage:
app.get('/', function (req, res) {

	var streets = [];

	request(sparql.streetsQuery(), function (err, response, body) {
		var data = JSON.parse(body);
		var rows = data.results.bindings;

		streets = rows.map(function (row) {
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

		res.render('index', {
			streets: JSON.stringify(streets)
		});
	});

});

// Render the search page with search results:
app.get('/search', function (req, res) {

	var key = Object.keys(req.query)[0];
	var val = req.query[key];

	request(sparql.streetsQuery(), function (err, response, body) {
		var data = JSON.parse(body);
		var rows = data.results.bindings;

		// Filter the data to find every street which name includes the input value:
		var streets = rows.filter(function (row) {
			// Check if the input value exists in the street name:
			if (row.name.value.toUpperCase().includes(val.toUpperCase())) {
				return row;
			}
		});

		streets = streets.map(function (street) {
			var link = street.street.value;
			var slug = link.slice((link.indexOf('street/') + 7), link.lastIndexOf('/'));
			var id = link.slice(link.lastIndexOf('/') + 1);

			return {
				'type': 'Feature',
				'properties': {
					'streetName': street.name.value,
					'link': link,
					'slug': slug,
					'id': id
				},
				'geometry': parseMultiLineString(street.wkt.value)
			};
		});

		res.render('search', {
			streets: streets
		});
	});
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

		// Add years into the timeline
		res.render('details', {
			years: years
		});
	});
});

app.listen(3000);
