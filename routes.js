const fs = require('fs');
const express = require('express');
const sitemap = require('express-sitemap');
const rp = require('request-promise');
const router = express.Router();

const mapData = {
	'http': 'https',
	'url': 'neverpayextra.com',
	'map': {}
};

router.use((req, res, next) => {
	const address = req.connection.remoteAddress.replace('::ffff:', '');
	const from = req.headers.referer;
	console.log(`${address} connected to ${req.url} from ${from}`);
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
listen('/track');
listen('/contact-us');
listen('/supported-websites');

sitemap(mapData).XMLtoFile('./sitemap.xml');

router.post('/contact-us', (req, res) => {
	const to = 'neverpayextra@gmail.com';
	const subject = encodeURI(`Customer Support - ${req.body.subject}`);
	const text = encodeURI(`${req.body.message}\n\nFROM ${req.body.email}`);

	rp.post({
		uri: 'https://api.neverpayextra.com/v1/send-email',
		headers: { to, subject, text }
	}, (err, data) => {
		if(err) {
			req.session['email-message-result'] = 'An error occurred. Please email us: NeverPayExtra@gmail.com';
		} else {
			req.session['email-message-result'] = 'Your message has been sent! We\'ll get back to you via email within 48 hours';
		}

		res.render('contact-us', { session: req.session});
	});
});

router.post('/track', (req, res) => {
	const upc = req.body.upc;
	if(!upc) {
		return res.redirect('/');
	}

	const email = req.body.email;
	const phone = req.body.phone;

	if(email === '' && phone === '') {
		return res.redirect(req.headers.referer);
	}

	const target = req.body.target;
	const name = req.body.name;

	const headers = { upc, target, name };
	if(email) {
		headers.email = email;
	}
	if(phone) {
		headers.phone = phone;
	}

	rp.post({ uri: 'https://api.neverpayextra.com/v1/track-upc', headers }).then(data => {
		req.session['track-message-result'] = `This product has been tracked! We'll check the price daily and notify you when it drops below ${req.body.target}`;

		res.render('track', { session: req.session });
	}).catch(err => {
		req.session['track-message-result'] = `There was an error when tracking the product. Please <a href='/contact-us' target='_blank'>contact us here</a>.`;

		res.render('track', { session: req.session });
	});
});

router.get('/chrome', (req, res) => res.redirect('https://chrome.google.com/webstore/detail/lkocokbbpjnnfhibjlnhfkkibjdjdkoi'));

router.get('/firefox', (req, res) => res.redirect('https://addons.mozilla.org/en-US/firefox/addon/never-pay-extra/'));

router.get('/audible', (req, res) => res.redirect('https://amzn.to/2ygMSRl'));

router.get('/prime', (req, res) => res.redirect('https://amzn.to/2M0bvnF'));

router.get('/prime-student', (req, res) => res.redirect('https://amzn.to/2JNJNO7'));

router.get('/robots.txt', (req, res) => {
	res.type('text/plain');
	res.send('User-agent: *\nDisallow:');
});
router.get('/sitemap.xml', (req, res) => res.sendFile('/var/app/current/sitemap.xml'));

router.get('*', (req, res) => res.render('404'));

module.exports = router;
