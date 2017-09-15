var parseMe = "foo=bar&baz=qux&zap=zazzle"

var parse = function(parseMe) {
	var sets = parseMe.split('&');

	var out = {};
	for (var i in sets) {
		var keyVal = sets[i].split('=')
		out[keyVal[0]] = keyVal[1];
	}

	return out;
}

var encode = function(encodeMe) {
	var notFirst = false;
	var out =''
	for(key in encodeMe) {
		if(notFirst)
			out += '&'

		out += key + '=' + encodeMe[key];

		notFirst = true;
	}
	return out;
}

var parsed = parse(parseMe);



console.log(parsed);

var UID = 0;
var profile_for = function(email) {
	var out = {};
	out.email = email.replace(/=&/g, '');
	out.uid = UID++;
	out.role = "user";

	return encode(out);
}





AES_Init();
var key = CT.randomBytes(BLOCK_SIZE);
AES_ExpandKey(key);

var ORACLE = function(email) {
	var text = profile_for(email);
	console.log(text);
	return CT.ECB(text, AES_Encrypt, key);
}



// var hackIn = "email=Seph@universe.io&uid=42&role=admin";




var test = ORACLE("foo@bar.meet");
console.log(test);
var encodedProfile = CT.ECB(test, AES_Decrypt, key);
var profile = parse(encodedProfile);

console.log(profile);


var blockEmail = "A";
var emailSize = -1;
var beforeSize = ORACLE(blockEmail).length;
while(emailSize == -1) {
	blockEmail += 'A';
	if(ORACLE(blockEmail).length > beforeSize)
		emailSize = blockEmail.length - 1;
}


var emptiness = "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00";

var adminEmailBlock = emptiness.substr(0, emailSize+1) + "admin";
adminEmailBlock += emptiness.substr(0, BLOCK_SIZE-"admin".length);

var encrypted = ORACLE(adminEmailBlock);
var adminBlock = encrypted.substr(16, 16);

var email = "SephSephSephSeph".substr(0, emailSize+"user".length-"@me.io".length);
email += "@me.io";

var hackMe = ORACLE(email);

hackMe = hackMe.substr(0, hackMe.length - 16);

hackMe += adminBlock;

console.log(CT.ECB(hackMe, AES_Decrypt, key));






AES_Done();































