document.addEventListener("DOMContentLoaded", function() {

   var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };

   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();

   var video = document.getElementById('video');
   var vendorUrl = window.URL || window.webkitURL;

   navigator.getMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia ||
                   navigator.msGetUserMedia;

   navigator.getMedia({
      video: true,
      audio: false

   }, function(stream) {
      video.src = vendorUrl.createObjectURL(stream);
      video.play();

   }, function(error){
      //An error occurred
      error.code
   });

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

$(window).keypress(function (e) {
  if (e.keyCode === 0 || e.keyCode === 32) {
    e.preventDefault()
    socket.emit('clear_canvas', {});
  }
})

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

   // draw line received from server
	socket.on('draw_line', function (data) {
      var line = data.line;
      context.beginPath();
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
      context.strokeStyle = "#B0171F";
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 10;
   });

   socket.on('clear_canvas', function (data) {
      context.clearRect(0, 0, canvas.width, canvas.height);
   });
   
   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});