var FL = {};









//The data handler keeps track of each step in the analysis of the data
FL.class = {};
FL.class.DataHandler = function(dataSet) {
	this.data = dataSet;
	this.relations = {};
}




//Compute relation reorganizes all the data to be relative to a target item ("responded")
FL.class.DataHandler.prototype.computeRelation = function(targetName) {
	if(this.relations[targetName] && this.relations[targetName].basic) return;

	var data = this.data;	

	this.relations[targetName] = {};
	var baselines = this.relations[targetName].baseline = {};


	for(var i = 0; i < data.length; i++) {
		var outcome = data[i][targetName];
		if(baselines[outcome] === undefined) {
			baselines[outcome] = {};
			baselines[outcome].count = 0;
		}
		baselines[outcome].count++;
	}

	for(var outcome in baselines)
		baselines[outcome].percentage = baselines[outcome].count /data.length;

	var targetOutcomes = this.relations[targetName].basic = {};

	for(var i = 0; i < data.length; i++) {
		var checkMe = data[i];
		var targetVal = checkMe[targetName]+'';

		if(targetOutcomes[targetVal] == undefined) {
			targetOutcomes[targetVal] = {};
			targetOutcomes[targetVal]._overallCount = 0;
		}

		var targetCase = targetOutcomes[targetVal];
		targetCase._overallCount++;

		for(var label in checkMe) {
			if(label != targetName) {

				var val = checkMe[label];

				if(targetCase[label] == undefined) {
					if(typeof val == "number") 
						targetCase[label] = [];
					else
						targetCase[label] = {};				
				}

				var labelCase = targetCase[label];
				
				if(typeof val == "number") 
					labelCase.push(val);

				else {
					val += "";
					if(labelCase[val] == undefined)
						labelCase[val] = 0;

					labelCase[val]++;
				}
			}
		}
	}

	console.log(targetOutcomes);
	return targetOutcomes;
}









//Turn all the numerical relations into means
//turn all the field choice relations into ratios
FL.class.DataHandler.prototype.simplifyRelation = function(relation) {
	var relativeData = this.relations[relation].basic;
	var simplifiedRelations = this.relations[relation].simplified = {};

	for(outcome in relativeData) {
		if(itemName != "_overallCount") {
			simplifiedRelations[outcome] = {};
			var items = relativeData[outcome];
			var totalCases = items._overallCount;

			for(var itemName in items) {
				if(itemName != "_overallCount") {

					var cases = items[itemName];

					if(cases.length) {
						cases.sort();

						var avgSpacing = 0;
						var steps = 0;
						for(var i = 1; i < cases.length; i++) {
							var spacing = cases[i] - cases[i-1];
							if(spacing != 0) {
								avgSpacing += spacing;
								steps++;
							}
						}
						
						avgSpacing /= steps;

						//only somewhat effective for linear data, overall a quick but sloppy means
						var dissectionThreshold = Math.abs(avgSpacing * 10);
						
						var currentChunk = 0;
						var chunks = [];

						for(var i = 0; i < cases.length; i++) {
							if(i > 0) {
								var spacing = cases[i] - cases[i-1];
								if(Math.abs(spacing) > dissectionThreshold)
									currentChunk++;
							}

							if(chunks[currentChunk] === undefined)
								chunks[currentChunk] = [];
							
							chunks[currentChunk].push(cases[i]);
						}

						var out = [];
						for(var m in chunks) {
							var curve = FL.getNormalCurve(chunks[m]);
							// curve.emphasis = chunks[m].length / totalCases;
							curve.emphasis = curve.count = chunks[m].length;
							out.push(curve);
						}
						
						simplifiedRelations[outcome][itemName] = out;
					}
					else {
						simplifiedRelations[outcome][itemName] = {};
						for(var caseName in cases) {
							var count = cases[caseName];
							simplifiedRelations[outcome][itemName][caseName] = count/totalCases;
						}
					}
				}

			}
		}
	}

	console.log(simplifiedRelations);
	return simplifiedRelations;
}











//Compare and contrast the consistency of getting a certain result for each answer
//give a clue rating based off the scale of difference and the 
FL.class.DataHandler.prototype.observeDiffs = function(relation) {

	var diffs = this.relations[relation].diffs = {};

	
	var simplified = this.relations[relation].simplified;
	//Cheating
	var factors = simplified.yes;

	var maxClue = 0;
	var clueSum = 0;

	var recordClueVal = function(clueVal) {
		if(maxClue < clueVal)
			maxClue = clueVal;

		clueSum += clueVal;
	}


	for(var factor in factors) {

		diffs[factor] = {};
		var cases = factors[factor];


		if(cases.length) {
			var mostEmphasised = {};
			for(var outcome in simplified) {
				for(var curveNum in simplified[outcome][factor]) {
					var curve = simplified[outcome][factor][curveNum];
					if(mostEmphasised[outcome] == undefined || curve.emphasis > mostEmphasised[outcome].emphasis)
						mostEmphasised[outcome] = curve;
				}
			}

			// var totalEmphasis = 0;
			// for(var outcome in mostEmphasised) 
			// 	totalEmphasis += mostEmphasised[outcome].emphasis;
			

			//cheating
			var addMe = {};
			addMe.isCurves = true;
			addMe.yes = mostEmphasised.yes.mean;
			addMe.no = mostEmphasised.no.mean;

			addMe.diff = mostEmphasised.yes.emphasis / mostEmphasised.no.emphasis;
			addMe.emphasis = (mostEmphasised.yes.emphasis+mostEmphasised.no.emphasis)/(2*this.data.length);
			addMe.emphasis /= 100;
			addMe.clueVal = addMe.diff < 0 ? 1/addMe.diff : addMe.diff;
			addMe.clueVal *= addMe.emphasis;
			recordClueVal(addMe.clueVal);

			diffs[factor] = addMe;
		}
		else {
			for(var valueCase in cases) {
				//cheating
				var yesCount = simplified.yes[factor][valueCase];
				var noCount = simplified.no[factor][valueCase];

				var addMe = {};
				addMe.diff = yesCount/noCount;
				addMe.emphasis = yesCount/this.data.length;
				addMe.clueVal = addMe.diff < 0 ? 1/addMe.diff : addMe.diff;
				addMe.clueVal *= addMe.emphasis;
				recordClueVal(addMe.clueVal);

				diffs[factor][valueCase] = addMe;
			}
		}
	}


	diffs._clueValSum = clueSum;
	diffs._maxClueVal = maxClue;

	console.log("diffs", diffs)
	console.log(clueSum, maxClue);
}









FL.class.DataHandler.prototype.createRuleset = function(relation) {
	var diffs = this.relations[relation].diffs;

	var clues = {};

	var maxClue = diffs._maxClueVal;
	var clueSum = diffs._clueValSum;
	var maxClueSquare = maxClue * maxClue;

	var relativeClueSum = 0;

	for(var label in diffs) {
		if(label != "_clueValSum" && label != "_maxClueVal") {
			clues[label] = {}

			if(diffs[label].isCurves !== true) {
				for(var valueName in diffs[label]) {
					var item = diffs[label][valueName]
					var val = item.clueVal;
					val /= maxClue;
					// val *= val;
					clues[label][valueName] = val;
					relativeClueSum += val;
				}			
			}
			else {
				var item = diffs[label];
				var val = item.clueVal;
				val /= maxClue;
				// val *= val;
				clues[label] = val;
				relativeClueSum += val;
			}
		}
	}


	var out = {};
	var totalPercent = 0;

	for(var label in clues) {
		out[label] = {}

		if(diffs[label].isCurves !== true) {
			for(var valueName in diffs[label]) {
				var clueFor = diffs[label][valueName].diff > 1 ? "yes" : "no";
				var percentage = clues[label][valueName]/relativeClueSum;
				percentage *= this.relations[relation].baseline[outcome].percentage;
				totalPercent += percentage;
				out[label][valueName] = [percentage, clueFor];
			}
		}
		else {
			out[label].yes = diffs[label].yes;
			out[label].no = diffs[label].no;

			var percentage = clues[label]/relativeClueSum;
			totalPercent += percentage;
			out[label].reward = percentage;
		}
	}


	return new FL.class.RuleSet(out);
	// console.log(clues, relativeClueSum);
	// console.log(totalPercent);
	// console.log(JSON.stringify(out));
	
}




FL.class.RuleSet = function(rewards) {
	this.rewards = rewards;
}


FL.class.RuleSet.prototype.toString = function() {
	var out = "";
	var rewards = this.rewards;
	for(var label in rewards) {
		if(rewards[label].reward) {
			if(out.length)
				out += "\n\n";

			var percentage = (rewards[label].reward * 100).toFixed(2)
			out += "Based off closest mean:"
			out += "\n-yes::["+rewards[label].yes+"]";
			out += "\n-no::["+rewards[label].no+"]";
			out += "\n-reward ::["+percentage+"%]";
		}
		else {
			if(out.length)
				out += "\n\n";

			out += "Switch case for "+label+":"

			for(var valueName in rewards[label]) {

				var reward = rewards[label][valueName];
				var percentage = (reward[0] * 100).toFixed(2)
				out += '\n';
				out += '- "'+valueName+'" add '+percentage+"% chance to "+reward[1];
			}
		}
	}	
	return out;
}


FL.class.RuleSet.prototype.guessFrom = function(data) {
	var normness = this.getNormness(data);
	var result;
	for(var outcome in normness) {
		if(result == undefined || normness[outcome] > normness[result])
			result = outcome;
	}
	return result;
}	

FL.class.RuleSet.prototype.getNormness = function(data) {
	var rewards = this.rewards;
	var outcomes = {};
	outcomes.yes = 0;
	outcomes.no = 0;
	for(var label in data) {
		var rewardCase = rewards[label];

		if(rewardCase) {
			if(rewardCase.reward) {
				var distYes = Math.abs(rewardCase.yes - data[label]);
				var distNo = Math.abs(rewardCase.no - data[label]);
				var outcome = distYes > distNo ? "no" : "yes";
				outcomes[outcome] += rewards[label].reward;
			}
			else {
				var inputCase = data[label];
				var reward = rewardCase[inputCase];
				if(reward != undefined) {
					var percentage = reward[0];
					var outcome = reward[1];
					outcomes[outcome] += percentage;
				}
				else {
					// console.log(inputCase, label)
				}
			}
		}
	}
	return outcomes;
}




















FL.getNormalCurve = function(items) {
	var out = {};

	var sum = 0;
	for(var i in items)
		sum += items[i];

	out.mean = sum/items.length;

	var squares = 0;
	for(var i in items) {
		var diff = items[i] - out.mean;
		squares += diff * diff;
	}
	out.deviation = Math.sqrt(squares/(items.length-1));

	return out;
}