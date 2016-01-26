



// var work_btns = document.getElementsByTagName("worktype");
// for (var i = 0; i < work_btns.length; i++) {
// 	var btn = work_btns[i];
// }






$(document).ready(function(){
	// $(document).click(function(){
	// 	console.log("this");
	// });

 // 	$(".worktype").each(function(index){
 // 		console.log(this);
	//   	this.click(function() {
	// 		console.log("this");  		
	//   	});
	// });
	
	var currentlyShown = null;
	$( ".show_item_group > div" ).click(function() {
		if(currentlyShown != null) { currentlyShown.hide(); }

		currentlyShown = $($(this).attr("show"));
		currentlyShown.show();
	});


	// $( ".rand_turn").css("transform", "rotate(0.5deg)");

	$( ".rand_turn").each( function(i, elem) {
		var turn = Math.random();
		if(turn > 0.5) { turn = 0.25+ turn%0.5; }
		else { turn = -0.25 - turn; }
		console.log(turn);
		// console.log(this);
		$(this).css("transform", "rotate("+turn+"deg)");
	});

});

