var express = require('express'), 
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io').listen(http);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';


http.listen(server_port, server_ip_address);
app.use(express.static(path.join(__dirname, 'public'))); 
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var line_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });

    socket.on('clear_canvas', function (data) {
      // add received line to history 
      line_history = []
      // send line to all clients
      io.emit('clear_canvas',{});
   });
});