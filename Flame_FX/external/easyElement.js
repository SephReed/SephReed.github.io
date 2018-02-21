const El = {};

El.byID = (id) => document.getElementById(id);
El.byTag = (tagNameOrRoot, tagName) => {
	if (tagName === undefined) {
		return document.getElementsByTagName(tagNameOrRoot)[0];	
	} else {
		return tagNameOrRoot.getElementsByTagName(tagName)[0];
	}
}