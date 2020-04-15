const express = require('express'),
    app = express(),
    view_routes = require('./view-routes'),
    api_routes = require('./api-routes'),
    _ = require('lodash'),
    i18next = require('i18next'),
    i18nextMiddleware = require('i18next-express-middleware'),
    Backend = require('i18next-node-fs-backend');

const hostname = '0.0.0.0',
    port = process.env.PORT || 3000;

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: __dirname + '/locales/{{lng}}.json',
            addPath: __dirname + '/locales/{{lng}}.missing.json'
        },
        detection: {
            order: ['querystring', 'cookie'],
            caches: ['cookie']
        },
        fallbackLng: 'en',
        preload: ['en', 'fr'],
        saveMissing: true
    });

app.set('view engine', 'pug')
app.use(i18nextMiddleware.handle(i18next));

app.use('/annuaire', view_routes);
app.use('/directory', api_routes);

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.on('close', () => {
    db.close();
});

process.on('SIGINT', () => {
    app.close();
});
