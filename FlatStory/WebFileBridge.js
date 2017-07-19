


var BRIDGE =  {};


BRIDGE.url = "http://localhost:8528/"
BRIDGE.defaultPrefix = "";


BRIDGE.try = function(sendMe) {
	// sendMe.filePath = BRIDGE.defaultPrefix + sendMe.filePath;

	return BRIDGE.Ajax.post(BRIDGE.url, JSON.stringify(sendMe));
}


BRIDGE.fixPath = function(filePath) {
	// if(filePath && filePath.length && !filePath.endsWith("/"))
	// 	filePath += "/";
	return filePath;
}

BRIDGE.checkExists = function(filePath) {
	var sendMe = {};
	sendMe.cmd = "poke";
	sendMe.filePath = filePath;
	return BRIDGE.try(sendMe);
}

BRIDGE.getDirectory = function(filePath, requestedData) {
	var sendMe = {};
	sendMe.cmd = "ls";
	sendMe.plzSend = requestedData || [];
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


BRIDGE.loadJSON = function(filePath) {
	return BRIDGE.loadFile(filePath).then(function(request){
		return JSON.parse(request.response);
	});
}









BRIDGE.virtualFileTree = function(rootPath, wantedInfo) {
	this.wantedInfo = wantedInfo || [];
	var thisVirtual = this;
	this.ready = this.getnitDir(rootPath).then(function(dir){
		thisVirtual.currentDir = thisVirtual.rootDir = dir;
	});
	
}

BRIDGE.virtualFileTree.prototype.cd = function(path) {
	var thisVirtual = this;
	return this.getnitDir(path).then(function(dir){
		console.log(dir);
		if(dir.isDir)
			thisVirtual.currentDir = dir;	

		else
			console.error("Can not change to non-directory");
	});
};


BRIDGE.virtualFileTree.prototype.ls = function(forceRequest) {
	if(this.currentDir.loaded = false || forceRequest) {
		var thisVirtual = this;
		return BRIDGE.getDirectory(thisVirtual.currentDir.originalName)
		.then(function(request) {
			var items = JSON.parse(request.response);

			for(var i = 0; i < )
		}) 	
	}

	
}


// BRIDGE.virtualFileTree.prototype.makePathFull = function(path) {
// 	var fullPath;
// 	if(path.startsWith("/"))
// 		fullPath = this.startDir;
	
// 	else
// 		fullPath = this.currentDir;


// 	if(fullPath.length && fullPath.endsWith("/") == false)
// 		fullPath += "/";

// 	fullPath += path;
// 	return fullPath;
// }



BRIDGE.virtualFileTree.prototype.getnitDir = function(path) {

	console.log("GETINE", path);

	if(this.absoluteRoot) {
		var dirs = path.split("/");
		var lastDir;

		if(path.startsWith("/") == false)
			lastDir = this.currentDir;

		for(var i = 0; lastDir !== "notFound" && i < dirs.length; i++) {
			var dir = dirs[i];
			if(dir.length) {
				if(lastDir) {
					console.log(lastDir);
					lastDir = lastDir.childNodes[dir];
					if(lastDir == undefined) {
						console.log("dir not found", dir)
						lastDir = "notFound";
					}
				}
					
				else if(this.absoluteRoot.originalName == dir)
					lastDir = this.absoluteRoot;
			}
		}

		if(lastDir && lastDir != "notFound")
			return SyncPromise.resolved(lastDir);
	}

	var thisVirtual = this;
	return BRIDGE.checkExists(path).then(function(request) {
		console.log(request);
		var reality = JSON.parse(request.response);
		if(reality.exists && reality.isDir) {
			return thisVirtual.assertReprensenation(path);
		}
	});
}




BRIDGE.virtualFileTree.prototype.assertReprensenation = function(path) {
	console.log("ASSERT!", path);

	var dirs = path.split("/");
	var lastDir
	for(var i = 0; i < dirs.length; i++) {
		var dir = dirs[i];

		if(dir.length) {

			if(lastDir == undefined) {
				if(this.absoluteRoot == undefined)
					this.absoluteRoot = new BRIDGE.virtualFileTreeItem({name: dir, isDir: true})

				if (this.absoluteRoot.originalName == dir)
					lastDir = this.absoluteRoot;
				
				else
					console.error("absolute root differs between first filepath and this one")
			}

			else {
				if(lastDir.childNodes[dir] == undefined)
					lastDir.childNodes[dir] = new BRIDGE.virtualFileTreeItem({name: dir, isDir: true});

				lastDir = lastDir.childNodes[dir]
			}

		}
	}
	return lastDir;
}












BRIDGE.virtualFileTreeItem = function(args) {
	this.name = args.name;
	this.originalName = this.name;
	this.isDir = args.isDir;
	this.data = args.data || {};

	if(this.isDir)
		this.childNodes = {};
}


BRIDGE.virtualFileTreeItem.prototype.appendChild = function(addMe) {
	if(this.isDir) {
		var ID = addMe.originalName;
		if(this.childNodes[ID] == undefined) {
			this.childNodes[ID] = addMe;
			addMe.parentNode = this;
		}
		else console.error("Can not add already added child", this, addMe)
	}
	else console.error("Can not append child to non directory", this, addMe)
};












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





if(window.PINE) {
	PINE.signalNeedMet("FILE_BRIDGE");
}



