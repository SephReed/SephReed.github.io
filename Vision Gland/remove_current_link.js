

document.addEventListener("DOMContentLoaded", function (){
	var links = document.getElementById("links");
	var currentUrl = window.location.href;

	for(var i in links.childNodes) {
		var link = links.childNodes[i];
		if(link.nodeType == 1 && currentUrl.indexOf(link.getAttribute("href")) !== -1)
			link.style.display = "none";
	}
});