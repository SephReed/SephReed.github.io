class SequenceReader {
	ownDomNode(domNode) {
		this.domNode = domNode;
		this.stop();


		El.byTag(this.domNode, "play-pause").addEventListener("click", () => {
			console.log("here")
			this.playPause();
		});

		El.byTag(this.domNode, "stop").addEventListener("click", () => {
			this.stop();
		});
	}

	stop() {
		this._setIsPlaying(false);
		this.patternIndex = 0;
		this.timeoutForNextPattern = undefined;
	}

	playPause() {
		this._setIsPlaying(!this.isPlaying);
	}

	_setIsPlaying(isPlaying) {
		this.isPlaying = isPlaying;
		if (isPlaying) {
			this.domNode.classList.add("is_playing");
		} else {
			this.domNode.classList.remove("is_playing");
		}
	}
}