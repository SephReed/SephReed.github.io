


var BRIDGE =  {};

BRIDGE.registeredPaths = {};
BRIDGE.notFound = BRIDGE.notFound;
BRIDGE.registeredPaths.GET = ["appPkg/"];
BRIDGE.registeredPaths.POST = ["http://localhost:8528/FLAT.Worlds/"]



/*********************************
*	SIMPLE FILE PATH AJAX
*********************************/


BRIDGE.try = function(filePath, args, data, postOrGet) {
	if(filePath == '.')
		filePath = ''

	var pathIndex = 0;
	if(postOrGet != "GET")
		postOrGet = "POST";

	var tryPath = function(error) {
		if(BRIDGE.registeredPaths[postOrGet] == undefined || pathIndex >= BRIDGE.registeredPaths[postOrGet].length) {
			error = error || new Error("fail");
			return Promise.reject(error);
		}
		
		var prefix = BRIDGE.registeredPaths[postOrGet][pathIndex];

		pathIndex++;

		
		if(postOrGet == "POST") {
			var path = BRIDGE.makeCompleteFilepath(prefix, filePath, args);
			return BRIDGE.Ajax.post(path, data).catch(tryPath);		
		}

		else {
			var path = BRIDGE.makeCompleteFilepath(prefix, filePath);
			return BRIDGE.Ajax.get(path).catch(tryPath);
		}
	}

	return tryPath();
}


BRIDGE.tryGET = function(filePath, args) {
	return BRIDGE.try(filePath, args, undefined, "GET");
}



BRIDGE.makeCompleteFilepath = function(prefix, filePath, args) {
	var out = prefix+(filePath || "");

	var firstArg = true;
	for(var key in args) {
		out += firstArg ? "?" : "&"
		out += key+"="+args[key];

		firstArg = false;
	}

	return out;
}



BRIDGE.checkExists = function(filePath) {
	var args = {};
	args.cmd = "poke";
	return BRIDGE.try(filePath, args);
}

BRIDGE.getDirectory = function(filePath, requestedData) {
	var args = {};
	args.cmd = "ls";
	var data = JSON.stringify(requestedData || ["lalal"]);
	return BRIDGE.try(filePath, args, data);
}



BRIDGE.saveFile = function(filePath, data, dataType, writeType) {	
	var args = {};
	args.cmd = "put";
	args.dataType = dataType || "json";
	args.writeType = writeType || "w";

	var data = data;

	if(args.dataType == "json" && typeof data != "string")
		data = JSON.stringify(data);
		
	return BRIDGE.try(filePath, args, data);
}


BRIDGE.loadFile = function(filePath) {
	var args = {};
	args.cmd = "get";
	return BRIDGE.tryGET(filePath, args);
}


BRIDGE.loadJSON = function(filePath) {
	return BRIDGE.loadFile(filePath).then(function(request){
		return JSON.parse(request.response);
	});
}








/*********************************
*	SERVER/LOCAL REGISTRATION
*********************************/


BRIDGE.registerGETPaths = function(arrayOrString) {
	BRIDGE.registerPaths('GET')
}

BRIDGE.registerPOSTPaths = function(arrayOrString) {
	BRIDGE.registerPaths('POST', arrayOrString);
}

BRIDGE.registerGETPaths = function(arrayOrString) {
	BRIDGE.registerPaths('POST', arrayOrString);
}


BRIDGE.registerPaths = function(getOrPost, arrayOrString) {
	if(typeof arrayOrString == "string")
		arrayOrString = [];

	BRIDGE.registeredPaths[getOrPost].concat(arrayOrString);
}














/*********************************
*	HELPER FNS
*********************************/



BRIDGE.getNameFromFullPath = function(fullPath) {
	var match = fullPath.match(/[^\/]+$/g)

	if(match) return match[0];
	else return fullPath;
}



BRIDGE.Ajax = {};
BRIDGE.Ajax.send = function(getOrPost, url, dataType, data) {
	return new Promise( function(resolve, reject) {
		var request = new XMLHttpRequest();

		if(url.endsWith('.json'))
			request.overrideMimeType("application/json");

		request.open(getOrPost, url);	

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) 
				resolve(request);			    

			else request.onerror();
		};

		request.onerror = reject;

		try { request.send(data); }
		catch(err) { reject(err); }
	});
}

BRIDGE.Ajax.get = function(url, responseType) {
	return BRIDGE.Ajax.send("GET", url, responseType);
}

BRIDGE.Ajax.post = function(url, data, contentType) {
	return BRIDGE.Ajax.send("POST", url, contentType, data);
}















/*********************************
*	FILE TREE CLASS
*********************************/



BRIDGE.virtualFileTree = function(rootPath, wantedInfo) {
	if(rootPath == undefined || rootPath.length < 1)
		rootPath = '.';

	this.wantedInfo = wantedInfo || [];
	var THIS = this;
	THIS.absoluteRoot = new BRIDGE.virtualFileTreeItem({fullPath: ".", isDir: true});
	this.ready = this.getnit(rootPath).then(function(dir){
		if(dir == undefined)
			PINE.err("no dir")
		THIS.currentDir = THIS.rootDir = dir;
	});
	
}

BRIDGE.virtualFileTree.prototype.changeDirectory = BRIDGE.virtualFileTree.prototype.cd = function(path) {
	var THIS = this;
	if(path == "../") {
		if(THIS.currentDir.parentNode)
			THIS.currentDir = THIS.currentDir.parentNode;
		 
		return Promise.resolve(THIS.currentDir);
	}

	return THIS.getnit(path).then(function(dir){
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
			var items = JSON.parse(request.response);

			for(var i = 0; i < items.length; i++) {
				var item = items[i];
				if(listMe.containsOriginal(item.name) == false) {
					var addMe = new BRIDGE.virtualFileTreeItem({fullPath: item.name, isDir: item.isDir})
					listMe.appendChild(addMe);
				}
			}

			return listMe.childNodes;
		}) 	
	}
	else return Promise.resolve(listMe.childNodes);
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
		if(response.data)
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
	var THIS = this;

	if(THIS.absoluteRoot) {
		var dirs = path.split("/");
		var lastDir;

		if(path.startsWith("/") == false)
			lastDir = THIS.currentDir;

		for(var i = 0; lastDir !== BRIDGE.notFound && i < dirs.length; i++) {
			var dir = dirs[i];
			if(dir.length) {
				if(lastDir) {
					lastDir = lastDir.childNodesByName[dir];
					if(lastDir == undefined) {
						lastDir = BRIDGE.notFound;
					}
				}
					
				else if(THIS.absoluteRoot.originalName == dir)
					lastDir = THIS.absoluteRoot;
			}
		}

		if(lastDir && lastDir != BRIDGE.notFound)
			return Promise.resolve(lastDir);
	}


	return Promise.resolve(THIS.assertReprensenation(path, undefined, false));

	// var thisVirtual = this;
	// return BRIDGE.checkExists(path).then(function(request) {
	// 	var reality = JSON.parse(request.response);
	// 	if(reality.exists) {
	// 		return thisVirtual.assertReprensenation(path, reality.isDir, true);
	// 	}
	// }).catch(function(err) {
	// 	//do same as above, but leave proven state false to signify it is not yet proven to exist
	// 	return thisVirtual.assertReprensenation(path, undefined, false);
	// });
}




BRIDGE.virtualFileTree.prototype.assertReprensenation = function(path, isDir, isProven) {
	var dirs = path.split("/");
	var lastDir = this.absoluteRoot;
	var lastPath = ""

	for(var i = 0; i < dirs.length; i++) {
		var dir = dirs[i];

		if(i == 0 && lastDir.originalName == dir) {

		}
		else {

			if(i != 0)
				lastPath += "/"

			lastPath += dir;

			if(dir.length) {
				if(lastDir.childNodesByName[dir] == undefined) {
					var setDir = (i == dirs.length-1) ? isDir : true;
					lastDir.appendChild(new BRIDGE.virtualFileTreeItem({
						fullPath: lastPath, 
						isDir: setDir,
						isProven: isProven
					}));
				}

				lastDir = lastDir.childNodesByName[dir]
			}
		}
	}


	return lastDir;
}



















/*********************************
*	FILE TREE ITEMS CLASS
*********************************/



BRIDGE.virtualFileTreeItem = function(args) {
	this.originalName = args.fullPath;
	this.ID = BRIDGE.getNameFromFullPath(this.originalName);
	this.name = this.ID;
	this.isProven = args.isProven;

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
}



BRIDGE.virtualFileTreeItem.prototype.getData = function(forceRequest, setToCache) {
	var THIS = this;
	if(THIS.dataCache == undefined || forceRequest) {
		return BRIDGE.loadFile(THIS.originalName).then(function(request) {
			THIS.assertProven();
			if(setToCache)
				THIS.dataCache = request.response;

			return request.response;
		}).catch(function(err) {
			THIS.isProven = BRIDGE.notFound;
			return Promise.reject(err);
		});
	}

	return Promise.resolve(THIS.dataCache);
};

BRIDGE.virtualFileTreeItem.prototype.assertProven = function() {
	if(this.isProven) return;

	this.isProven = true;
	if(this.parentNode)
		this.parentNode.assertProven();
}

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

















/*********************************
*	FOR PINE
*********************************/


if(window.PINE) {
	PINE.signalNeedMet("FILE_BRIDGE");
}



