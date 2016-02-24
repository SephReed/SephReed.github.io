Zepto(function($){
	$("a").each(function() {
		var href = $(this).attr("href");
		if(href.charAt(0) == "#")  {

			// console.log("Changing <a href='"+href+"'> behavior to use GSAP scrolling");

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
});





if($.fn["vclick"] == null) {
	$.fn["vclick"] = function(callback) {  
		$(this).click(callback);

		if($(this).tap != null) {
			$(this).tap( function() {
				$(this).click();
			});
		}
	};
}




