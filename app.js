const fs = require('fs');
const http = require('http');
const uuid = require('uuid/v4');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const expressSession = require('express-session');
const compression = require('compression');
const app = module.exports.app = express();
const router = module.exports.router = require('./routes');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.set('trust proxy', true);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 * 7 }));
app.use(expressSession({
	secret: uuid(),
	resave: false,
	saveUninitialized: true,
	cookie: { secure : true }
}));

app.use('/', router);

http.createServer(app).listen(process.env.PORT || 80);
