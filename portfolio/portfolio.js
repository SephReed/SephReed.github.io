
console.log("Hey you! \n\nThanks for taking the time to actually look at my work!  "+
	"It's nice to know you have that much sense, especially if you're thinking of employing me in the future.  "+
	"Honestly, I don't really think many people come looking around here, "+
	"and they probably take most things in life at face value.  "+
	"In other words, I think you're better than most people, by virtue of the fact you are reading this.  "+
	"\n\nI hope you have an amazing day,"+
	"\n-Seph :p");


// var work_btns = document.getElementsByTagName("worktype");
// for (var i = 0; i < work_btns.length; i++) {
// 	var btn = work_btns[i];
// }



var currentlyShown = null;


$(document).ready(function(){
	
	
	$( ".show_item_group > a" ).vclick(function(event) {
		event.preventDefault();

		if(currentlyShown != null) { currentlyShown.hide(); }

		currentlyShown = $($(this).attr("href"));
		currentlyShown.show();
	});


	$( ".rand_turn").each( function(i, elem) {
		var turn = Math.random();
		if(turn > 0.5) { turn = 0.25+ turn%0.5; }
		else { turn = -0.25 - turn; }
		console.log("Radomly turned 'paper' div to "+turn+"deg");
		// console.log(this);
		$(this).css("transform", "rotate("+turn+"deg)");
	});





	/*** Set up Pop In ***/

	var showing_popin = false;
	var $popin = $("#popin_wrapper");

	TweenLite.set($popin, { 
		bottom: -$popin.height(), 
		ease: Power2.easeOut 
	});

	
	$(window).scroll( function() {
		// console.log('e');
		if(showing_popin == false 
			&& currentlyShown != null 
			&& window.scrollY > currentlyShown.offset().top) {
			// && $(document).height() <= ($(window).height() + $(window).scrollTop())) {
			// alert('ey!');
			console.log("e");
			showing_popin = true;
			TweenLite.to($popin, 1, { 
				bottom: -10, 
				ease: Power2.easeOut 
			});
		}
		else if (showing_popin == true 
			&& currentlyShown != null 
			&& window.scrollY < currentlyShown.offset().top) {
			// && $(document).height() > ($(window).height() + $(window).scrollTop())) {
			console.log("a");	

			showing_popin = false;
			TweenLite.to($popin, 0.5, { 
				bottom: -$popin.height(), 
				ease: Power2.easeOut 
			});
		}
	});





	$("a").each(function() {
		var href = $(this).attr("href");
		if(href.charAt(0) == "#")  {

			console.log("Changing <a href='"+href+"'> behavior to use GSAP scrolling");

			$(this).vclick( function(event) {
				var time = $(this).attr("time");
				time =  time == null ? 2 : time;

				console.log(time);
				

				event.preventDefault();
				var target = $(this).attr("href");
				TweenLite.to(window, time, { 
					scrollTo: { y: ($(target).offset().top - 30) }, 
					ease: Power2.easeOut 
				});
			});
		}
	});


	var mail_used = false;
	$("#mail_me").vclick( function(event) {
		event.preventDefault();
		var email = "Scott"+".";
		email += "Jaromin";
		email += "@gmail.com";

		if(mail_used == false) {
			$("#hidden_mail").append(email);  }
		$("#hidden_mail").show();
		mail_used = true;
	});




	// var step_to_step = [0, 0];


	$(".slideshow").each( function() {
		var $viewing_area = $(this).children(".viewing_area");
		var time = 0.4;
		var in_trasition = false;
		var prevent_scroll = false;

		
		function move_slide(leftNotRight) {

			
			// in_trasition = true;
			var slide_stops = [];
			$viewing_area.children("div").each(function () {
				var addMe = $(this)[0].offsetLeft;
				slide_stops.push(addMe);
			});


			var pos = $viewing_area.scrollLeft();


			var target = -1;
			var i;
			if(leftNotRight) {
				i = slide_stops.length - 1;
				while(i >= 0 && slide_stops[i] >= pos) { i--; }
				target = i;
			}
			else {
				i = 0;
				while(i < slide_stops.length && slide_stops[i] <= pos) { i++; }
				if(i != slide_stops.length) { target = i; }
			}


			if(target != -1) {
				// console.log("moving to target "+target);

				TweenLite.to($viewing_area, time, { 
					scrollTo: { x: slide_stops[target], autoKill:false }, 
					ease: Power4.easeInOut,
					onStart: function() {
						in_trasition = true;
					},
					onUpdate: function() {
						// step_to_step[1]++;
						// console.log("update "+step_to_step);
						
					},
					onComplete: function() {
						// console.log('hey');
						in_trasition = false;
						console.log(in_trasition);
						// last_pos = $viewing_area.scrollLeft();
						prevent_scroll = true;
						setTimeout(function() {
							prevent_scroll = false;
							console.log("no timeout");
						}, 500);
					}
				});
			}

		}

		$(this).children(".left_arrow").click(function() {
			move_slide(true);
		});

		$(this).children(".right_arrow").click(function() {
			move_slide(false);
		});


		$viewing_area.keydown(function(event) {
			if(event.which == 37) {
				move_slide(true);  }
			if(event.which == 39) {
				move_slide(false);  }
		});




		var last_pos = $viewing_area.scrollLeft();
		$viewing_area.scroll( function(event) {
			
			var current_pos = $viewing_area.scrollLeft();

			// console.log(in_trasition+" "+last_pos+" "+current_pos);

			if(prevent_scroll) {
				$viewing_area.scrollLeft(last_pos);
				return;
			}
			
			// if(prevent_scroll == true) {
			// 	var dScroll = Math.abs(current_pos - last_pos);
			// 	if(dScroll > 1 || dScroll == 0) {
			// 		$viewing_area.scrollLeft(last_pos);
			// 		return;
			// 	}
			// 	else {
			// 		prevent_scroll = false;
			// 	}
			// }

			if(in_trasition == false && prevent_scroll == false) {
				if(current_pos - last_pos > 8) {
					move_slide(false);
				}
				else if(current_pos - last_pos < -8) {
					move_slide(true);
				}	
				else {
					$viewing_area.scrollLeft(last_pos);
					return;
				}			
			}

			// if(prevent_scroll) {
			// 	prevent_scroll = false;
			// }

			last_pos = current_pos;
		});



		
	});




});




$.fn["vclick"] = function(callback) {  
	$(this).click(callback);
	$(this).tap( function() {
		$(this).click();
	});
};



