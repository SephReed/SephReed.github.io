var left = "1c0111001f010100061a024b53535009181c";
var right = "686974207468652062756c6c277320657965";

var target = "746865206b696420646f6e277420706c6179";

var result = CT.xorHex(left, right);

if(target == result)
	console.log("success")
else
	console.log("not the same ", result, target);