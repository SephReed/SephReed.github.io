class SequenceReader {
	ownDomNode(domNode) {
		this.domNode = domNode;
		this.stop();

		El.byTag(this.domNode, "play-pause").addEventListener("click", () => {
			this.playPause();
		});

		El.byTag(this.domNode, "stop").addEventListener("click", () => {
			this.stop();
		});
	}

	stop() {
		this.isPlaying = false;
		this.patternIndex = 0;
		this.timeoutForNextPattern = undefined;
	}

	playPause() {
		this.isPlaying = !this.isPlaying;
	}
}