

PINE("[filter]", function(initMe, needle) {
	var targetAtt = El.attr(initMe, "filter");

	initMe.addEventListener("keydown", function(e) {
		var target = El.byId(targetAtt);

		var query = initMe.value;

		if(query) {
			var children = target.childNodes;
			var isMatch = false;
			for(var i = 0; i < children.length; i++) {
				var child = children[i];
				if(El.attr(child, "filterTags")) {
					var tags = child._pine_.filter.tags;
					for(var ta = 0; ta < tags.length; ta++) {
						if(tags[ta].indexOf(query) != -1)
							isMatch = true;
					}
				}
				else isMatch = true;

				child.style.display = isMatch ? "inherit": "none";
			}
		}
	});
});



PINE("[filterTags]", function(initMe, needle) {
	var tagsAtt = El.attr(initMe, "filterTags");
	initMe._pine_.filter.tags = tagsAtt.split(',');
});