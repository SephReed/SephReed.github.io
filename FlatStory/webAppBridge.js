


var BRIDGE =  {};


BRIDGE.url = "http://localhost:8528/"


BRIDGE.try = function(sendMe) {
	return BRIDGE.Ajax.post(BRIDGE.url, JSON.stringify(sendMe));
}


BRIDGE.fixPath = function(filePath) {
	// if(filePath && filePath.length && !filePath.endsWith("/"))
	// 	filePath += "/";
	return filePath;
}

BRIDGE.getDirectory = function(filePath) {
	var sendMe = {};
	sendMe.cmd = "ls";
	sendMe.filePath = BRIDGE.fixPath(filePath);
	return BRIDGE.try(sendMe);
}

BRIDGE.makeDirectory = function(filePath, dirName) {
	var sendMe = {};
	sendMe.cmd = "mkdir";
	sendMe.filePath = BRIDGE.fixPath(filePath);
	sendMe.name = dirName;

	return BRIDGE.try(sendMe);
}

BRIDGE.saveFile = function(filePath, data, writeType) {
	var sendMe = {};
	sendMe.cmd = "put";
	sendMe.filePath = BRIDGE.fixPath(filePath);
	sendMe.writeType = writeType || "w";
	sendMe.data = data;

	console.log(sendMe);

	return BRIDGE.try(sendMe);
}


BRIDGE.loadFile = function(filePath) {
	var sendMe = {};
	sendMe.cmd = "get";
	sendMe.filePath = filePath;

	return BRIDGE.try(sendMe);
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