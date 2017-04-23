<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="css/reset.css"/>
    <link rel="stylesheet" type="text/css" href="css/styles.css"/>
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.min.css"/>
    <meta id="meta" name="viewport"
content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="toppanel">
      <div id="duration">Please enter your trip</div>
      
      <input id="showcontrols" class="controls" type="button" value="Change route">
      <div id="routeplaceholder">
        <p></p>
      </div>

      <input id="origin-input" class="controls" type="text" placeholder="Enter an origin location">
      <input id="destination-input" class="controls" type="text" placeholder="Enter a destination location">


      <div id="mode-selector" class="controls">
        <input type="radio" name="type" id="changemode-walking" checked="checked">
        <label for="changemode-walking">Walking</label>

        <input type="radio" name="type" id="changemode-transit">
        <label for="changemode-transit">Transit</label>

        <input type="radio" name="type" id="changemode-driving">
        <label for="changemode-driving">Driving</label>
      </div>


      <div id="time-controls">
        <div>Your time</div>
        <input id="time-hours" class="controls" type="text" placeholder="HH">
        <div>:</div>
        <input id="time-minutes" class="controls" type="text" placeholder="MM">
        <input id="savebtn" class="controls" type="button" value="Save">
      </div>

      <div id="errormessages">
        <p></p>
      </div>

    </div>

    <div id="dialog" title="Warning">
      <p>
        This will remove the graph and delete all current travel times!<br/>
        <br/>
        Are you sure?
      </p>

    </div>

    <div id="map"></div>

    <h2>User times</h2>

    <div id="graph"></div>
    <input id="saveimagebtn" class="controls" type="button" value="Save Graph as Image">

    <h2 id="savedgraphsthissession">Saved Graphs from this session</h2>
    <div id="images"></div>

    <div id="savedimages">
      <h2>Saved Graphs</h2>
      <?php
          $dirname = "images/";
          $images = glob($dirname."*.svg");
 
          foreach($images as $image) {
            echo '<img src="'.$image.'" />';
          }
      ?>
    </div>

    <script src="https://www.google.com/jsapi"></script>
    <script src="js/jquery-2.1.4.min.js"></script>
    <script src="js/pablo.min.js"></script>
    <script src="js/jquery-ui.min.js"></script>
    <script src="js/scripts.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDKmNopGjXbCc2Xy77xilyEvQgBPOC76e0&signed_in=true&libraries=places&callback=initMap"></script>

 


  </body>
</html>