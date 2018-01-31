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
	}

	setValveOpen(i_valveOpen) {
		console.log("valveOpen", i_valveOpen);
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
			// console.log("painting");
			this.isCleared = false;
			painter.fillStyle = 'green';
			const x = this.x - (this.width / 2);
			const height = this.width * HEIGHT_OVER_WIDTH;
			const y = this.y - height;

			const imgX = (this.spriteFrame % 6) * SPRITE_PX_WIDTH;
			const imgY = ~~(this.spriteFrame / 6) * SPRITE_PX_HEIGHT;

			painter.drawImage(img, imgX, imgY, SPRITE_PX_WIDTH, SPRITE_PX_HEIGHT, x, y, this.width, height);
			// painter.drawImage(img, imgX, imgY, SPRITE_PX_WIDTH, SPRITE_PX_HEIGHT, 50, 50, 200, 200);
			// painter.fillRect(
		}
	}
}

class FlameFX {
	constructor(nozzlePoints) {
		this.booshes = [];
		this.isBooshing = false;
		for (const nozzlePoint of nozzlePoints) {
			this.booshes.push(new Boosh(nozzlePoint));
		}
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
		console.log(booshNum, valveOpen);
		const boosh = this.booshes[booshNum];
		if (boosh) boosh.setValveOpen(valveOpen);
	}
}