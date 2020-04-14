const express = require('express'),
    app = express(),
    db = require('./db'),
    _ = require('lodash'),
    i18next = require('i18next'),
    i18nextMiddleware = require('i18next-express-middleware'),
    Backend = require('i18next-node-fs-backend');

const hostname = '0.0.0.0',
    port = process.env.PORT || 3000,
    baseRoute = '/annuaire',
    elementPerPage = 100;

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

const defaultErrorHandler = (err, res) => {
    console.warn(err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(err));
}

// route to annuaire
app.get(`${baseRoute}`, function (req, res) {
    db.listNormalizedCat().then(data => {
        res.render('annuaire', {
            cats: data,
            url: {
                base: baseRoute,
                postfix: '-0',
            },
        });
    }).catch(err => defaultErrorHandler(err, res));
});

// route to category page
app.get(`${baseRoute}/:category-:page`, function (req, res) {
    const cat = req.params['category'];
    const page = req.params['page'] ? parseInt(req.params['page']) : 0;
    db.listEntries(cat, elementPerPage, page)
        .then(rows => {
            res.render('per-category', {
                cat: cat,
                pois: rows,
                page: page,
                elementPerPage: elementPerPage,
                paginatedUrl: `${baseRoute}/${cat}-`,
            });
        }).catch(err => defaultErrorHandler(err, res));
});

// route to poi
app.get(`${baseRoute}/:category/:reg/:dep/:com/:nom,:fid`, function (req, res) {
    const cat = req.params['category'],
        reg = req.params['reg'],
        fid = req.params['fid'];
    db.readPoi(fid)
        .then(poi => {
            res.render('poi-full', {
                poi: poi,
            });
        }).catch(err => defaultErrorHandler(err, res));
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.on('close', () => {
    db.close();
});

process.on('SIGINT', () => {
    app.close();
});
