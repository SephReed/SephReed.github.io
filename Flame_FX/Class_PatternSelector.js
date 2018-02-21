

class PatternSelector {
	constructor() {
		this.patterns = {};
		this.patterns.list = [];
		this.patterns.byName = {};
	}

	ownDomNode(domNode) {
		this.domNode = domNode;
		this.patterns.list.forEach((pattern) => this.appendPatternChoice(pattern));
	}

	appendPatternChoice(pattern) {
		if (this.domNode) {
			const addMe = document.createElement("add-pattern");
			addMe.textContent = pattern.name;
			addMe.addEventListener("click", () => {
				console.log("adding", pattern.name);
				sequencer.appendPattern(new pattern());
			});
			this.domNode.appendChild(addMe);
		}
	}

	register(pattern) {
		this.patterns.list.push(pattern);
		this.patterns.byName[pattern.name] = pattern;
		this.appendPatternChoice(pattern);
	}
}


const patternTemplate = document.createElement("pattern");
patternTemplate.innerHTML = `
	<timing>
		<input type="checkbox" />
		<input type="text" />
	</timing>
`;

document.addEventListener("DOMContentLoaded", () => {
	const style = document.createElement("style");
	style.innerHTML = `
		pattern {
			display: flex;
			flex-direction: row;
		}

		timing {
			display: block;
			flex-basis: 100px;
			flex-grow: 0;
			flex-shrink: 0;
		}

		pattern > *:last-child {
			flex: 1;
		}
	`;
	document.head.appendChild(style);
});


class Pattern {
	constructor(name, data) {
		this.data = data || {};
	}

	toWritable() {
		return JSON.stringify(this.data);
	}

	get domNode() {
		if (this._domNode === undefined) {
			this._domNode = patternTemplate.cloneNode(true);
			this._domNode.appendChild(this.createDomNode());
			if (this.createStyleNode) {
				document.head.appendChild(this.createStyleNode());	
			}
		}
		return this._domNode;
	}
}

PATTERN_SELECTOR = new PatternSelector();