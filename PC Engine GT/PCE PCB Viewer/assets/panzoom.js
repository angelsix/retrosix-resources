(function () {
  "use strict";

  // --- State ---
  var canvas, ctx;
  var images = {};
  var imagesLoaded = 0;
  var totalImages = 4;

  var imageWidth, imageHeight;

  // Pan / zoom
  var x, y, tox, toy;
  var scale = 1, toScale = 1;
  var zoomStep = 0.001;

  // Layers: top, top+copper blend, top copper, bottom copper, bottom+copper blend, bottom
  var maxLayers = 6;
  var imageToLoad = 0;

  // Markers
  var markers = [];
  var markerSize = 50;
  var markerColor = { r: 0, g: 144, b: 255 };

  // Mouse tracking
  var mouseX = 0, mouseY = 0;
  var pmouseX = 0, pmouseY = 0;
  var dragging = false;

  // Animation
  var animating = false;
  var dirty = true; // needs a repaint

  // --- Image loading ---
  var imageSources = [
    { key: "top", src: "assets/Top.jpg" },
    { key: "topCopper", src: "assets/Top Copper.jpg" },
    { key: "bottom", src: "assets/Bottom.jpg" },
    { key: "bottomCopper", src: "assets/Bottom Copper.jpg" }
  ];

  function loadImages(callback) {
    imageSources.forEach(function (entry) {
      var img = new Image();
      img.onload = function () {
        images[entry.key] = img;
        imagesLoaded++;
        if (imagesLoaded === totalImages) callback();
      };
      img.src = entry.src;
    });
  }

  // --- Lerp helper ---
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // --- Mark dirty & schedule animation ---
  function requestDraw() {
    dirty = true;
    if (!animating) {
      animating = true;
      requestAnimationFrame(animate);
    }
  }

  // --- Animation loop (only runs when needed) ---
  function animate() {
    // Tween towards targets
    var dx = Math.abs(x - tox);
    var dy = Math.abs(y - toy);
    var ds = Math.abs(scale - toScale);

    x = lerp(x, tox, 0.1);
    y = lerp(y, toy, 0.1);
    scale = lerp(scale, toScale, 0.1);

    // Snap when close enough
    if (dx < 0.5 && dy < 0.5 && ds < 0.0001) {
      x = tox;
      y = toy;
      scale = toScale;
    }

    draw();

    // Continue animating if still tweening, otherwise stop
    var stillMoving =
      Math.abs(x - tox) > 0.5 ||
      Math.abs(y - toy) > 0.5 ||
      Math.abs(scale - toScale) > 0.0001;

    if (stillMoving || dirty) {
      dirty = false;
      requestAnimationFrame(animate);
    } else {
      animating = false;
    }
  }

  // --- Main draw ---
  function draw() {
    var w = imageWidth * scale;
    var h = imageHeight * scale;
    var ix = x - w / 2;
    var iy = y - h / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the active layer
    if (imageToLoad === 0) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.top, ix, iy, w, h);
    } else if (imageToLoad === 1) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.topCopper, ix, iy, w, h);
      ctx.globalAlpha = 110 / 255;
      ctx.drawImage(images.top, ix, iy, w, h);
      ctx.globalAlpha = 1;
    } else if (imageToLoad === 2) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.topCopper, ix, iy, w, h);
    } else if (imageToLoad === 3) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.bottomCopper, ix, iy, w, h);
    } else if (imageToLoad === 4) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.bottomCopper, ix, iy, w, h);
      ctx.globalAlpha = 110 / 255;
      ctx.drawImage(images.bottom, ix, iy, w, h);
      ctx.globalAlpha = 1;
    } else if (imageToLoad === 5) {
      ctx.globalAlpha = 1;
      ctx.drawImage(images.bottom, ix, iy, w, h);
    }

    // Draw markers
    ctx.lineWidth = 4 * scale;
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i];
      var mx = m.x * scale + x;
      var my = m.y * scale + y;
      var r = (markerSize * scale) / 2;

      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + m.color.r + "," + m.color.g + "," + m.color.b + ",0.59)";
      ctx.strokeStyle = "rgba(" + m.color.r + "," + m.color.g + "," + m.color.b + ",1)";
      ctx.fill();
      ctx.stroke();
    }

    // Cursor marker
    var cursorR = (markerSize * scale) / 2;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, cursorR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(" + markerColor.r + "," + markerColor.g + "," + markerColor.b + ",0.2)";
    ctx.strokeStyle = "rgba(" + markerColor.r + "," + markerColor.g + "," + markerColor.b + ",1)";
    ctx.fill();
    ctx.stroke();

    // HUD text
    drawHUD();
  }

  function drawHUD() {
    var textX = canvas.width - 10;
    var textY = 20;

    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    // Instruction text
    ctx.font = "14px sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.fillStyle = "rgba(0,0,0,1)";

    ctx.strokeText("Use up and down arrow to navigate.", textX, textY);
    ctx.fillText("Use up and down arrow to navigate.", textX, textY);
    textY += 15;

    ctx.strokeText("Double click to add marker. M clear last. C clear all.", textX, textY);
    ctx.fillText("Double click to add marker. M clear last. C clear all.", textX, textY);
    textY += 15;

    ctx.strokeText("12345 = Marker colors", textX, textY);
    ctx.fillText("12345 = Marker colors", textX, textY);

    // Layer labels
    ctx.font = "24px sans-serif";
    textY += 35;

    var labels = [
      { text: "Top", active: imageToLoad === 0 || imageToLoad === 1 },
      { text: "Top Copper", active: imageToLoad === 1 || imageToLoad === 2 },
      { text: "Bottom Copper", active: imageToLoad === 3 || imageToLoad === 4 },
      { text: "Bottom", active: imageToLoad === 4 || imageToLoad === 5 }
    ];

    for (var i = 0; i < labels.length; i++) {
      ctx.fillStyle = labels[i].active ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.39)";
      ctx.strokeText(labels[i].text, textX, textY);
      ctx.fillText(labels[i].text, textX, textY);
      textY += 50;
    }
  }

  // --- Resize ---
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    requestDraw();
  }

  // --- Event handlers ---
  function onMouseMove(e) {
    pmouseX = mouseX;
    pmouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (dragging) {
      tox += mouseX - pmouseX;
      toy += mouseY - pmouseY;

      // Clamp
      var w = imageWidth * toScale;
      var h = imageHeight * toScale;

      var maxX = canvas.width + w / 2 - canvas.width / 5;
      var minX = -(w / 2) + canvas.width / 5;
      var maxY = canvas.height + h / 2 - canvas.height / 5;
      var minY = -(h / 2) + canvas.height / 5;

      if (tox > maxX) tox = maxX;
      if (tox < minX) tox = minX;
      if (toy > maxY) toy = maxY;
      if (toy < minY) toy = minY;
    }

    requestDraw();
  }

  function onMouseDown(e) {
    if (e.button === 0) dragging = true;
  }

  function onMouseUp(e) {
    if (e.button === 0) dragging = false;
  }

  function onWheel(e) {
    e.preventDefault();

    var delta = -e.deltaY;
    // Normalize: different browsers give different deltaY magnitudes
    var ticks = delta > 0 ? Math.ceil(delta) : Math.floor(delta);

    if (ticks > 0) {
      // Zoom in
      for (var i = 0; i < ticks; i++) {
        if (imageWidth * toScale > canvas.width * 10) return;

        toScale *= 1 + zoomStep;
        tox -= zoomStep * (mouseX - tox);
        toy -= zoomStep * (mouseY - toy);
      }
    } else if (ticks < 0) {
      // Zoom out
      for (var i = 0; i < -ticks; i++) {
        if (imageWidth * toScale < 500) return;

        toScale *= 1 - zoomStep;
        tox += (zoomStep / (zoomStep + 1)) * (mouseX - tox);
        toy += (zoomStep / (zoomStep + 1)) * (mouseY - toy);
      }
    }

    requestDraw();
  }

  function onDblClick(e) {
    var relativeX = (e.clientX - x) / scale;
    var relativeY = (e.clientY - y) / scale;

    var newX = relativeX * scale;
    var newY = relativeY * scale;

    var foundMarker = false;
    var scaledMarkerSize = (markerSize / 2) * scale;

    for (var i = markers.length - 1; i >= 0; i--) {
      var mx = markers[i].x * scale;
      var my = markers[i].y * scale;

      if (Math.abs(mx - newX) < scaledMarkerSize && Math.abs(my - newY) < scaledMarkerSize) {
        foundMarker = true;
        markers.splice(i, 1);
      }
    }

    if (!foundMarker) {
      markers.push({ x: relativeX, y: relativeY, color: markerColor });
      console.log("Added position: " + relativeX + " " + relativeY);
    }

    requestDraw();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowUp") {
      if (imageToLoad > 0) imageToLoad--;
      requestDraw();
    } else if (e.key === "ArrowDown") {
      if (imageToLoad < maxLayers - 1) imageToLoad++;
      requestDraw();
    }
  }

  function onKeyPress(e) {
    var k = e.key;
    if (k === "c") {
      markers = [];
    } else if (k === "m") {
      markers.pop();
    } else if (k === "1") {
      markerColor = { r: 0, g: 144, b: 255 };
    } else if (k === "2") {
      markerColor = { r: 255, g: 0, b: 0 };
    } else if (k === "3") {
      markerColor = { r: 255, g: 255, b: 0 };
    } else if (k === "4") {
      markerColor = { r: 255, g: 255, b: 255 };
    } else if (k === "5") {
      markerColor = { r: 0, g: 0, b: 0 };
    } else if (k === "s") {
      // Save canvas as image
      var link = document.createElement("a");
      link.download = "board capture.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
    } else {
      return;
    }
    requestDraw();
  }

  // --- Init ---
  function init() {
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";
    document.body.appendChild(canvas);

    ctx = canvas.getContext("2d");

    imageWidth = images.top.naturalWidth;
    imageHeight = images.top.naturalHeight;

    // Fit image to window
    scale = toScale = Math.min(canvas.width / imageWidth, canvas.height / imageHeight);

    // Center image
    x = tox = canvas.width / 2;
    y = toy = canvas.height / 2;

    // Events
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("dblclick", onDblClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keypress", onKeyPress);

    requestDraw();
  }

  // Start
  loadImages(init);
})();
