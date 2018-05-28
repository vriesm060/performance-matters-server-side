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

module.exports = sparql;
