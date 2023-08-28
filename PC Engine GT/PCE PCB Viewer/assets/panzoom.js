var topImage, topCopperImage, bottomImage, bottomCopperImage;

// Top, top copper, bottom copper, bottom, then two blend modes partially showing top or bottom overlaid on copper
var maxLayers = 6;

var w, h, tow, toh;
var x, y, tox, toy;
var imageWidth, imageHeight;

// Which image to draw
var imageToLoad = 0;

// Zoom step per mouse tick 
var zoom = .001; 

// Current scale
var scale = 1, toScale = 1;

// Markers
var markers = [];
var markerSize = 50;
var markerColor = { r: 0, g: 144, b: 255 };

// The canvas
var canvas;

function preload() {
  topImage = loadImage("assets/Top.jpg");
  topCopperImage = loadImage("assets/Top Copper.jpg");
  bottomImage = loadImage("assets/Bottom.jpg");
  bottomCopperImage = loadImage("assets/Bottom Copper.jpg");
}

function keyTyped() {

  if (key === 'c') {
    markers = [];
  } else if (key === 'm') {
    // Pop last marker
    markers.pop();
  }
  else if (key === '1') {
    // Pop last marker
    markerColor = { r: 0, g: 144, b: 255 };
  }
  else if (key === '2') {
    // Pop last marker
    markerColor = { r: 255, g: 0, b: 0 };
  }
  else if (key === '3') {
    // Pop last marker
    markerColor = { r: 255, g: 255, b: 0 };
  }
  else if (key === '4') {
    // Pop last marker
    markerColor = { r: 255, g: 255, b: 255 };
  }
  else if (key === '5') {
    // Pop last marker
    markerColor = { r: 0, g: 0, b: 0 };
  }
  else if (key === 's') {
    // Save canvas
    saveCanvas(canvas, 'board capture', 'jpg');
  }



  // uncomment to prevent any default behavior
  return false;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    if (imageToLoad > 0)
      imageToLoad--;
  } else if (keyCode === DOWN_ARROW) {
    if (imageToLoad < maxLayers - 1)
    imageToLoad++;
  }
}

function doubleClicked(event) {

  // Add point relative to center of screen
  var relativeX = (event.clientX - x) / scale;
  var relativeY = (event.clientY - y) / scale;

  var newX = (relativeX * scale)
  var newY =  (relativeY * scale);

  // If clicked within existing marker
  var foundMarker = false;
  var i = markers.length;

  var scaledMarkerSize = ((markerSize / 2) * scale);

  while (i--)
  {
    var markerX = (markers[i].x * scale);
    var markerY = (markers[i].y * scale);

    // If we clicked within marker
    if (Math.abs(markerX - newX) < scaledMarkerSize && Math.abs(markerY - newY) < scaledMarkerSize)
    {
      foundMarker = true;
      markers.splice(i, 1);
    }
  }

  // If this is a new marker...
  if (!foundMarker)
  {
    // Add marker
    markers.push({x:relativeX, y:relativeY, color: markerColor});
    console.log("Added position: " + relativeX + " " + relativeY);
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  imageWidth = w = tow = topImage.width;
  imageHeight = h = toh = topImage.height;

  // Set initial width/height of image to fit window
  scale = toScale = Math.min(windowWidth / imageWidth, windowHeight / imageHeight);

  // Scale image
  w = tow = tow * scale;
  h = toh = toh * scale;

  // Center image
  x = tox = windowWidth / 2;
  y = toy = windowHeight / 2;

}

function draw() {
  // White background
  background(255);

  //tween/smooth motion
  x = lerp(x, tox, .1);
  y = lerp(y, toy, .1);
  w = lerp(w, tow, .1); 
  h = lerp(h, toh, .1);

  scale = lerp(scale, toScale, .1);

  // Draw image
  if (imageToLoad == 0)
  {
    image(topImage, x-w/2, y-h/2, w, h);
  }
  else if (imageToLoad == 1)
  {
    image(topCopperImage, x-w/2, y-h/2, w, h);
    tint(255, 110);
    image(topImage, x-w/2, y-h/2, w, h);
    tint(255, 255);
  }
  else if (imageToLoad == 2)
  {
      image(topCopperImage, x-w/2, y-h/2, w, h);
  }
  else if (imageToLoad == 3)
  {
    image(bottomCopperImage, x-w/2, y-h/2, w, h);
  }
  else if (imageToLoad == 4)
  {
    image(bottomCopperImage, x-w/2, y-h/2, w, h);
    tint(255, 110);
    image(bottomImage, x-w/2, y-h/2, w, h);
    tint(255, 255);
  }
  else if (imageToLoad == 5)
  {
    image(bottomImage, x-w/2, y-h/2, w, h);
  }

  // Draw markers
  strokeWeight(4 * scale);

  for(var i = 0; i < markers.length; i++) {
    fill(markers[i].color.r,markers[i].color.g,markers[i].color.b,150);
    stroke(markers[i].color.r,markers[i].color.g,markers[i].color.b);
    circle((markers[i].x * scale) + x, (markers[i].y * scale) + y, markerSize * scale);
  }

  // Cursor marker
  fill(markerColor.r,markerColor.g,markerColor.b,50);
  stroke(markerColor.r,markerColor.g,markerColor.b);
  circle(mouseX, mouseY, markerSize * scale);

  var textPositionX = 10;
  var textPositionY = 20;

  // Draw text
  strokeWeight(4);
  stroke(255,255,255, 50);
  fill(0, 0, 0);
  textAlign(RIGHT);
  textSize(14);
  text('Use up and down arrow to navigate.', windowWidth - textPositionX, textPositionY);
  textPositionY += 15;
  text('Double click to add marker. M clear last. C clear all.', windowWidth - textPositionX, textPositionY);
  textPositionY += 15;
  text('12345 = Marker colors', windowWidth - textPositionX, textPositionY);

  textSize(24);

  if (imageToLoad == 0 || imageToLoad == 1)
    fill(0,0,0);
  else   
    fill(0,0,0, 100);

  textPositionY += 35;
  
  text('Top', windowWidth - textPositionX, textPositionY);
  textPositionY += 50;

  if (imageToLoad == 1 || imageToLoad == 2)
    fill(0, 0, 0);
  else   
    fill(0,0,0, 100);

  text('Top Copper', windowWidth - textPositionX, textPositionY);
  textPositionY += 50;

  if (imageToLoad == 3 || imageToLoad == 4)
    fill(0, 0, 0);
  else   
    fill(0,0,0, 100);

  text('Bottom Copper', windowWidth - textPositionX, textPositionY);
  textPositionY += 50;

  if (imageToLoad == 4 || imageToLoad == 5)
    fill(0, 0, 0);
  else    
    fill(0,0,0, 100);

  text('Bottom', windowWidth - textPositionX, textPositionY);
  textPositionY += 50;
}

function mouseDragged() {

  // Move towards mouse
  tox += mouseX-pmouseX;
  toy += mouseY-pmouseY;

  // Limit max X/Y positions

  if (tox > windowWidth + (w / 2) - (windowWidth / 5))
  tox = windowWidth + (w / 2)  - (windowWidth / 5);
  if (tox < -(w / 2) + (windowWidth / 5))
   tox = -(w / 2) + (windowWidth / 5);

   if (toy > windowHeight + (h / 2) - (windowHeight / 5))
    toy = windowHeight + (h / 2)  - (windowHeight / 5);
   if (toy < -(h / 2) + (windowHeight / 5))
    toy = -(h / 2) + (windowHeight / 5);
 }

function mouseWheel(event) {
  var e = -event.delta;

  if (e>0) { //zoom in
    for (var i=0; i<e; i++) {
      if (tow > width * 10) return; //max zoom

      toScale *= 1 + zoom;

      tox -= zoom * (mouseX - tox);
      toy -= zoom * (mouseY - toy);

      tow = imageWidth * toScale;
      toh = imageHeight * toScale;
    }
  }
  
  if (e<0) { //zoom out
    for (var i=0; i<-e; i++) {
      if (tow < 500) return; //min zoom

      toScale *= 1 - zoom;

      tox += zoom/(zoom+1) * (mouseX - tox); 
      toy += zoom/(zoom+1) * (mouseY - toy);

      tow = imageWidth * toScale;
      toh = imageHeight * toScale;
    }
  }
}