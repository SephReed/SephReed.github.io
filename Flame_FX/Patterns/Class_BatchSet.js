
class BatchSet extends Pattern {
	constructor(setupData) {
		super("BatchSet", setupData || {
			setValveOpen: fx.booshes.map(() => true)
		})
	}

	createDomNode() {
		const domNode = document.createElement("BatchSet");
		this.data.setValveOpen.forEach((valveIsOpen, booshNum) => {
			const addMe = document.createElement("input");
			addMe.addEventListener("change", () => {
				this.data.setValveOpen[booshNum] = addMe.checked;
				this._emitChange();
			})
			addMe.type = "checkbox";
			if (valveIsOpen) {
				addMe.checked = true;
			}
			addMe.textContent = booshNum;
			domNode.appendChild(addMe);
		})
		return domNode;
	}

	createStyleNode() {
		const styleNode = document.createElement("style");
		styleNode.innerHTML = `
			BatchSet {
				display: flex;
				flex-direction: row;
			}

			BatchSet > input {
				display: block;
				flex: 1;
			}
			`
		return styleNode;
	}
}

PATTERN_SELECTOR.register(BatchSet);