const BOOSH_SPRITE_MS_INTERVAL = 20;
const NUM_BOOSH_SPRITE_FRAMES = 6 * 6;
const HEIGHT_OVER_WIDTH = 933 / 600;
const MAX_BOOSH_WIDTH = 120;
const PX_GROWTH_PER_MS = MAX_BOOSH_WIDTH / 10.0;
const PX_SHRINK_PER_MS = MAX_BOOSH_WIDTH / 300.0;

const GAS_BURN_OFF_RATIO_PER_MS = 0.004;		// fire linger
const GAS_REALESE_PER_MS_SMALL = .2;   			// speed of empty
const PX_PER_GAS = 3;											// size of fire

const EMPTY_HUE = 0;
const FULL_HUE = .4;


var img = new Image();
img.addEventListener('load', () => {
  SPRITE_PX_WIDTH = img.naturalWidth / 6;
  SPRITE_PX_HEIGHT = img.naturalHeight / 6;
}, false);
img.src = 'public/boosh_sprite_medium.png';

class Accumulator {
	constructor(size, fillSpeed) {
		this.fillLevel = 0;
		this.size = size;
		this.fillSpeed = fillSpeed;
		this.lastUpdateTime = Date.now();
	}

	ownDomNode($accumulator) {
		let $container = document.createElement("gas-meter-container");
		$accumulator.appendChild($container);

		this.$meter = document.createElement("gas-meter");
		$container.appendChild(this.$meter);
	}

	requestGas(requestAmount) {
		const out = Math.min(this.fillLevel, requestAmount);
		this.fillLevel = Math.max(0, this.fillLevel - requestAmount);
		return out;
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
			const ratio = (this.fillLevel/this.size);
			this.$meter.style.height = ratio * 100 + "%";	

			const hue = EMPTY_HUE + (ratio * (FULL_HUE - EMPTY_HUE));
			const color = hsvToRgb(hue, .75, 1);
			this.$meter.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		}
	}
}








class Boosh {
	constructor(nozzlePoint) {
		this.x = nozzlePoint.x;
		this.y = nozzlePoint.y;
		this.width = 0;
		this.burningGasAmount = 0;
		this.gasReleaseRate = GAS_REALESE_PER_MS_SMALL;

		this.valveOpen = false;

		this.lastUpdateTime;
		this.startTime = Date.now();
		this.spriteFrame = 0;

		this.isCleared = true;
		this.accumulator = new Accumulator(100, 0.04);
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
				if (this.valveOpen) {
					const potentialReleaseAmount = dms * this.gasReleaseRate;
					this.burningGasAmount += this.accumulator.requestGas(potentialReleaseAmount);
				}

				const gasLossRatio = 1 - (GAS_BURN_OFF_RATIO_PER_MS * dms);
				this.burningGasAmount = Math.max(0, this.burningGasAmount * gasLossRatio);

				this.width = this.burningGasAmount * PX_PER_GAS;

				// this.width += this.valveOpen ? PX_GROWTH_PER_MS * dms : -PX_SHRINK_PER_MS * dms;
				// this.width = Math.max(0, Math.min(this.width, MAX_BOOSH_WIDTH));
			}
			this.lastUpdateTime = time;
		}
		this.accumulator.update(time);
	}

	clear(painter) {
		if(this.isCleared === false) {
			const x = this.x - (this.width / 2);
			const height = this.width * HEIGHT_OVER_WIDTH;
			const y = this.y - height;
			painter.clearRect(x, y, this.width, height);
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

	ownDomNode($preview) {
		$preview.tabIndex = "0";
		const booshStateFromKey = (key, state) => {
			const number = parseInt(key);
			if (isNaN(number) === false) {
				fx.setBooshState(number - 1, state);
			}
		}
		$preview.addEventListener("keydown", (event) => booshStateFromKey(event.key, true));
		$preview.addEventListener("keyup", (event) => booshStateFromKey(event.key, false));
	}

	ownPreviewCanvas($canvas) {
		const painter = $canvas.getContext('2d');

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