if(AES === undefined)
	console.log("requires AES_CBC to work");


var SAFE = function(pass, key, val) {
	SAFE.open(pass);

	var out;
	if(val !== undefined)
		SAFE.store(key, val);

	else
		SAFE.release(key);

	SAFE.lock();

	return out;
}


var CURRENT_PASS = sessionStorage.getItem("SAFE_CURRENT_PASS") || '';



SAFE.open = function(pass) {
	var newPass = AES.ECB_Encrypt("KEEP_IT_SAFE_YO!", pass)
	console.log(newPass)
	CURRENT_PASS = newPass;
}

SAFE.session = function(pass) {
	SAFE.open(pass);
	sessionStorage.setItem("SAFE_CURRENT_PASS", CURRENT_PASS);
}

SAFE.isOpen = function() {
	return CURRENT_PASS !== '';
}

SAFE.lock = function() {
	CURRENT_PASS = '';
	sessionStorage.setItem("SAFE_CURRENT_PASS", CURRENT_PASS);
}


SAFE.set = function(key, value) {
	value = ''+value;

	if(CURRENT_PASS == '') 
		localStorage.setItem(key, value);

	else {
		var secretKey = AES.ECB_Encrypt(key, CURRENT_PASS);
		var secretVal = AES.CBC_Encrypt(value, CURRENT_PASS);

		localStorage.setItem(secretKey, secretVal);
	}

}

SAFE.get = function(key) {
	if(CURRENT_PASS == '') 
		return localStorage.getItem(key);

	else {
		var secretKey = AES.ECB_Encrypt(key, CURRENT_PASS);
		var secretVal = localStorage.getItem(secretKey);

		var out;
		if(secretVal)
			out = AES.CBC_Decrypt(secretVal, CURRENT_PASS);

		else
			out = localStorage.getItem(key);

		console.log(secretVal, out)

		return out;
	}
}









