
const Local = {};

Local.getSet = (name, value) => {
	if (value !== undefined) {
		window.localStorage.setItem(name, JSON.stringify(value));
	} else {
		const data = window.localStorage.getItem(name);
		if (data) {
			return JSON.parse(data);
		}
	}
};

Local.project = (name, value) => {
	return Local.getSet("project_"+name, value);
};

Local.lastOpen = (value) => {
	return Local.getSet("lastOpen", value);
}


const SAVE_TIMEOUT = 200; // ms

class PatternSequence {
	constructor() {
		let obj;
		if (Local.lastOpen !== undefined) {
			obj = Local.project(Local.lastOpen());
		} 

		if (obj === undefined) {
			obj = {
				name: "Untitled",
				sequence: [],
			}
		}

		this.saveTimeout = undefined;
		this.load(obj);
	}

	ownDomNode(ownMe) {
		this.domNode = ownMe;
		this.sequence.forEach((pattern) => {
			this.domNode.appendChild(pattern.domNode);
		})
	}

	triggerBackupWatcher() {
		console.log("unsaved changes")
		if (this.saveTimeout !== undefined) {
			window.clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = window.setTimeout(() => {
			console.log("saved")
			this.save();
			this.saveTimeout = undefined;
		}, SAVE_TIMEOUT)

		this.saved = false;
	}

	load(saveObj) {
		for (const key in saveObj) {
			this[key] = saveObj[key];
		}

		Local.lastOpen(this.name);

		this.saved = true;
		this.sequence = this.sequence.map((pattern) => {
			console.log(pattern, pattern.name);
			const patternClass = new PATTERN_SELECTOR.patterns.byName[pattern.name](pattern);
			patternClass.onChange(() => { this.triggerBackupWatcher(); })
			return patternClass;
		})
	}

	save() {
		const out = {};
		out.name = this.name;
		out.sequence = this.sequence.map((pattern) => {
			return pattern.data;
		});
		this.saved = true;
		Local.project(out.name, out);
	}

	insertPattern(pattern, afterMe) {
		const target = this.sequence.indexOf(afterMe);
		if (this.domNode) {
			this.domNode.insertAfter(pattern.domNode, target.domNode);
		}
		this.sequence.splice(target + 1, 0, pattern);
		this.triggerBackupWatcher();
	}

	appendPattern(pattern) {
		this.sequence.push(pattern);
		if (this.domNode) {
			this.domNode.appendChild(pattern.domNode);
		}
		this.triggerBackupWatcher();
	}
}










