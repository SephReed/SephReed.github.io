

class PatternSelector {
	constructor() {
		this.patterns = {};
		this.patterns.list = [];
		this.patterns.byName = {};
	}

	ownDomNode(domNode) {
		this.domNode = domNode;
		this.patterns.list.map(this.appendPatternChoice);
	}

	appendPatternChoice(pattern) {

	}

	register(pattern) {
		this.patterns.list.push(pattern);
		this.patterns.byName[pattern.name] = pattern;
		this.appendPatternChoice(pattern);
	}
}


class Pattern {
	constructor(name, data) {
		this.data = data || {};
	}
}

PATTERN_SELECTOR = new PatternSelector();