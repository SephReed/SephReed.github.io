


var BRIDGE =  {};


BRIDGE.url = "http://localhost:8528/"


BRIDGE.try = function(filePath, sendMe) {
	return BRIDGE.Ajax.post(BRIDGE.url+filePath, JSON.stringify(sendMe));
}

BRIDGE.getDirectory = function(filePath) {
	var sendMe = {};
	sendMe.cmd = "ls";
	return BRIDGE.try(filePath, sendMe);
}

BRIDGE.makeDirectory = function(filePath, dirName) {
	var sendMe = {};
	sendMe.cmd = "mkdir";
	sendMe.name = dirName;

	return BRIDGE.try(filePath, sendMe);
}

BRIDGE.saveFile = function(filePath, fileName, data, writeType) {
	var sendMe = {};
	sendMe.cmd = "put";
	sendMe.name = fileName;
	sendMe.writeType = writeType || "w";
	sendMe.data = data;

	console.log(sendMe);

	return BRIDGE.try(filePath, sendMe);
}


BRIDGE.loadFile = function(filePath, fileName) {
	var sendMe = {};
	sendMe.cmd = "get";
	sendMe.name = fileName;

	return BRIDGE.try(filePath, sendMe);
}


















BRIDGE.Ajax = {};
BRIDGE.Ajax.send = function(getOrPost, url, dataType, data) {
	return new Promise( function(resolve, reject) {
		var request = new XMLHttpRequest();

		if(getOrPost == "GET") {
			request.responseType = dataType || "text";
			request.open("GET", url);	
		}
		else {//getOrPost == "POST"
			request.open("POST", url);	
			// request.setRequestHeader('Content-type', dataType)
		}


		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				console.log("ajax", request.status+" "+url, request);

			    resolve(request);			    

			} else {
			    request.onerror();
			}
		};

		request.onerror = function(response) {
			var err = "include src '"+url+"' does not exist";
		  	reject(err)
		};

		try {
			request.send(data);	
		}
		catch(e) {
			var err = "NS_ERROR_DOM_BAD_URI: Access to restricted URI '"+url+"' denied";
		  	reject(err)
		}


	});
}

BRIDGE.Ajax.get = function(url, responseType) {
	return U.Ajax.send("GET", url, responseType);
}

BRIDGE.Ajax.post = function(url, data, contentType) {
	return U.Ajax.send("POST", url, contentType, data);
}