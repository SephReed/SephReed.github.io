var spoilerText = "Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkg "
+"aGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBq "
+"dXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUg "
+"YnkK"

spoilerText = CT.hexToString(CT.base64ToHex(spoilerText));


var key = CT.randomBytes(BLOCK_SIZE);
var ORACLE = function(lal) {
	return CT.ECB(lal+spoilerText, AES_Encrypt, key)
}



AES_Init();

// var blocksize = ORACLE('A').length;


var blocksize = -1;
var beforeSize = ORACLE('').length;
var appendMe = "A"
for (var i = 1; i <= 64 && blocksize == -1; i++) {
	var afterSize = ORACLE(appendMe).length;

	if(afterSize > beforeSize) 
		blocksize = afterSize - beforeSize;

	appendMe += "A";
}

console.log("blocksize", blocksize);

var repeats = CT.numRepeatBlocks(ORACLE("ABCDABCDABCDABCDABCDABCDABCDABCDABCD"), blocksize);
console.log(repeats);

if (repeats > 0) {
	console.log("is ECB");

	var solved = ''

	for (var t = 0; t < beforeSize; t += blocksize) {
		for (var b = 1; b <= blocksize; b++) {
			var shortSome = ''
			for(var i = 0; i < blocksize - b; i++)
				shortSome += "A";

			var shortOneBlock = ORACLE(shortSome).substr(t, blocksize);

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
}





AES_Done();