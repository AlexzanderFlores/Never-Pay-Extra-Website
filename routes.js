const fs = require('fs');
const express = require('express');
const sitemap = require('express-sitemap');
const request = require('request');
const router = express.Router();

const mapData = {
	'http': 'https',
	'url': 'neverpayextra.com',
	'map': {}
};

router.use((req, res, next) => {
	console.log(req.connection.remoteAddress.replace('::ffff:', '') + ' connected to ' + req.url);
	const host = req.headers.host;
	const isWWW = host.split('.').indexOf('www') !== -1;
	const www = isWWW ? '' : 'www.';
	if(process.env.PORT && (!isWWW || (!req.secure && req.get('X-Forwarded-Proto') !== 'https'))) {
		return res.redirect(`https://${www}` + host + req.url);
	}/* else if(!isWWW) {
		return res.redirect(`http://${www}` + host + req.url);
	}*/
	next();
});

const listen = (path, file) => {
	if(!file) {
		file = path.substring(1);
	}
	router.get(path, (req, res) => res.render(file, { session: req.session }));
	mapData.map[path] = ['get'];
};

listen('/', 'index');
listen('/search');
listen('/contact-us');
listen('/supported-websites');

sitemap(mapData).XMLtoFile('./sitemap.xml');

router.post('/contact-us', (req, res) => {
	const email = req.body.email;
	const subject = req.body.subject;
	const message = req.body.message;
	if(email && subject && message) {
		req.session.message_result = 'Your message has been sent! We\'ll get back to you via email within 48 hours';
	}
	res.render('contact-us', { session: req.session});
});

router.get('/chrome', (req, res) => res.redirect('https://chrome.google.com/webstore/detail/lkocokbbpjnnfhibjlnhfkkibjdjdkoi'));

router.get('/robots.txt', (req, res) => {
	res.type('text/plain');
	res.send('User-agent: *\nDisallow:');
});
router.get('/sitemap.xml', (req, res) => res.sendFile('/var/app/current/sitemap.xml'));
router.get('/favicon.ico', (req, res) => res.send('https://s3.amazonaws.com/com.neverpayextra/favicon.png'));

router.get('*', (req, res) => res.render('404'));

module.exports = router;
