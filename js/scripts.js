// Global variables
var map;
var directionsDisplay;
var directionsService;
var time;
var firstload;
var chart;

// Init dialog box
$('#dialog').dialog({
  autoOpen: false,
  draggable: false,
  resizable: false,
  modal: true,
  width: 400,
  buttons: { 
    "I'm sure": function() {$(this).dialog("close"); routeChangedConfirmed(); },
    "Cancel": function() {$(this).dialog("close"); }
  },
  autoOpen: false
});

 // chart loads
google.load('visualization', '1.1', {packages: ['line']});
google.setOnLoadCallback(drawGraph);

function initMap() {
  	var origin_place_id = null;
  	var destination_place_id = null;
  	var travel_mode = google.maps.TravelMode.WALKING;

  	map = new google.maps.Map(document.getElementById('map'), {
	    mapTypeControl: false,
	    center: {lat: 51.055289, lng: 3.720008},
	    zoom: 15
  	});

  	directionsService = new google.maps.DirectionsService;
  	directionsDisplay = new google.maps.DirectionsRenderer;
  	directionsDisplay.setMap(map);

	  var origin_input = document.getElementById('origin-input');
  	var destination_input = document.getElementById('destination-input');
  	var modes = document.getElementById('mode-selector');
  	var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
  	origin_autocomplete.bindTo('bounds', map);
  	var destination_autocomplete =
      	new google.maps.places.Autocomplete(destination_input);
  	destination_autocomplete.bindTo('bounds', map);

  	// Sets a listener on a radio button to change the filter type on Places
  	// Autocomplete.
  	function setupClickListener(id, mode) {
    	var radioButton = document.getElementById(id);
    	radioButton.addEventListener('click', function() {
      	travel_mode = mode;
        radioButtonsChanged(mode);  // called on radiobutton change
    	}); 
  	}
  	setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
  	setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
  	setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);
    radioButtonsChanged(google.maps.TravelMode.WALKING); // Set this to local storage by default

  	function expandViewportToFitPlace(map, place) {
    	if (place.geometry.viewport) {
      	map.fitBounds(place.geometry.viewport);
    	} else {
      	map.setCenter(place.geometry.location);
      	map.setZoom(17);
    	}
  	}

  	origin_autocomplete.addListener('place_changed', function() {
	    var place = origin_autocomplete.getPlace();
    	if (!place.geometry) {
      	$('#errormessages p').html("Error: Autocomplete's returned place contains no geometry");
      	return;
    	}
      else $('#errormessages p').html("");
    	expandViewportToFitPlace(map, place);
      routeChanged();

    	// If the place has a geometry, store its place ID and route if we have
    	// the other place ID
    	origin_place_id = place.place_id;
    	route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
  	});

  	destination_autocomplete.addListener('place_changed', function() {
	    var place = destination_autocomplete.getPlace();
    	if (!place.geometry) {
      		$('#errormessages p').html("Error: Autocomplete's returned place contains no geometry");
      		return;
    	}
      else $('#errormessages p').html("");
    	expandViewportToFitPlace(map, place);
      routeChanged();

    	// If the place has a geometry, store its place ID and route if we have
    	// the other place ID
    	destination_place_id = place.place_id;
    	route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
  	});

  	function route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay) {
		if (!origin_place_id || !destination_place_id) {
      		return;
    	}
    	directionsService.route({
      	origin: {'placeId': origin_place_id},
      	destination: {'placeId': destination_place_id},
      	travelMode: travel_mode
    	}, function(response, status) {
      	if (status === google.maps.DirectionsStatus.OK) {
	        directionsDisplay.setDirections(response);
          $('#errormessages p').html("");
      	} else {
        	$('#errormessages p').html('Error: Directions request failed due to ' + status);
      	}
    	});
  	}

    // Add event listener to save button
    $('#savebtn').on('click', savebtnevt);

    // Persist last used values from localstorage
    handlePersistence(); 

    // Add event listener to save image button
    $('#saveimagebtn').on('click', saveimgbtnevt);
    $('#savedgraphsthissession').hide();

    // Show controls when button is clicked
    $('#showcontrols').on('click', function() {
        $('#origin-input').show(200);
        $('#destination-input').show(350);
        $('#mode-selector').show(500);
        $('#routeplaceholder p').hide();
    });

} 



function setTrafficLayer(map, remove) {
	var trafficLayer = new google.maps.TrafficLayer();
	trafficLayer.setMap(map);
	if(remove === false) trafficLayer.setMap(null);
}

function radioButtonsChanged(mode) {
  localStorage.setItem("lasttravelmode", mode);
  setTrafficLayer(map, true);
  routeChanged();
}

function handlePersistence() {
  var lastorigin = localStorage.getItem("lastorigin");
  var lastdestination = localStorage.getItem("lastdestination");
  var lasttravelmode = localStorage.getItem("lasttravelmode");

  if(lastorigin !== null) $("#origin-input").val(lastorigin);
  if(lastdestination !== null) $("#destination-input").val(lastdestination);
  if(lasttravelmode !== null) {
    if(lasttravelmode === "WALKING") $('#changemode-walking').prop("checked", true);
    if(lasttravelmode === "TRANSIT") $('#changemode-transit').prop("checked", true);
    if(lasttravelmode === "DRIVING") $('#changemode-driving').prop("checked", true);
  }

  if(lastorigin !== null && lastdestination !== null && lasttravelmode !== null)
    setTrafficLayer(map, true);

  firstload = true;
  routeChangedConfirmed();
}

function routeChanged() {
  $('#errormessages p').html('');

  if(window.getSelection) {
    window.getSelection().empty();    // Fix bug where whole page gets selected
  }

  if(firstload === false
    && $('#origin-input').val() !== '' 
    && $('#destination-input').val() !== '')
  $('#dialog').dialog("open");        // Show the dialog box    
}

function routeChangedConfirmed() {    // When user clicked OK on dialog box
  // Local storage write
  var lastorigin = $("#origin-input").val();
  var lastdestination = $("#destination-input").val();
  var travelmode = localStorage.getItem("lasttravelmode");

  localStorage.setItem("lastorigin", lastorigin);
  localStorage.setItem("lastdestination", lastdestination);

  // REQUEST DIRECTIONS AND RENDER THEM
  var request;
  var allpropertiesset = false;
  // Only do this request if all request properties are set
  if(lastorigin !== null && lastorigin !== ''
    && lastdestination !== null && lastdestination !== ''
    && travelmode !== null && travelmode !== '') {
    request = {
      origin: lastorigin,
      destination: lastdestination,
      travelMode: travelmode
    }

    allpropertiesset = true;

    // Think about moving this - Duration might change in between user inputs?
    directionsService.route(request, function(response, status) {
      time = response.routes[0].legs[0].duration.text;
      if(time === 'undefined') $("#duration").html("Duration unknown");
      else {
        $("#duration").html("Duration: " + time);     // Show duration of route
        $("#duration").css("color", "black");         // Color grey by default,change to black if filled in
      } 

      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);

      }
    });
  }



  if(firstload) { 
    $('#origin-input').hide();
    $('#destination-input').hide();
    $('#mode-selector').hide();   
    $('#routeplaceholder p').html('Previous route: <strong>' + $('#origin-input').val() + '</strong> to ' 
        + '<strong>' + $('#destination-input').val() + '</strong> [' + localStorage.getItem('lasttravelmode') + ']');
    $('#routeplaceholder p').show(500);

    if(!allpropertiesset) {   // Don't show time and input fields if route isn't properly set
      $('#showcontrols').val('Enter a route');
      $('#routeplaceholder p').hide();
      $('#time-controls').hide();
    }
  } 
  else {
    $('#showcontrols').val('Change your route');
    $('#origin-input').hide(200);
    $('#destination-input').hide(350);
    $('#mode-selector').hide(500);
    $('#routeplaceholder p').html('Current route: <strong>' + $('#origin-input').val() + '</strong> to ' 
        + '<strong>' + $('#destination-input').val() + '</strong> [' + localStorage.getItem('lasttravelmode') + ']');
    $('#routeplaceholder p').show(500);
    $('#duration').show();
    $('#time-controls').show();
  }

  // Clear saved times in localstorage
  if(!firstload) {
    var emptyarr = new Array();
    localStorage.setItem('googletimes', JSON.stringify(emptyarr));
    localStorage.setItem('usertimes', JSON.stringify(emptyarr));
    localStorage.setItem('transtype', JSON.stringify(emptyarr));
  }
  else firstload = false;
  drawGraph();
}


function savebtnevt() {
  $('#errormessages p').html('');

  var min = $('#time-minutes').val();
  var hours = $('#time-hours').val();
  min = parseInt(min);
  hours = parseInt(hours);

  var error = false;

  // Check input values from user
  if(isNaN(min) && isNaN(hours)) error = true;
  if(min > 60) {
    $('#time-minutes').val('60');
    error = true;
  } 
  if(min < 0 || isNaN(min)) {
    $('#time-minutes').val('0');
    min = 0;
  }
  if(hours > 60) {
    $('#time-hours').val('60');
    error = true;
  }
  if(hours < 0 || isNaN(hours)) {
    $('#time-hours').val('0');
    hours = 0;
  }

  if(error) $('#errormessages p').html("Please enter a valid time format");

  // Write 2 arrays to local storage, same index of these 2 arrays will be about the same trip
  var googletimes = JSON.parse(localStorage.getItem('googletimes'));
  var usertimes = JSON.parse(localStorage.getItem('usertimes'));
  var transtype = JSON.parse(localStorage.getItem('transtype'));
  if(googletimes === null) googletimes = new Array();
  if(usertimes === null) usertimes = new Array();
  if(transtype === null) transtype = new Array();

  if(error === false) {
    googletimes.push(parseInt(time));
    localStorage.setItem('googletimes', JSON.stringify(googletimes))

    var totaltime = 0;
    if(hours > 0 && !isNaN(hours)) { totaltime += hours*60; }
    totaltime += min;
    usertimes.push(totaltime);
    localStorage.setItem('usertimes', JSON.stringify(usertimes));

    transtype.push(localStorage.getItem("lasttravelmode"));
    localStorage.setItem('transtype', JSON.stringify(transtype));
  }

  // repaint
  drawGraph();
}

function drawGraph() {
  var googletimes = JSON.parse(localStorage.getItem('googletimes'));
  var usertimes = JSON.parse(localStorage.getItem('usertimes'));
  var transtype = JSON.parse(localStorage.getItem('transtype'));
  if(googletimes === null) googletimes = new Array();
  if(usertimes === null) usertimes = new Array();
  if(transtype === null) transtype = new Array();

  // Prepare chart
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Trip number');
  data.addColumn('number', 'Google\'s Time');
  data.addColumn('number', 'User\'s Time');

  for(var i = 0; i < usertimes.length; i++) {
    data.addRows([
      ['Trip ' + i, googletimes[i], usertimes[i]]
      ]);
  }

  var options = {
    chart: {
      title: localStorage.getItem('lastorigin') + ' to ' + localStorage.getItem('lastdestination'),
      subtitle: 'Traveled by ' + localStorage.getItem('lasttravelmode') + ', time in minutes (m)'
    },
  };

  // Draw chart
  chart = new google.charts.Line(document.getElementById('graph'));
  chart.draw(data, options);
}

// Repaint on resize (responsiveness)
$(window).resize(function() {
  drawGraph();
});

function saveimgbtnevt() {
  $('#savedgraphsthissession').show(); // show h2 title that's hidden on load

  // Save images to this session and ajax call to save.php where images get saved on server
  var pablo_svg = Pablo(document.getElementById('graph').getElementsByTagName('svg')[0]);
  var data = pablo_svg.dataUrl();
  $.ajax({ 
      type: 'POST', 
      url: 'save.php',
      dataType: 'text',
      data: {
          base64data : data
      }
  }).done(function(resp) {
    var newImg = document.createElement('IMG');
    newImg.src = 'images/' + resp;
    document.getElementById('images').appendChild(newImg);
  }).fail(function(resp) {
    console.log('error');
  });

}

