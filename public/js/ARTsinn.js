





var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var b64pad = "=";

function int2char(n) {
    return BI_RM.charAt(n);
}

function hex2b64(h) {
    var i;
    var c;
    var ret = "";
    for (i = 0; i + 3 <= h.length; i += 3) {
        c = parseInt(h.substring(i, i + 3), 16);
        ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
    }
    if (i + 1 == h.length) {
        c = parseInt(h.substring(i, i + 1), 16);
        ret += b64map.charAt(c << 2);
    } else if (i + 2 == h.length) {
        c = parseInt(h.substring(i, i + 2), 16);
        ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
    }
    while ((ret.length & 3) > 0) ret += b64pad;
    return ret;
}

// convert a base64 string to hex
function b642hex(s) {
    var ret = "";
    var i;
    var k = 0; // b64 state, 0-3
    var slop;
    for (i = 0; i < s.length; ++i) {
        if (s.charAt(i) == b64pad) break;
        v = b64map.indexOf(s.charAt(i));
        if (v < 0) continue;
        if (k == 0) {
            ret += int2char(v >> 2);
            slop = v & 3;
            k = 1;
        } else if (k == 1) {
            ret += int2char((slop << 2) | (v >> 4));
            slop = v & 0xf;
            k = 2;
        } else if (k == 2) {
            ret += int2char(slop);
            ret += int2char(v >> 2);
            slop = v & 3;
            k = 3;
        } else {
            ret += int2char((slop << 2) | (v >> 4));
            ret += int2char(v & 0xf);
            k = 0;
        }
    }
    if (k == 1) ret += int2char(slop << 2);
    return ret;
}

// convert a base64 string to a byte/number array
function b642BA(s) {
    //piggyback on b64tohex for now, optimize later
    var h = b642hex(s);
    var i;
    var a = new Array();
    for (i = 0; 2 * i < h.length; ++i) {
        a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
    }
    return a;
}

function byte2Hex(b) {
    if (b < 0x10) return "0" + b.toString(16);
    else return b.toString(16);
}


function toHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}

function toAscii(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

/*
var hexB = byte2Hex(1337),
    hexS = toHex('foo');
alert(hexB)
alert(toAscii(hexS))

alert( hex2b64( b642hex(btoa('foo')) ) )
alert( hex2b64( hexB ) );
*/

var xor = function (str, key) {
    var encrypted = '';
    for (var i = 0; i < str.length; ++i) {
        encrypted += String.fromCharCode(key ^ str.charCodeAt(i));
    }
    return encrypted;
};

var encrypted = xor("Am I awesome?", 6);
var decrypted = xor(encrypted, 6);
alert(encrypted);
alert(decrypted);

function xorEncode(txt, pass) {
    var ord = [],
        buf = '';

    for (z = 1; z <= 255; z++) {
        ord[String.fromCharCode(z)] = z;
    }

    for (j = z = 0; z < txt.length; z++) {
        buf += String.fromCharCode(ord[txt.substr(z, 1)] ^ ord[pass.substr(j, 1)]);
        j = (j < pass.length) ? j + 1 : 0;
    }

    return buf;
}

var foo = xorEncode("Am I awesome?", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var bar = xorEncode(foo, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
alert(foo);
alert(bar);

String.prototype.reverse = function() {
   var o = '',
       i = this.length;
   while (i--) {
      o += this.charAt(i);
   }
   return o;
}


var swapAlpha = function(str, dir){
    var al = (function(){
        var str = '';
        for (var i=32; i<127; i++) {            
            str += String.fromCharCode(i);
        }
        return str;
    }());
    // var al = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/= ",
    var re = al.reverse(),
        i = str.length,
        newStr = '';

    while(i--) {
        newStr += al.charAt(re.indexOf(str.charAt(i)));
    }
    console.log(newStr);
    return newStr;
};
swapAlpha('foo bar', 0);
swapAlpha(',=<~//8', 0);
// alert( swapAlpha(swapAlpha('foo bar', 1), 0))