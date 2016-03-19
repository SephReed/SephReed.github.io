
	PINE.evals[1].posts= [];

	PINE.addEventListener("DOMContentLoaded", function() {
	    alert("hi you");

	    var wall = getQuery("wall") || 0;

	    alert(wall);
	    // var topic = getQuery("topic") || 0;

	    // var target = "http://localhost:8080/aardvark/posts?wall="+wall+"&topic="+topic;
	    var target = "http://localhost:8080/aardvark/posts?wall="+wall;

	    alert(target);

	    var topic = getQuery("topic");
	    if(topic) { }

	    alert(target);

	    // var target = "http://localhost:8080/aardvark/wall/0/topic/0/posts";

	    var request = new XMLHttpRequest();
	    // request.responseType = 'text';
	    request.open('GET', target, true);

	    request.onload = function() {
	        if (request.status >= 200 && request.status < 400) {
	            // Success!
	            var response = request.responseText;
	            console.log(response);
	            var data = JSON.parse(response);
	            console.log(data);
	            console.log(data.name);

	            PINE.evals[1].posts = data.vals;
	            $("postlist")[0]._pine_.fns.update();
	        } else {
	            // We reached our target server, but it returned an error
	            alert("include src '"+target+"' does not exist")
	        }
	    };



	    request.onerror = function() {
	        // There was a connection error of some sort
	        alert("include src '"+target+"' does not exist")
	    };

	    request.send();
	});





	window["addComment"] = function(addMe) {
        PINE.evals[1].posts.push(addMe);

        $("postlist")[0]._pine_.fns.update();


        alert("adding commert");

        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost:8080/aardvark/posts', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send(addMe);

    }



	// PINE.evals[1].i= 0;

	window["getQuery"] = function(name){
		// alert([object Object].search);
	   	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec([object Object].search))
	        return decodeURIComponent(name[1]);

	    else return undefined;
	}

	// alert(getQuery("s"));