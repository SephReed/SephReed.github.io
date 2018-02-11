BOOSH_SPRITE_MS_INTERVAL = 20;
NUM_BOOSH_SPRITE_FRAMES = 6 * 6;
HEIGHT_OVER_WIDTH = 933 / 600;
MAX_BOOSH_WIDTH = 120;
PX_GROWTH_PER_MS = MAX_BOOSH_WIDTH / 10.0;
PX_SHRINK_PER_MS = MAX_BOOSH_WIDTH / 300.0;


var img = new Image();
img.addEventListener('load', () => {
  SPRITE_PX_WIDTH = img.naturalWidth / 6;
  SPRITE_PX_HEIGHT = img.naturalHeight / 6;
}, false);
img.src = 'public/boosh_sprite_medium.png';


class Accumulator {
	constructor(size, emptySpeed, fillSpeed) {
		this.fillLevel = 0;
		this.size = size;
		this.emptySpeed = emptySpeed;
		this.fillSpeed = fillSpeed;
		this.lastUpdateTime = Date.now();
	}

	ownDomNode($accumulator) {
		let $container = document.createElement("gas-meter-container");
		$accumulator.appendChild($container);

		this.$meter = document.createElement("gas-meter");
		$container.appendChild(this.$meter);
	}

	update(time) {
		if (this.fillLevel < this.size) {
			const dt = time - this.lastUpdateTime;	
			this.fillLevel += dt * this.fillSpeed;
			this.fillLevel = Math.min(this.fillLevel, this.size);
		}
		this.lastUpdateTime = time;
	}

	repaint() {
		if (this.$meter) {
			const height = (this.fillLevel/this.size) * 100;
			this.$meter.style.height = height + "%";	
		}
	}
}








class Boosh {
	constructor(nozzlePoint) {
		this.x = nozzlePoint.x;
		this.y = nozzlePoint.y;
		this.width = 0;

		this.valveOpen = false;

		this.lastUpdateTime;
		this.startTime = Date.now();
		this.spriteFrame = 0;

		this.isCleared = true;
		this.accumulator = new Accumulator(100, 2, 0.1);
	}

	setValveOpen(i_valveOpen) {
		this.valveOpen = i_valveOpen;

		if (this.hasFlame() === false && this.valveOpen) {
			this.lastUpdateTime = Date.now();
		}
	}

	hasFlame() {
		return this.width > 0;
	}

	update(time) {
		if (this.hasFlame() || this.valveOpen) {
			
			this.spriteFrame = ((time - this.startTime) / BOOSH_SPRITE_MS_INTERVAL);
			this.spriteFrame = Math.floor(this.spriteFrame) + this.x;
			this.spriteFrame %= NUM_BOOSH_SPRITE_FRAMES;

			const dms = (time - this.lastUpdateTime);
			if (dms > 0) {
				this.width += this.valveOpen ? PX_GROWTH_PER_MS * dms : -PX_SHRINK_PER_MS * dms;
				this.width = Math.max(0, Math.min(this.width, MAX_BOOSH_WIDTH));
			}
			this.lastUpdateTime = time;
		}
		this.accumulator.update(time);
	}

	clear(painter) {
		if(this.isCleared === false) {
			const x = this.x - (MAX_BOOSH_WIDTH / 2) - 2;
			const height = MAX_BOOSH_WIDTH * HEIGHT_OVER_WIDTH;
			const y = this.y - height - 2;
			painter.clearRect(x, y, MAX_BOOSH_WIDTH + 4, height + 4);
			this.isCleared = true;
		}
	}

	paint(painter) {
		if (this.hasFlame()) {
			this.isCleared = false;
			painter.fillStyle = 'green';
			const x = this.x - (this.width / 2);
			const height = this.width * HEIGHT_OVER_WIDTH;
			const y = this.y - height;

			const imgX = (this.spriteFrame % 6) * SPRITE_PX_WIDTH;
			const imgY = ~~(this.spriteFrame / 6) * SPRITE_PX_HEIGHT;

			painter.drawImage(img, imgX, imgY, SPRITE_PX_WIDTH, SPRITE_PX_HEIGHT, x, y, this.width, height);
		}
		this.accumulator.repaint();
	}
}







class FlameFX {
	constructor(nozzlePoints) {
		this.booshes = [];
		this.isBooshing = false;
		nozzlePoints.forEach((nozzlePoint, index) => {
			this.booshes.push(new Boosh(nozzlePoint));
		});
	}

	ownPreviewDomNode($preview) {
		const booshStateFromKey = (key, state) => {
			const number = parseInt(key);
			if (isNaN(number) === false) {
				fx.setBooshState(number - 1, state);
			}
		}
		$preview.addEventListener("keydown", (event) => booshStateFromKey(event.key, true));
		$preview.addEventListener("keyup", (event) => booshStateFromKey(event.key, false));

		const painter = $preview.getContext('2d');

		let animationRequest = undefined;
		const animate = () => {
			fx.clear(painter);
			fx.paint(painter);
			animationRequest = window.requestAnimationFrame(animate);
		}
		animate();
	}

	ownGasUsesDomNode($gasUse) {
		this.booshes.forEach((boosh, index) => {
			console.log("test");
			const $accumulator = document.createElement("accumulator");
			$gasUse.appendChild($accumulator);
			boosh.accumulator.ownDomNode($accumulator);

			$accumulator.appendChild(document.createElement("br"))
			$accumulator.appendChild(document.createTextNode(index + 1));
		})
	}

	clear(painter) {
		this.booshes.forEach((boosh) => boosh.clear(painter));
	}

	paint(painter) {
		const time = Date.now();
		this.booshes.forEach((boosh) => {
			boosh.update(time);
			boosh.paint(painter);
		});
	}

	setBooshState(booshNum, valveOpen) {
		const boosh = this.booshes[booshNum];
		if (boosh) boosh.setValveOpen(valveOpen);
	}
}