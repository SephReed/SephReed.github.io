var CSV = {};

CSV.valueListeners = [];
TEST_LENGTH = 1000;

CSV.onValue = function(listener) {
	CSV.valueListeners.push(listener);
}



CSV.parse = function(request) {
	var rawText = request.response;
	var lines = rawText.split('\n');

	var labels = lines[0].split(',');
	for(var i = 0; i < labels.length; i++)
		labels[i] = labels[i].trim();

	var out = [];
	for(var i = 1; i < lines.length && (TEST_LENGTH < 0 || i < TEST_LENGTH); i++) {
		var addMe = {};
		var values = lines[i].split(",");

		for(var v = 0; v < values.length; v++) {

			var value = values[v].trim();
			var label = labels[v];
			for(var l = 0; l < CSV.valueListeners.length; l++)
				value = CSV.valueListeners[l](value, label);

			addMe[label] = value;
		}

		out.push(addMe);
	}
	return out;
}