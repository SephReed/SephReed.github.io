// PINE("[autoIndex]", function(initMe) {
	
// }

PINE("[autoIndex]", "polish", function(initMe) {

	var addToMe = El.byId(El.attr(initMe, "autoIndex"));

	if(addToMe) {
		function permeate(root, wrapper) {
			var docNodes = El.firstsOfKey(root, "[aIndex]");

			for(var i = 0; docNodes && i < docNodes.length; i++) {

				var link = document.createElement("a");
				El.attr(link, "href", '#'+docNodes[i].id);
				var title = El.attr(docNodes[i], "aIndex") || docNodes[i].childNodes[1].innerHTML;
				link.innerHTML = title != "" ? title : docNodes[i].id;

				var children = document.createElement("div");
				children.style.paddingLeft = "10px";

				permeate(docNodes[i], children);

				wrapper.appendChild(link);
				wrapper.appendChild(children);
			}
		}

		permeate(initMe, addToMe);

		

		PINE.updateAt(addToMe);

	}
});


