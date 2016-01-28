
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
	
	
	$( ".show_item_group > a" ).click(function(event) {
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

			$(this).click( function(event) {
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
	$("#mail_me").click( function() {
		var email = "Scott"+".";
		email += "Jaromin";
		email += "@gmail.com";

		if(mail_used == false) {
			$("#hidden_mail").append(email);  }
		$("#hidden_mail").show();
		mail_used = true;
	});


});

