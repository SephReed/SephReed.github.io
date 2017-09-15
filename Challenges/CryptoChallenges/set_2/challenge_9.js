var padMe = "YELLOW SUBMARINE";

var target = "YELLOW SUBMARINE\x04\x04\x04\x04";



var result = CT.PKCS7_padTo(padMe, 20);



if(target == result)
	console.log("success")
else
	console.log("not the same ", result, target);