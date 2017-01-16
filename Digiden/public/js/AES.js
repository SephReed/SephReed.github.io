


var BLOCK_SIZE = 16;
var AES = {};



AES.ECB_Encrypt = function(blockChain, key) {
    return AES.chainBlocks(blockChain, AES_Encrypt, key, false, false);
}

AES.ECB_Decrypt = function(blockChain, key) {
    return AES.chainBlocks(blockChain, AES_Decrypt, key, false, false);
}


AES.CBC_Encrypt = function(blockChain, key) {
    return AES.chainBlocks(blockChain, AES_Encrypt, key, false, true);
}

AES.CBC_Decrypt = function(blockChain, key) {
    return AES.chainBlocks(blockChain, AES_Decrypt, key, true, true);
}

AES.chainBlocks = function(blockChain, cryptoFunc, key, backToFront, cbcMode, IV) {
	AES_Init();

	blockChain = AES.PKCS7_padToBlocksize(blockChain, BLOCK_SIZE);
	var keyString = AES.PKCS7_padToBlocksize(key, BLOCK_SIZE);
	key = [];
	for (var i in keyString)
		key[i] = keyString.charCodeAt(i);

	AES_ExpandKey(key);

    var out = '';
    var lastChunk;

    if(backToFront !== true) {
        if(cbcMode === true) {
        	if(IV !== undefined)
        		out = lastChunk = IV;
        	else
            	out = lastChunk = AES.randomString(BLOCK_SIZE);
        }

        for(var i = 0; i < blockChain.length; i += BLOCK_SIZE) {
            var block = new Array(BLOCK_SIZE);

            var chunk = blockChain.substr(i, BLOCK_SIZE);
            if(cbcMode === true)
                chunk = AES.xorString(chunk, lastChunk);

            for (var c in chunk) 
                block[c] = chunk.charCodeAt(c);

            cryptoFunc(block, key);

            var addMe = '';
            for (var b in block) 
                addMe += String.fromCharCode(block[b])

            lastChunk = addMe;
            out += addMe;
        }
    }
    else  {

        for(var i = blockChain.length - BLOCK_SIZE; i >= 0; i -= BLOCK_SIZE) {
            
            var chunk = blockChain.substr(i, BLOCK_SIZE);
            if(lastChunk)
                out = AES.xorString(chunk, lastChunk) + out;

            // console.log(chunk);

            var block = new Array(BLOCK_SIZE);
            for (var c in chunk) 
                block[c] = chunk.charCodeAt(c);

            cryptoFunc(block, key);

            lastChunk = '';
            for (var b in block) 
                lastChunk += String.fromCharCode(block[b])
        }
    }


    AES_Done();
    out = AES.PKCS7_removePadding(out, BLOCK_SIZE);
    return out;
}





AES.randomBytes = function(length) {
    var out = [];
    for (var i = 0; i < length; i++)
        out[i] = Math.floor(Math.random()*256);

    return out;
}

AES.randomString = function(length) {
    var out = '';
    var bytes = AES.randomBytes(length);
    for (var b in bytes)
        out += String.fromCharCode(bytes[b])

    return out;
}



AES.PKCS7_padToBlocksize = function(padMe, blocksize) {
    var diff = blocksize - (padMe.length % blocksize);

    if(diff != blocksize) {
	    var addMe = String.fromCharCode(diff);

	    for(var i = 0; i < diff; i++)
	        padMe += addMe;
	}

    return padMe;
}


AES.PKCS7_removePadding = function(trimMe, blocksize) {
	var trimAmount = trimMe.charCodeAt(trimMe.length - 1);
	if(trimAmount < blocksize) {
		var padding = trimMe.substr(trimMe.length - trimAmount, trimAmount);

		var rex = new RegExp(String.fromCharCode(trimAmount), 'g');

		if(padding.replace(rex, '').length == 0) 
			trimMe = trimMe.substr(0, trimMe.length-trimAmount);
	}

	return trimMe;
}



AES.xorString = function(str1, str2) {
    var out = '';
    for (var i in str1) {
        var left = str1.charCodeAt(i % str1.length);
        var right = str2.charCodeAt(i % str2.length);
        var xor = left ^ right;
        tmp = String.fromCharCode(xor);
        out += tmp;
    }

    return out;
}





























/*
 *  jsaes version 0.1  -  Copyright 2006 B. Poettering
 *
 *  This program is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation; either version 2 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *  02111-1307 USA
 */

/*
 * http://point-at-infinity.org/jsaes/
 *
 * This is a javascript implementation of the AES block cipher. Key lengths 
 * of 128, 192 and 256 bits are supported.
 *
 * The well-functioning of the encryption/decryption routines has been 
 * verified for different key lengths with the test vectors given in 
 * FIPS-197, Appendix C.
 *
 * The following code example enciphers the plaintext block '00 11 22 .. EE FF'
 * with the 256 bit key '00 01 02 .. 1E 1F'.
 *
 *    AES_Init();
 *
 *    var block = new Array(16);
 *    for(var i = 0; i < 16; i++)
 *        block[i] = 0x11 * i;
 *
 *    var key = new Array(32);
 *    for(var i = 0; i < 32; i++)
 *        key[i] = i;
 *
 *    AES_ExpandKey(key);
 *    AES_Encrypt(block, key);
 *
 *    AES_Done();
 *
 * Report bugs to: jsaes AT point-at-infinity.org
 *
 */

/******************************************************************************/

/* 
   AES_Init: initialize the tables needed at runtime. Call this function
   before the (first) key expansion.
*/

function AES_Init() {
  AES_Sbox_Inv = new Array(256);
  for(var i = 0; i < 256; i++)
    AES_Sbox_Inv[AES_Sbox[i]] = i;
  
  AES_ShiftRowTab_Inv = new Array(16);
  for(var i = 0; i < 16; i++)
    AES_ShiftRowTab_Inv[AES_ShiftRowTab[i]] = i;

  AES_xtime = new Array(256);
  for(var i = 0; i < 128; i++) {
    AES_xtime[i] = i << 1;
    AES_xtime[128 + i] = (i << 1) ^ 0x1b;
  }
}

/* 
   AES_Done: release memory reserved by AES_Init. Call this function after
   the last encryption/decryption operation.
*/

function AES_Done() {
  delete AES_Sbox_Inv;
  delete AES_ShiftRowTab_Inv;
  delete AES_xtime;
}

/*
   AES_ExpandKey: expand a cipher key. Depending on the desired encryption 
   strength of 128, 192 or 256 bits 'key' has to be a byte array of length 
   16, 24 or 32, respectively. The key expansion is done "in place", meaning 
   that the array 'key' is modified.
*/

function AES_ExpandKey(key) {
  var kl = key.length, ks, Rcon = 1;
  switch (kl) {
    case 16: ks = 16 * (10 + 1); break;
    case 24: ks = 16 * (12 + 1); break;
    case 32: ks = 16 * (14 + 1); break;
    default: 
      alert("AES_ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
  }
  for(var i = kl; i < ks; i += 4) {
    var temp = key.slice(i - 4, i);
    if (i % kl == 0) {
      temp = new Array(AES_Sbox[temp[1]] ^ Rcon, AES_Sbox[temp[2]], AES_Sbox[temp[3]], AES_Sbox[temp[0]]); 
      if ((Rcon <<= 1) >= 256)
        Rcon ^= 0x11b;
    }
    else if ((kl > 24) && (i % kl == 16))
      temp = new Array(AES_Sbox[temp[0]], AES_Sbox[temp[1]], AES_Sbox[temp[2]], AES_Sbox[temp[3]]);       
    
    for(var j = 0; j < 4; j++)
      key[i + j] = key[i + j - kl] ^ temp[j];
  }
}

/* 
   AES_Encrypt: encrypt the 16 byte array 'block' with the previously 
   expanded key 'key'.
*/

function AES_Encrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(0, 16));
  for(var i = 16; i < l - 16; i += 16) {
    AES_SubBytes(block, AES_Sbox);
    AES_ShiftRows(block, AES_ShiftRowTab);
    AES_MixColumns(block);
    AES_AddRoundKey(block, key.slice(i, i + 16));
  }
  AES_SubBytes(block, AES_Sbox);
  AES_ShiftRows(block, AES_ShiftRowTab);
  AES_AddRoundKey(block, key.slice(i, l));
}

/* 
   AES_Decrypt: decrypt the 16 byte array 'block' with the previously 
   expanded key 'key'.
*/

function AES_Decrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(l - 16, l));
  AES_ShiftRows(block, AES_ShiftRowTab_Inv);
  AES_SubBytes(block, AES_Sbox_Inv);
  for(var i = l - 32; i >= 16; i -= 16) {
    AES_AddRoundKey(block, key.slice(i, i + 16));
    AES_MixColumns_Inv(block);
    AES_ShiftRows(block, AES_ShiftRowTab_Inv);
    AES_SubBytes(block, AES_Sbox_Inv);
  }
  AES_AddRoundKey(block, key.slice(0, 16));
}

/******************************************************************************/

/* The following lookup tables and functions are for internal use only! */

AES_Sbox = new Array(99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,
  118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,
  147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,
  7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,
  47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,
  251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,
  188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,
  100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,
  50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,
  78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,
  116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,
  158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,
  137,13,191,230,66,104,65,153,45,15,176,84,187,22);

AES_ShiftRowTab = new Array(0,5,10,15,4,9,14,3,8,13,2,7,12,1,6,11);

function AES_SubBytes(state, sbox) {
  for(var i = 0; i < 16; i++)
    state[i] = sbox[state[i]];  
}

function AES_AddRoundKey(state, rkey) {
  for(var i = 0; i < 16; i++)
    state[i] ^= rkey[i];
}

function AES_ShiftRows(state, shifttab) {
  var h = new Array().concat(state);
  for(var i = 0; i < 16; i++)
    state[i] = h[shifttab[i]];
}

function AES_MixColumns(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    state[i + 0] ^= h ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h ^ AES_xtime[s3 ^ s0];
  }
}

function AES_MixColumns_Inv(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    var xh = AES_xtime[h];
    var h1 = AES_xtime[AES_xtime[xh ^ s0 ^ s2]] ^ h;
    var h2 = AES_xtime[AES_xtime[xh ^ s1 ^ s3]] ^ h;
    state[i + 0] ^= h1 ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h2 ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h1 ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h2 ^ AES_xtime[s3 ^ s0];
  }
}

















