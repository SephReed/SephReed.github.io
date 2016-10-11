


console.log("Hey you! \n\n"+
	"I'm glad you came here to check things out.  Below you'll probably see a lot of console Jargon.  "+
	"This is because this page is running on my own js frontend which I'm still developing.  "+
	"Almost everything you see here is made from scratch.  "+
	"And what isn't made from scratch is so basic I'm likely to replace it just for the sake of being able to "+
	"say that absolutely everything is.\n\n"+
	"Anyways, thanks for coming to check it out!\n"+
	"-Seph\n"+
	"\n"+
	"P.S. WebGL may show some warnings below.  It's very new tech and the things become deprecated very quickly."
);





// var work_btns = document.getElementsByTagName("worktype");
// for (var i = 0; i < work_btns.length; i++) {
// 	var btn = work_btns[i];
// }



var currentlyShown = null;


U.docReady(function(){
	
	
	// $( ".show_item_group > a" ).vclick(function(event) {
	// 	event.preventDefault();

	// 	if(currentlyShown != null) { currentlyShown.hide(); }

	// 	currentlyShown = $($(this).attr("href"));
	// 	currentlyShown.show();
	// });


	// $( ".rand_turn").each( function(i, elem) {
	// 	var turn = Math.random();
	// 	if(turn > 0.5) { turn = 0.25+ turn%0.5; }
	// 	else { turn = -0.25 - turn; }
	// 	console.log("Radomly turned 'paper' div to "+turn+"deg");
	// 	// console.log(this);
	// 	$(this).css("transform", "rotate("+turn+"deg)");
	// });





	/*** Set up Pop In ***/

	// var showing_popin = false;
	// var $popin = $("#popin_wrapper");

	// TweenLite.set($popin, { 
	// 	bottom: -$popin.height(), 
	// 	ease: Power2.easeOut 
	// });

	
	// $(window).scroll( function() {
	// 	// console.log('e');
	// 	if(showing_popin == false 
	// 		&& currentlyShown != null 
	// 		&& window.scrollY > currentlyShown.offset().top) {
	// 		// && $(document).height() <= ($(window).height() + $(window).scrollTop())) {
	// 		// alert('ey!');
	// 		console.log("e");
	// 		showing_popin = true;
	// 		TweenLite.to($popin, 1, { 
	// 			bottom: -10, 
	// 			ease: Power2.easeOut 
	// 		});
	// 	}
	// 	else if (showing_popin == true 
	// 		&& currentlyShown != null 
	// 		&& window.scrollY < currentlyShown.offset().top) {
	// 		// && $(document).height() > ($(window).height() + $(window).scrollTop())) {
	// 		console.log("a");	

	// 		showing_popin = false;
	// 		TweenLite.to($popin, 0.5, { 
	// 			bottom: -$popin.height(), 
	// 			ease: Power2.easeOut 
	// 		});
	// 	}
	// });





	// $("a").each(function() {
	// 	var href = $(this).attr("href");
	// 	if(href.charAt(0) == "#")  {

	// 		console.log("Changing <a href='"+href+"'> behavior to use GSAP scrolling");

	// 		$(this).vclick( function(event) {
	// 			var time = $(this).attr("time");
	// 			time =  time == null ? 2 : time;

	// 			console.log(time);
				

	// 			event.preventDefault();
	// 			var target = $(this).attr("href");
	// 			TweenLite.to(window, time, { 
	// 				scrollTo: { y: ($(target).offset().top - 30) }, 
	// 				ease: Power2.easeOut 
	// 			});
	// 		});
	// 	}
	// });


	// var mail_used = false;
	// // $("#mail_me").vclick( function(event) {
	// El.byId("mail_me").addEventListener("click", function(event) {
	// 	event.preventDefault();
	// 	var hidden_mail = El.byId("hidden_mail");

	// 	if(mail_used == false) { 
	// 		var email = "Scott"+".";
	// 		email += "Jaromin";
	// 		email += "@gmail.com";
	// 		hidden_mail.append(email);  
	// 	}
	// 	hidden_mail.style.display = "";
	// 	mail_used = true;
	// });




	// var step_to_step = [0, 0];


	// $(".slideshow").each( function() {
	// 	var $viewing_area = $(this).children(".viewing_area");
	// 	var time = 0.4;
	// 	var in_trasition = false;
	// 	var prevent_scroll = false;

		
	// 	function move_slide(leftNotRight) {

			
	// 		// in_trasition = true;
	// 		var slide_stops = [];
	// 		$viewing_area.children("div").each(function () {
	// 			var addMe = $(this)[0].offsetLeft;
	// 			slide_stops.push(addMe);
	// 		});


	// 		var pos = $viewing_area.scrollLeft();


	// 		var target = -1;
	// 		var i;
	// 		if(leftNotRight) {
	// 			i = slide_stops.length - 1;
	// 			while(i >= 0 && slide_stops[i] >= pos) { i--; }
	// 			target = i;
	// 		}
	// 		else {
	// 			i = 0;
	// 			while(i < slide_stops.length && slide_stops[i] <= pos) { i++; }
	// 			if(i != slide_stops.length) { target = i; }
	// 		}


	// 		if(target != -1) {
	// 			// console.log("moving to target "+target);

	// 			TweenLite.to($viewing_area, time, { 
	// 				scrollTo: { x: slide_stops[target], autoKill:false }, 
	// 				ease: Power4.easeInOut,
	// 				onStart: function() {
	// 					in_trasition = true;
	// 				},
	// 				onUpdate: function() {
	// 					// step_to_step[1]++;
	// 					// console.log("update "+step_to_step);
						
	// 				},
	// 				onComplete: function() {
	// 					// console.log('hey');
	// 					in_trasition = false;
	// 					console.log(in_trasition);
	// 					// last_pos = $viewing_area.scrollLeft();
	// 					prevent_scroll = true;
	// 					setTimeout(function() {
	// 						prevent_scroll = false;
	// 						console.log("no timeout");
	// 					}, 500);
	// 				}
	// 			});
	// 		}

	// 	}

	// 	$(this).children(".left_arrow").click(function() {
	// 		move_slide(true);
	// 	});

	// 	$(this).children(".right_arrow").click(function() {
	// 		move_slide(false);
	// 	});


	// 	$viewing_area.keydown(function(event) {
	// 		if(event.which == 37) {
	// 			move_slide(true);  }
	// 		if(event.which == 39) {
	// 			move_slide(false);  }
	// 	});




	// 	var last_pos = $viewing_area.scrollLeft();
	// 	$viewing_area.scroll( function(event) {
			
	// 		var current_pos = $viewing_area.scrollLeft();

	// 		// console.log(in_trasition+" "+last_pos+" "+current_pos);

	// 		if(prevent_scroll) {
	// 			$viewing_area.scrollLeft(last_pos);
	// 			return;
	// 		}
			
	// 		// if(prevent_scroll == true) {
	// 		// 	var dScroll = Math.abs(current_pos - last_pos);
	// 		// 	if(dScroll > 1 || dScroll == 0) {
	// 		// 		$viewing_area.scrollLeft(last_pos);
	// 		// 		return;
	// 		// 	}
	// 		// 	else {
	// 		// 		prevent_scroll = false;
	// 		// 	}
	// 		// }

	// 		if(in_trasition == false && prevent_scroll == false) {
	// 			if(current_pos - last_pos > 8) {
	// 				move_slide(false);
	// 			}
	// 			else if(current_pos - last_pos < -8) {
	// 				move_slide(true);
	// 			}	
	// 			else {
	// 				$viewing_area.scrollLeft(last_pos);
	// 				return;
	// 			}			
	// 		}

	// 		// if(prevent_scroll) {
	// 		// 	prevent_scroll = false;
	// 		// }

	// 		last_pos = current_pos;
	// 	});



		
	// });




});




// $.fn["vclick"] = function(callback) {  
// 	$(this).click(callback);
// 	$(this).tap( function() {
// 		$(this).click();
// 	});
// };



