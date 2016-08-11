var BLOCK_SIZE = 16

//cryptoTools
var CT = {};


CT.hexToBase64 = function(str) {
    console.log(str.length)
    str = str.replace(/\r|\n/g, "")                     //remove newlines and carrige returns
    str = str.replace(/([\da-fA-F]{2}) ?/g, "0x$1 ");   //turn all chunks of a digit and char (range a-f) with 0x[match]  
    str = str.replace(/ +$/, "");                       //remove extra whitespace
    str = String.fromCharCode.apply(null, str.split(" "));

    console.log(str.length)
    var out = btoa(str);
    console.log(out.length);

    return out;
}

CT.base64ToHex = function(str) {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join("");
}


CT.xorHex = function(str1, str2) {
    var out = '';
    for (var i in str1) {
        var left = parseInt(str1[i % str1.length], 16);
        var right = parseInt(str2[i % str2.length], 16);
        var xor = left ^ right;
        out += (xor).toString(16);
    }

    return out;
}


CT.xorString = function(str1, str2) {
    var out = '';
    for (var i in str1) {
        var left = str1.charCodeAt(i % str1.length);
        var right = str2.charCodeAt(i % str2.length);
        var xor = left ^ right;
        tmp = String.fromCharCode(xor);
        // if (tmp.length === 1) tmp = "0" + tmp;
        out += tmp;
    }

    return out;
}

// console.log(CT.xor("1c0111001f010100061a024b53535009181c", "686974207468652062756c6c277320657965"))


CT.hexToString = function(convertMe) {
    var hex = '';
    var out = '';
    for(var i in convertMe) {
        hex += convertMe.charAt(i);
        if(hex.length > 1) {
            var num = parseInt(hex, 16);
            out += String.fromCharCode(num);
            hex = '';
        }
    }

    return out;
}

CT.stringToHex = function(convertMe) {
    var out = '';
    for (var i in convertMe) {
        var tmp = convertMe.charCodeAt(i).toString(16);
        if(tmp.length == 1)
            tmp = '0'+tmp;
        out += tmp;
    }
    return out;
}


CT.randomBytes = function(length) {
    var out = [];
    for (var i = 0; i < length; i++)
        out[i] = Math.floor(Math.random()*256);

    return out;
}

CT.randomString = function(length) {
    var out = '';
    var bytes = CT.randomBytes(length);
    for (var b in bytes)
        out += String.fromCharCode(bytes[b])

    return out;
}

CT.PKCS7_padTo = function(padMe, length) {
    var diff = length - padMe.length;

    var addMe = String.fromCharCode(diff);

    for(var i = 0; i < diff; i++)
        padMe += addMe;

    return padMe;
}


CT.ECB = function(blockChain, cryptoFunc, key) {
    return CT.chainBlocks(blockChain, cryptoFunc, key, false, false);
}

CT.CBC_Encrypt = function(blockChain, cryptoFunc, key) {
    return CT.chainBlocks(blockChain, cryptoFunc, key, false, true);
}

CT.CBC_Decrypt = function(blockChain, cryptoFunc, key) {
    return CT.chainBlocks(blockChain, cryptoFunc, key, true, true);
}

CT.chainBlocks = function(blockChain, cryptoFunc, key, backToFront, cbcMode) {
    var out = '';
    var lastChunk;

    if(backToFront !== true) {
        if(cbcMode === true) {
            lastChunk = '';
            for (var i = 0; i < 16; i++)
                lastChunk += String.fromCharCode(Math.floor(Math.random()* 0xff));

            out = lastChunk;
        }

        for(var i = 0; i < blockChain.length; i += BLOCK_SIZE) {
            var block = new Array(BLOCK_SIZE);

            var chunk = blockChain.substr(i, BLOCK_SIZE);
            if(cbcMode === true)
                chunk = CT.xorString(chunk, lastChunk);

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
                out = CT.xorString(chunk, lastChunk) + out;

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

    return out;
}



CT.findMostCommon = function(searchMe, limit) {
    var counts = {};
    var numDiffChars = 0;
    for (var i in searchMe) {
        var char = searchMe[i];
        if(counts[char])
            counts[char]++;
        else {
            numDiffChars++;
            counts[char] = 1;
        }
    }

    var out = [];
    for (var i = 0; (!limit || i < limit) && i < numDiffChars; i++) {
        var currentTopCount = 0;
        var currentTop = '';
        for (var key in counts) {
            var keyCount = counts[key];
            if(keyCount > currentTopCount) {
                currentTop = key;
                currentTopCount = keyCount;
                counts[key] = -1;
            }

        }

        if(currentTop != '')
            out.push(currentTop)
        else
            i = numDiffChars;
    }



    return out;
}


CT.numRepeatBlocks = function(checkMe, blocksize) {
    if(blocksize === undefined)
        blocksize = BLOCK_SIZE;

    var blocks = [];

    for(var c = 0; c < checkMe.length; c += blocksize)
        blocks.push(checkMe.substr(c, blocksize));

    // console.log(blocks);
    var repeats = 0;

    while( blocks.length) {
        var findMe = blocks.shift();

        for (var b = 0; b < blocks.length; b++) {
            if(blocks[b] == findMe) {
                repeats++;
                blocks.splice(b, 1);
                b--;
            }
        }
    }

    return repeats; 
}


CT.stringEditDistance = function(left, right) {
    if(left.length != right.length)
        alert("fix your code");

    var xor = CT.xorString(left, right);
    
    var out = 0;
    for (var i in xor) {
        var code = xor.charCodeAt(i);

        var twoPow = 1;
        var check = 0;
        for(var dig = 0; dig < 8 && twoPow <= code; dig++) {
            if((code ^ twoPow) == (code - twoPow)) {
                // console.log(code, twoPow, code ^ twoPow, code - twoPow);
                check += twoPow;
                out++;
            }

            twoPow *= 2;
        }

        if(check != code)
            console.log("NOT EQUAL", code, check);
    }

    return out;
}


// console.log(CT.stringEditDistance("this is a test", "wokka wokka!!!"));



CT.commonLetters = " ETAOINSHRDLU";
CT.tryOneCharXORCrack = function(crackMe, tries, unCommonThreshold) {
    tries = tries || CT.commonLetters.length;
    var mostCommon = CT.findMostCommon(crackMe)[0];

    if(!unCommonThreshold)
        unCommonThreshold = .35;

    // var fails = {};
    // var gos = {};


    var best = [];
    for (var i  = 0; i < tries; i++) {
        var c = CT.commonLetters[i];

        var xor = CT.xorString(c, mostCommon);
        var out = CT.xorString(crackMe, xor);
        
        var jargonRating = CT.jargonRating(out);
        if(jargonRating < unCommonThreshold) {
            var addMe = {};
            addMe.xor = xor;
            addMe.out = out;
            addMe.jargonRating = jargonRating;

            if(best.length == 0) {
                best.push(addMe);
            }
            else {
                for(var i in best) {
                    if(best[i].jargonRating > addMe.jargonRating)
                        best.splice(i, 0, addMe);

                    else if(i == best.length -1)
                        best.push(addMe);
                }
            }

            // console.log(out, xor, jargonRating);
        }

        // else fails[xor] = out;
    }

    return best;
    // console.log("FAILS ", fails);
}



CT.jargonRating = function(testMe) {
    var jargonRating = 0;

    var nonCommons = testMe.replace(/[\w\s\.'",!?]+/g, '');
    // if(unCommonThreshold == undefined)
        // unCommonThreshold = 1;
    
    jargonRating += nonCommons.length/testMe.length;

    // if(nonCommons.length/testMe.length > unCommonThreshold * .125)
        // return false;

    var mostCommon = CT.findMostCommon(testMe.toUpperCase(), 10);
    // console.log(mostCommon);


    var chaos = 0;
    for (var target in CT.commonLetters) {
        var dart = mostCommon.indexOf(CT.commonLetters[target]);

        if(dart != -1) {
            var miss = Math.abs(target - dart);
            if(miss != 0) 
                chaos += (miss-1)/miss;
        }   
        else
            chaos += 1;
    }
    chaos /= CT.commonLetters.length;

    jargonRating += chaos;

    // if(chaos > unCommonThreshold * .75)
        // return false;


    // var upperCase = testMe.replace(/[^A-Z]/g, '');
    // var lowerCase = testMe.replace(/[^a-z]/g, '');

    // if(upperCase/lowerCase > 0.25 * unCommonThreshold)
        // return false;

    // console.log(chaos);

    // return true;

    return jargonRating/2;
}



CT.findLikelyKeySizes = function(checkMe, keysizeLimit, depth) {
    if(!keysizeLimit)
        keysizeLimit = 40;

    if(!depth || depth < 2)
        depth = 10;

    while(keysizeLimit * depth > checkMe.length)
        depth--;


    var editDistances = {};
    for (var j = 1; j < keysizeLimit; j++) {

        editDistances[j] = 0;

        var lastBlock = checkMe.substr(0, j);
        for (var i = 1; i < depth; i++) {
            var nextBlock = checkMe.substr(i*j, j);
            var editDist = CT.stringEditDistance(lastBlock, nextBlock);
            // console.log("edit dist", editDist, lastBlock, nextBlock);
            
            editDistances[j] += editDist;

            lastBlock = nextBlock;
        }

        editDistances[j] /= (j * depth * 4);
    }

    return editDistances;
}


CT.objectToSortedArray = function(sortMe, limit, smallestToLargest) {
    if(!limit)
        limit = 3;

    console.log(sortMe);

    var sortMeLength = 0;
    for (key in sortMe)
        sortMeLength++;

    var out = [];
    for (var i = 0; (!limit || i < limit) && i < sortMeLength; i++) {
        var currentTopVal = -1;
        var currentTopKey;
        for (var key in sortMe) {
            var keyVal = sortMe[key];

            if(keyVal !== undefined) {
                var moreTop;
                if(currentTopVal == -1)
                    moreTop = true;
                else if(smallestToLargest !== true)
                    moreTop = keyVal > currentTopVal;
                else
                    moreTop = keyVal < currentTopVal;

                if(moreTop) {
                    currentTopKey = key;
                    currentTopVal = keyVal;
                    sortMe[key] = undefined;
                }
            }
        }

        console.log(currentTopKey, currentTopVal);
        if(currentTopKey != undefined)
            out.push(currentTopKey);
        else
            i = sortMe.length;
    }

    return out;
}



var FEEL_GOOD_INC_LYRICS = "Gorillaz - Feel Good Inc\n"
+"City's breaking down on a camel's back\n"
+"They just have to go 'cause they don't know whack\n"
+"So all you fill the streets it's appealing to see\n"
+"You won't get out the county, 'cause you're bad and free\n"
+"You've got a new horizon It's ephemeral style\n"
+"A melancholy town where we never smile\n"
+"And all I want to hear is the message beep\n"
+"My dreams, they've got to kiss, because I don't get sleep, no\n"
+"\n"
+"Windmill, Windmill for the land\n"
+"Learn forever hand in hand\n"
+"Take it all in on your stride\n"
+"It is stinking, falling down\n"
+"Love forever love is free\n"
+"Let's turn forever you and me\n"
+"Windmill, windmill for the land\n"
+"Is everybody in?\n"
+"\n"
+"Laughing gas these hazmats, fast cats\n"
+"Lining them up-a like ass cracks\n"
+"Ladies, homies, at the track\n"
+"It's my chocolate attack\n"
+"Shit, I'm stepping in the heart of this here\n"
+"Care bear bumping in the heart of this here\n"
+"Watch me as I gravitate, ha ha ha\n"
+"Yo, we gonna go ghost town\n"
+"This Motown, with yo sound\n"
+"You're in the place\n"
+"You gonna bite the dust\n"
+"Can't fight with us\n"
+"With yo sound, you kill the INC\n"
+"So don't stop, get it, get it\n"
+"Until you're cheddar header\n"
+"Yo, watch the way I navigate, ha ha ha\n"
+"\n"
+"Windmill, windmill for the land\n"
+"Turn forever hand in hand\n"
+"Take it all in on your stride\n"
+"It is stinking, falling down\n"
+"Love forever love is free\n"
+"Let's turn forever you and me\n"
+"Windmill, windmill for the land\n"
+"Is everybody in?\n";




var MAC_DRE_LYRICS = "'Something You Should Know'\n"
+"\n"
+"Ah, ah, ah. Wha...\n"
+"\n"
+"When I got the phone call I was rollin on the interstate\n"
+"'Dre have you ate yet? Hows bout a dinner date? '\n"
+"Hmm? I don't know, lemme check my schedgy\n"
+"I'm free at 8:30 pick me up when your redgy\n"
+"\n"
+"Hopped out the Chevy, so I can freshen up\n"
+"Rolled the sack in the back and threw my weapon up\n"
+"Pored a glass of 7up and ate a quick snack\n"
+"Salami and swiss piled on a ritz crack\n"
+"Called the cunt bitch back 'Wassup Alice? '\n"
+"She got the madder said 'My name's not Alice! '\n"
+"'Alright ALICE, pick me up from my palace. I live in Westlin, I know you know where that is'\n"
+"'That's where my dad lives, be there in a Jiffy'\n"
+"Threw on some one fifties and my red Ken Griffy\n"
+"T-shirt crispy, I'm dipped as usual\n"
+"Shaved with the Andis electric reusable\n"
+"Threw in my removable iced out grill\n"
+"So when I spit my spill is chilly chill\n"
+"I'm really I'll, really feel, really Mac-ish\n"
+"I'm waiting fo the bitch and I'm puffin on some cat piss\n"
+"'Damn, where you at bitch' I started thinkin\n"
+"Baby pulls up in a Aviator Lincoln\n"
+"Grab me thumb tank cause they won't catch me leaking\n"
+"Cause punks hangin tryin to bang\n"
+"Every weekend\n"
+"\n"
+"I started speakin 'That's a hella'of car' I said 'Where we eating' she said 'The Elephant Bar'\n"
+"Ta hell if we are, I'd rather Benny Hannas'\n"
+"She said 'What's that for? ' I said 'For any drama'\n"
+"Now look little mama is a quarter to ten\n"
+"Can't be out all night\n"
+"I gotta stop when the song end\n"
+"\n"
+"At the restaurant I'm feelin like the man\n"
+"Spoke Japan gave me mugu guy pan\n"
+"Ate, drank, got full an burped\n"
+"I said 'Allright you beezy it's time to curt'\n"
+"\n"
+"Dipped to her spot that was tucked in the cut\n"
+"Put dick thru the tock\n"
+"And I busted the nut\n"
+"Then I busted the nut one mo' gain\n"
+"Then I busted the nut on the hoe chin\n"
+"Now here we go again\n"
+"Another fiasco\n"
+"I'm diggin her out, while I'm playen with her ass hole\n"
+"\n"
+"Fuck bein bashful, baby I'm a pash pro\n"
+"She said 'Dre I'll give you anythin you ax fo''\n"
+"You got class hoe\n"
+"Now look\n"
+"Pay close attention I'm gonna sing the hook:\n"
+"\n"
+"[CHORUS:]\n"
+"Befound I give you some mo'(befound I give you some mo')There's something that you must know(there's something that you must know)I'm a pimp and I got hoes(I'm a pimp and I got hoes)Can't fuck fo free no mo', no mo', no mo \n";


// console.log(CT.hexToBase64("49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d"));




// NUM_PILES = 8;
// PILE_OFFSET = 5;
// NUM_SHUFFLES = 5;



// CT.encrypt = function (encryptMe, key) {
//     // var blocks = new Uint8Array(encryptMe.length);

//     // for(var i = 0; i < encryptMe.length; i++) {
//     //     // var char = 
//     //     // blocks.set([char], i);
//     //     blocks[i] = encryptMe.charCodeAt(i);
//     // }

//     console.log(encryptMe);

//     var blocks = '';
//     for(var i in encryptMe) {
//         blocks += encryptMe.charCodeAt(i).toString(16);
//     }

//     for(var i = 0; i < NUM_SHUFFLES; i++)
//         blocks = CT.shuffle(blocks, NUM_PILES, PILE_OFFSET);

//     console.log(blocks);
// // 
//     // return blocks;

//     var hex = '';
//     var out = '';
//     for(var i in blocks) {
//         hex += blocks.charAt(i);
//         if(hex.length > 1) {
//             out += String.fromCharCode(parseInt(hex, 16));
//             // blocks[block_index] = parseInt(hex, 16)
//             // block_index++;
//             hex = '';
//         }
//     }

//     return out;

    

//     // var out = "";
//     // for (var i in blocks) {
//     //     out += '' + blocks[i].toString(16);
//     // }

//     // return out;
// }


// CT.shuffle = function(shuffleMe, numPiles, offset, reverse) {
//     if (!numPiles || numPiles < 2)
//         return shuffleMe;

//     else {
//         var piles = [];
//         var pileDraws = [];
//         for(var i = 0; i < numPiles; i++) {
//             piles[i] = '';
//             pileDraws[i] = 0;
//         }


//         for(var i in shuffleMe) {
//             // var pileNum = i % numPiles;
//             var pileNum = reverse ? numPiles - 1 - i : i;
//             pileNum %= numPiles;
//             // piles[pileNum].push(shuffleMe.charAt(i));
//             var targetChar = reverse ? shuffleMe.length - 1 - i : i;
//             piles[pileNum] += shuffleMe.charAt(targetChar);
//         }

//         console.log(shuffleMe, piles);

//         var out = '';
//         var allEmpty = false;
//         for (var i = 0; allEmpty == false; i++) {
//             allEmpty = true;

//             for (var p in piles) {

//                 // var pileNum = piles.length - 1 - p;
//                 var pileNum = p;
//                 var pile = piles[pileNum];

                

//                 if(pileDraws[pileNum] < pile.length ) {
//                     allEmpty = false;
//                     // console.log(pileDraws[p]);

//                     pileDraws[pileNum]++;
//                     var charIndex = (pile.length * 50 + i + p * offset) % pile.length;

//                     // console.log(charIndex);
//                     out += pile[charIndex];
//                 }
//             }
//         }

//         return out;

//         // return out;
//         // var out = '';
//         // var allEmpty = false;
//         // for (var i = 0; allEmpty == false; i++) {
//         //     allEmpty = true;
//         //     for (var p in piles) {
//         //         var pile = piles[p];
//         //         if(pile.length > 1) {
//         //             allEmpty = false;

//         //             var offset = p * offset;
//         //             var index = (i + offset) % pile.length;
//         //             out += pile.splice(i, 1); 
//         //         }
//         //     }
//         // }

//         // return out;
//     }
// }




// CT.decrypt = function (decryptMe, key) {
//     var blocks = '';
//     for(var i in decryptMe) {
//         blocks += decryptMe.charCodeAt(i).toString(16);
//     }

//     for(var i = 0; i < NUM_SHUFFLES; i++)
//         blocks = CT.shuffle(blocks, NUM_PILES, -PILE_OFFSET);

//     var hex = '';
//     var out = '';
//     for(var i in blocks) {
//         hex += blocks.charAt(i);
//         if(hex.length > 1) {
//             out += String.fromCharCode(parseInt(hex, 16));
//             hex = '';
//         }
//     }
//     return out;
// }


// CT.test = function(testMe) {
//     var test = CT.encrypt(testMe);
//     console.log(test)
//     console.log(CT.decrypt(test));
// }


// CT.test(".testy");



 





