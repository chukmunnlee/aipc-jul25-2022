const { join } = require('path')
const morgan = require('morgan')
const fortune = require('fortune-cookie')
const express = require('express')
const { create } = require('express-handlebars')

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000)
const FORTUNES = fortune.length;

console.info(`PORT: ${PORT}`)

const getFortune = () => {
	let i =  parseInt(Math.random() * FORTUNES);
	return fortune[i];
}

const app = express();

app.engine('hbs', create().engine);
app.set('view engine', 'hbs')

app.use(morgan('tiny'))

app.get(['/', '/index.html', '/fortune'], (req, resp) => {
	resp.status(200)
	resp.format({
		'text/html': () => {
			resp.type('text/html')
			resp.render('fortune', { text: getFortune(), layout: false })
		},
		'application/json': () => {
			resp.type('application/json');
			resp.json({ fortune: getFortune() });
		},
		'default': () => {
			resp.status(406).end();
		}
	})
})

app.get([ '/health', '/healthz' ], (req, resp) => {
	resp.status(200)
	resp.type('text/plain')
	resp.end(`OK ${new Date()}`);
})

app.get(/.*/, express.static(join(__dirname, 'public')));

app.use((req, resp) => {
	resp.status(404)
	resp.format({
		'text/html': () => {
			resp.type('text/html')
			resp.sendFile(join(__dirname, 'public', '404.html'))
		},
		'application/json': () => {
			resp.type('application/json');
			resp.json({ error: 'not found' })
		},
		'default': () => {
			resp.type('text/plain').end('Not found');
		}
	})
})

app.listen(PORT, () => {
	console.info('Application started on port %d at %s'
		, PORT, new Date());
});
