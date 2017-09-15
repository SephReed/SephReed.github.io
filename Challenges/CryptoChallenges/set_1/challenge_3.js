var decryptMe = "1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736";

var decryptMe = CT.hexToString(decryptMe);

var results = CT.tryOneCharXORCrack(decryptMe);

for(var i in results)
	console.log(results[i].out);