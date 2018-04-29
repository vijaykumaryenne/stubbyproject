"use strict";
const PORT = process.env.PORT || 5000
var Components = require('./components.js');

// Create a server instance
var server = Components('/components');

// Start the server listening..
server.listen(PORT || 5000);
