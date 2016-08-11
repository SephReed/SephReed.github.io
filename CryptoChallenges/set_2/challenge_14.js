var spoilerText = "Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkg "
+"aGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBq "
+"dXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUg "
+"YnkK"

spoilerText = CT.hexToString(CT.base64ToHex(spoilerText));


var key = CT.randomBytes(BLOCK_SIZE);
var ORACLE = function(lal) {
	var randString = CT.randString(Math.floor(Math.random()*128));
	return CT.ECB(randString+lal+spoilerText, AES_Encrypt, key)
}



AES_Init();

var control = ORACLE('');
var targetLastBlock = control.substr(control.length - 16, 16);


var solved = ''

for (var t = 0; t < beforeSize; t += blocksize) {
	for (var b = 1; b <= blocksize; b++) {
		var shortSome = ''
		for(var i = 0; i < blocksize - b; i++)
			shortSome += "A";

		var sameSizeRand = ''
		while (sameSizeRand.substr(sameSizeRand.length-16, 16) != targetLastBlock)
			sameSizeRand = ORACLE(shortSome);

		var shortOneBlock = sameSizeRand.substr(t, blocksize);

		for (var i = 0; i < 256; i++) {
			var char = String.fromCharCode(i);
			var testMe = shortSome + solved + char;

			if(ORACLE(testMe).substr(t, blocksize) == shortOneBlock) {
				solved += char;
				break;
			}
		}
	}	
}

console.log(solved);