const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here

app.listen(port);
console.log('Server started at http://localhost:' + port);

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));