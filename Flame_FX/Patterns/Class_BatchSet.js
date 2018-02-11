
class BatchSet extends Pattern {
	constructor(setupData) {
		super("BatchSet", setupData || {
			setValveOpen: FLAME_SETUP.map(() => true)
		})
	}
}

PATTERN_SELECTOR.register(BatchSet);