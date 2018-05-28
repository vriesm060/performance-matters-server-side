// Parse the multiline string geometry into a readable array for Leaflet JS:
var parseMultiLineString = function (str) {
	str = str.replace('MULTILINESTRING((', '');
	str = str.replace('LINESTRING(', '');
	str = str.replace(')', '');
	var pointsAsString = str.split(',');

	var points = pointsAsString.map(function (d) {
		return d.split(' ');
	});

	return points;
}

module.exports = parseMultiLineString;
