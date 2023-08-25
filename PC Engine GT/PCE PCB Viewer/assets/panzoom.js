var topImage, topCopperImage, bottomImage, bottomCopperImage;
var w, h, tow, toh;
var x, y, tox, toy;
var imageToLoad = 0;
var zoom = .001; //zoom step per mouse tick 

function preload() {
  topImage = loadImage("assets/Top.jpg");
  topCopperImage = loadImage("assets/Top Copper.jpg");
  bottomImage = loadImage("assets/Bottom.jpg");
  bottomCopperImage = loadImage("assets/Bottom Copper.jpg");
//  img = top;
}

function keyTyped() {

  /*
  if (key === 'a') {
    tow = 10;
  } else if (key === 'b') {
    toh = 10;
  }
  // uncomment to prevent any default behavior
  return false;
  */
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    if (imageToLoad > 0)
      imageToLoad--;
  } else if (keyCode === DOWN_ARROW) {
    if (imageToLoad < 3)
    imageToLoad++;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  w = tow = topImage.width;
  h = toh = topImage.height;

  // Set initial width/height of image to fit window
  var ratio = Math.min(windowWidth / topImage.width, windowHeight / topImage.height);

  w = tow = tow * ratio;
  h = toh = toh * ratio;

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

  // Draw image
  if (imageToLoad == 0)
  {
    image(topImage, x-w/2, y-h/2, w, h);
  }
  else if (imageToLoad == 1)
  {
      image(topCopperImage, x-w/2, y-h/2, w, h);
  }
  else if (imageToLoad == 2)
  {
    image(bottomCopperImage, x-w/2, y-h/2, w, h);
  }
  else
  {
    image(bottomImage, x-w/2, y-h/2, w, h);
  }

  // Draw text
  strokeWeight(4);
  stroke(255,255,255, 50);
  fill(0, 0, 0);
  textAlign(RIGHT);
  textSize(14);
  text('Use up and down arrow to navigate.', windowWidth - 10, 20);
  textSize(24);

  if (imageToLoad == 0)
    fill(0,0,0);
  else   
    fill(0,0,0, 100);

  text('Top', windowWidth - 10, 70);

  if (imageToLoad == 1)
    fill(0, 0, 0);
  else   
    fill(0,0,0, 100);

  text('Top Copper', windowWidth - 10, 120);

  if (imageToLoad == 2)
    fill(0, 0, 0);
  else   
    fill(0,0,0, 100);

  text('Bottom Copper', windowWidth - 10, 170);

    if (imageToLoad == 3)
    fill(0, 0, 0);
  else    
    fill(0,0,0, 100);

  text('Bottom', windowWidth - 10, 220);
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
      if (tow>10*width) return; //max zoom
      tox -= zoom * (mouseX - tox);
      toy -= zoom * (mouseY - toy);
      tow *= zoom+1;
      toh *= zoom+1;
    }
  }
  
  if (e<0) { //zoom out
    for (var i=0; i<-e; i++) {
      if (tow<500) return; //min zoom
      tox += zoom/(zoom+1) * (mouseX - tox); 
      toy += zoom/(zoom+1) * (mouseY - toy);
      toh /= zoom+1;
      tow /= zoom+1;
    }
  }
}