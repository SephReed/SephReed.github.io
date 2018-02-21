
const Local = {};

Local.getSet = (name, value) => {
	if (value !== undefined) {
		window.localStorage.setItem(name, value);
	} else {
		return window.localStorage.getItem(name); 
	}
};

Local.project = (name, value) => {
	return Local.getSet("project_"+name, value);
};

Local.lastOpen = (value) => {
	return Local.getSet("lastOpen", value);
}


const SAVE_TIMEOUT = 1000; // ms

class PatternSequence {
	constructor() {
		let obj;
		if (Local.lastOpen !== undefined) {
			obj = Local.project(Local.lastOpen);
			obj = obj ? JSON.parse(obj) : undefined;
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
		if (this.saveTimeout !== undefined) {
			window.clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = window.setTimeout(() => {
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
		this.sequence.forEach((pattern) => {
			pattern.onChange(() => { this.triggerBackupWatcher(); })
		})
	}

	save() {
		const out = {};
		out.name = this.name;
		out.sequence = this.sequence.map((pattern) => {
			return pattern.toWritable()
		});
		this.saved = true;
		Local.project(out.name, JSON.stringify(out));
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










