


class Modals {
	ownDomNode(domNode) {
		if (domNode === undefined) {
			throw new Error("Must not be undefined");
		}
		console.log(domNode);
		this.domNode = domNode;
		document.body.addEventListener("mousedown", () => this.hideAll());
	}

	hide(cssQueryOrNode) {
		this._setState(cssQueryOrNode, false);
	}

	show(cssQueryOrNode) {
		this._setState(cssQueryOrNode, true);
	}

	showOrHide(cssQueryOrNode) {
		this._setState(cssQueryOrNode, "switch");
	}

	_setState(cssQueryOrNode, state) {
		let target;

		if (typeof cssQueryOrNode === "string") {
			switch (cssQueryOrNode[0]) {
				case ".":
					break;
				case "#":
					target = El.byID(cssQueryOrNode); break;
				default: 
					target = El.byTag(cssQueryOrNode); break;
			}
		} else {
			target = cssQueryOrNode;
		}

		let style;
		try {
			style = window.getComputedStyle(target);
		} catch {
			console.log(target)
			throw new Error("Bad target", target);
		}
		if (state === "switch") {
			state = !(style.display === "block");
		}
		target.style.display = state ? "block" : "none";
	}

	hideAll() {
		if (this.domNode) {
			Array.from(this.domNode.childNodes)
				.filter((child) => child.nodeType === Node.ELEMENT_NODE)
				.map((child) => this.hide(child))
		}
	}
}




