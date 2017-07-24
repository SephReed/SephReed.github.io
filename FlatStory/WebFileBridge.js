


var BRIDGE =  {};


BRIDGE.url = "http://localhost:8528/"
BRIDGE.defaultPrefix = "";


BRIDGE.try = function(sendMe) {
	// sendMe.filePath = BRIDGE.defaultPrefix + sendMe.filePath;
	console.log(sendMe);

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

BRIDGE.saveFile = function(filePath, data, dataType, writeType) {
	var sendMe = {};
	sendMe.cmd = "put";
	sendMe.filePath = BRIDGE.fixPath(filePath);
	sendMe.writeType = writeType || "w";
	sendMe.data = data;

	if(dataType)
		sendMe.dataType = dataType;

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



BRIDGE.getNameFromFullPath = function(fullPath) {
	var match = fullPath.match(/[^\/]+$/g)

	if(match) return match[0];
	else return fullPath;
}








BRIDGE.virtualFileTree = function(rootPath, wantedInfo) {
	this.wantedInfo = wantedInfo || [];
	var thisVirtual = this;
	this.ready = this.getnit(rootPath).then(function(dir){
		thisVirtual.currentDir = thisVirtual.rootDir = dir;
	});
	
}

BRIDGE.virtualFileTree.prototype.changeDirectory = BRIDGE.virtualFileTree.prototype.cd = function(path) {
	var THIS = this;
	if(path == "../") {
		if(THIS.currentDir.parentNode)
			THIS.currentDir = THIS.currentDir.parentNode;
		 
		return SyncPromise.resolved(THIS.currentDir);
	}

	return THIS.getnit(path).then(function(dir){
		console.log(dir);
		if(dir.isDir)
			THIS.currentDir = dir;	

		else
			console.error("Can not change to non-directory");
	});
};


BRIDGE.virtualFileTree.prototype.list = BRIDGE.virtualFileTree.prototype.ls = function(forceRequest) {
	var THIS = this;
	var listMe = THIS.currentDir;
	if(listMe.loaded == false || forceRequest) {
		return BRIDGE.getDirectory(listMe.originalName+"/")
		.then(function(request) {
			// console.log(thisVirtual.currentDir);
			var items = JSON.parse(request.response);

			// console.log(items);
			for(var i = 0; i < items.length; i++) {
				var item = items[i];
				if(listMe.containsOriginal(item.name) == false) {
					console.log("adding", item.name, listMe);

					var addMe = new BRIDGE.virtualFileTreeItem({fullPath: item.name, isDir: item.isDir})
					listMe.appendChild(addMe);
				}
			}

			return listMe.childNodes;
		}) 	
	}
	else return SyncPromise.resolved(listMe.childNodes);
}


BRIDGE.virtualFileTree.prototype.listTree 
= BRIDGE.virtualFileTree.prototype.lstr 
= function(forceRequest, callLimit) {
	var THIS = this;
	var baton = {};
	baton.limit = limit;
	baton.count = 0;
}




BRIDGE.virtualFileTree.prototype.make = BRIDGE.virtualFileTree.prototype.mk = function(name) {
	var fullPath = this.currentDir.originalName+"/"+name;
	var addMe = new BRIDGE.virtualFileTreeItem({fullPath: fullPath, isDir: false})
	this.currentDir.appendChild(addMe);
	return addMe;
}



BRIDGE.virtualFileTree.prototype.open = function(filePath, forceRequest, setToCache) {
	var THIS = this;
	return THIS.getnit(filePath).then(function(item) {
		return item.getData(forceRequest, setToCache).then(function(data) {
			return {data: data, dirItem: item}
		});
	});
}



BRIDGE.virtualFileTree.prototype.openJSON = function(filePath, forceRequest, setToCache) {
	var THIS = this;
	return THIS.open(filePath, forceRequest, setToCache)
	.then(function(response) {
		response.data = JSON.parse(response.data);
		return response;
	});
}

BRIDGE.virtualFileTree.prototype.save = function(filePath, data) {
	var THIS = this;
	return THIS.getnit(filePath).then(function(item) {
		return item.setData(data);
	});
}


BRIDGE.virtualFileTree.prototype.mapTree = function(currentDir, fn) {
	currentDir = currentDir || this.absoluteRoot;
	fn(currentDir);

	var children = currentDir.childNodes;
	for (var i = 0; children && i < children.length; i++)
		this.mapTree(children[i], fn);
}


BRIDGE.virtualFileTree.prototype.getnit = function(path) {

	if(this.absoluteRoot) {
		var dirs = path.split("/");
		var lastDir;

		if(path.startsWith("/") == false)
			lastDir = this.currentDir;

		for(var i = 0; lastDir !== "notFound" && i < dirs.length; i++) {
			var dir = dirs[i];
			if(dir.length) {
				if(lastDir) {
					lastDir = lastDir.childNodesByName[dir];
					if(lastDir == undefined) {
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
		var reality = JSON.parse(request.response);
		if(reality.exists) {
			return thisVirtual.assertReprensenation(path, reality.isDir);
		}
	});
}




BRIDGE.virtualFileTree.prototype.assertReprensenation = function(path, isDir) {

	var dirs = path.split("/");
	var lastDir;
	var lastPath = ""
	for(var i = 0; i < dirs.length; i++) {
		var dir = dirs[i];

		if(i != 0)
			lastPath += "/"

		lastPath += dir;

		if(dir.length) {

			

			if(lastDir == undefined) {
				if(this.absoluteRoot == undefined)
					this.absoluteRoot = new BRIDGE.virtualFileTreeItem({fullPath: lastPath, isDir: true})

				if (this.absoluteRoot.originalName == dir)
					lastDir = this.absoluteRoot;
				
				else
					console.error("absolute root differs between first filepath and this one")
			}

			else {
				if(lastDir.childNodesByName[dir] == undefined) {
					var setDir = (i == dirs.length-1) ? isDir : true;
					lastDir.appendChild(new BRIDGE.virtualFileTreeItem({fullPath: lastPath, isDir: setDir}));
				}

				lastDir = lastDir.childNodesByName[dir]
			}

		}
	}


	return lastDir;
}












BRIDGE.virtualFileTreeItem = function(args) {
	this.originalName = args.fullPath;
	this.ID = BRIDGE.getNameFromFullPath(this.originalName);
	this.name = this.ID;

	// console.log(args.isDir, args.fullPath);
	this.isDir = args.isDir == "True" || args.isDir === true;
	this.data = args.data || {};
	this.dataCache = undefined;

	if(this.isDir) {
		this.childNodesByName = {};
		this.childNodes = [];
		this.loaded = false;
	}
}


BRIDGE.virtualFileTreeItem.prototype.appendChild = function(addMe) {
	if(this.isDir) {
		var ID = addMe.ID;
		if(this.childNodesByName[ID] == undefined) {
			this.childNodesByName[ID] = addMe;
			this.childNodes.push(addMe);
			addMe.parentNode = this;
		}
		else console.error("Can not add already added child", this, addMe)
	}
	else console.error("Can not append child to non directory", this, addMe)
};



BRIDGE.virtualFileTreeItem.prototype.containsOriginal = function(originalName) {
	return originalName in this.childNodesByName;
	// for(var name in this.childNodesByName) {
	// 	if(this.childNodesByName[name].originalName == originalName)
	// 		return true;
	// }
	// return false;
}



BRIDGE.virtualFileTreeItem.prototype.getData = function(forceRequest, setToCache) {
	var THIS = this;
	if(THIS.dataCache == undefined || forceRequest) {
		return BRIDGE.loadFile(THIS.originalName).then(function(request) {
			if(setToCache)
				THIS.dataCache = request.response;

			return request.response;
		});
	}

	return SyncPromise.resolved(THIS.dataCache);
};



BRIDGE.virtualFileTreeItem.prototype.setData = function(data) {
	var THIS = this;
	return BRIDGE.saveFile(THIS.originalName, data);
}



BRIDGE.virtualFileTreeItem.prototype.getJSONData = function(forceRequest, setToCache) {
	var THIS = this;
	return THIS.getData(forceRequest, setToCache).then(function(result) {
		return JSON.parse(result);
	});
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





if(window.PINE) {
	PINE.signalNeedMet("FILE_BRIDGE");
}



