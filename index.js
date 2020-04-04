const express = require('express');
const app = express();
const db = require('./db');
const _ = require('lodash');

const hostname = '0.0.0.0';
const port = 3000;
const baseRoute = '/annuaire';
const elementPerPage = 30;

app.get(`${baseRoute}`, function (req, res) {
    db.listNormalizedCat().then(data => {
        res.render('annuaire', {
            cats: data,
            baseUrl: req.url,
            postfix: '-0',
        });
    }).catch(err => {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
});

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
        })
        .catch(err => {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        });
});

app.set('view engine', 'pug');

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.on('close', () => {
    db.close();
});

process.on('SIGINT', () => {
    app.close();
});
