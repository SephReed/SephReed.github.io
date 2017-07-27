	



PINE.loadbar = function(bgColor, fadeTime, showLoadbar) {

	var addStyle = document.createElement('style');
	addStyle.textContent = `
		@keyframes loadBarGrow {
			0% { width: 50px; }
			100% { width: 100%; }
		}

		appinitLoadbar {
			display: block;
			position: fixed;
			top: 0px;
			left: 0px;
			overflow: hidden;
			white-space: nowrap;
			animation: loadBarGrow 7s;
			animation-direction: alternate;
			animation-iteration-count: 2;
			animation-fill-mode: forwards;
			z-index: 1000;
		}

			body .hideOnLoad {
				transition: opacity `+(fadeTime || 1)+`s ease;
			}

			body.fadingIn .hideOnLoad {
				opacity: 0;
				pointer-events: none;
			}

			body.loaded .hideOnLoad {
				display: none;
			}

		
		`


	U.docReady(function() {
		document.body.classList.add("loading");
		document.body.appendChild(addStyle);
		var loadBar = document.createElement("appinitLoadbar");
		loadBar.classList.add("hideOnLoad");
		loadBar.textContent = "Loading..................................."
			+	"........................................................"
			+	"........................................................"
			+	"........................................................"
			+	"........................................................"
		document.body.appendChild(loadBar);
	})



	window.setTimeout(function(){
		PINE.signalNeedMet("LOAD_TIME_MIN")
	}, 1500)

	PINE.waitForNeed(["PINE_READY", "LOAD_TIME_MIN"], function() {
		document.body.classList.add("fadingIn");
		document.body.classList.remove("loading");

		window.setTimeout(function(){
			document.body.classList.add("loaded");
			document.body.classList.remove("fadingIn");
		}, ~~(1000 * fadeTime));
		
	});
			
}

