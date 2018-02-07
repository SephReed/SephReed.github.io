PATTERNS = window.localStorage.getItem("PATTERNS");
if (PATTERNS === undefined) {
	PATTERNS = {};
}

SAVE_TIMEOUT = 1000; // ms

class PatternSequence {
	constructor(objOrName) {
		let obj;
		if (typeof objOrName === "object") {
			obj = objOrName;
			if (PATTERNS[obj.name] !== undefined) {
				alert("Loading pattern with same name as previous.  Appending Number");
				for (let i = 0; i < 100; i++) {
					if (PATTERNS[obj.name+i] === undefined) {
						obj.name += i;
						break;
					}
				}
			}
		} else if (typeof objOrName === "string") {
			obj = PATTERNS[objOrName];
			if (obj === undefined) {
				obj = {
					name: name,
					patterns: [],
				}
			}
		}

		for (const key in obj) {
			this[key] = obj[key];
		}

		this.saved = true;
		this.saveTimeout = undefined;
		this.patterns.forEach((pattern) => {
			pattern.onChange(() => { this.triggerBackupWatcher(); })
		})
	}

	triggerBackupWatcher() {
		if (this.saveTimeout !== undefined) {
			window.clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = window.saveTimeout(() => {
			this.save();
			this.saveTimeout = undefined;
		}, SAVE_TIMEOUT)

		this.saved = false;
	}

	save() {
		const out = {};
		out.name = this.name;
		out.patterns = this.patterns.map((pattern) => pattern.toWritable());
		PATTERNS[out.name] = out;
		window.localStorage.getItem("PATTERNS", PATTERNS);
	}

	insertPattern(pattern, afterMe) {
		const target = this.patterns.indexOf(afterMe);
		this.patterns.splice(target + 1, 0, pattern);
		this.triggerBackupWatcher();
	}

	appendPattern(pattern) {
		this.patterns.push(pattern);
		this.triggerBackupWatcher();
	}
}










