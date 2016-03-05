var express = require('express');
var search = require('./search');

var app = express();


var cors = require('express-cors');
app.use(cors({
    allowedOrigins: ['localhost:*']
}));

app.get('/search', function(req, res) {
    res.json(search(req.query.q));
});

var oneDay = 86400000;
var compression = require('compression');

app.use(compression());

app.get('/transcripts/simple/:file', function(req, res) {
    var file = req.params.file.match(/^[\w-]+\.tsv$/);
    if(!file) {
        res.status(404).end();
        return;
    }
    res.sendFile(__dirname + '/transcripts/simple/' + file[0]);
});

app.use('/', express.static(__dirname + '/../angular/dist'));

app.listen(process.env.PORT || 3000);