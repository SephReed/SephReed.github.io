// var encryptMe = "ABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD";
var encryptMe = FEEL_GOOD_INC_LYRICS;


var testCount = 64;
AES_Init();


var encryptions = [];
var target = [];

for (var i = 0; i < testCount; i++) {

	var randKey = CT.randomBytes(BLOCK_SIZE);
	var prePad = CT.randomString(Math.floor(Math.random()*5) + 5);
	var postPad = CT.randomString(Math.floor(Math.random()*5) + 5);

	var paddedText = prePad + encryptMe + postPad;
	// var paddedText = encryptMe;



	if(Math.random() > 0.5) {
		encryptions[i] = CT.CBC_Encrypt(paddedText, AES_Encrypt, randKey);
		target[i] = "CBC";
	}
	else {
		encryptions[i] = CT.ECB(paddedText, AES_Encrypt, randKey);
		target[i] = "ECB";
	}	
}


var results = [];
for (var i in encryptions) {
	var checkMe = encryptions[i]

	var repeats = CT.numRepeatBlocks(checkMe);

	if(repeats != 0) {
		results[i] = "ECB";
		console.log("ECB", target[i], repeats);
	}
	else {
		results[i] = "CBC";
		console.log("CBC", target[i], repeats);
	}
}


var correctCount = 0;
for (var i in results) {
	if(results[i] == target[i])
		correctCount++;
}


console.log(correctCount, "out of", results.length, "correct");


AES_Done();














