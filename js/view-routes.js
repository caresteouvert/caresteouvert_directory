const express = require('express'),
    router = express.Router(),
    db = require('./db'),
    errorHandler = require('./error-handler').defaultErrorHandler;

const elementPerPage = 100;

/**
 * route to list of categories
 */
router.get(`/`, function (req, res) {
    db.listNormalizedCat().then(data => {
        res.render('annuaire', {
            cats: data,
            url: req.originalUrl,
        });
    }).catch(err => errorHandler(err, res));
});

/**
 * route to category page
 */
router.get(`/:category`, function (req, res) {
    const cat = req.params['category'];
    const page = req.query['page'] ? parseInt(req.query['page']) : 0;
    db.listPoisByCat(cat, elementPerPage, page)
        .then(rows => {
            res.render('per-category', {
                cat: cat,
                pois: rows,
                page: page,
                elementPerPage: elementPerPage,
                paginatedUrl: `${req.baseUrl}/${cat}?page=`,
            });
        }).catch(err => errorHandler(err, res));
});

/**
 * route to poi
 */
router.get(`/:category/:reg/:dep/:com/:nom,:fid`, function (req, res) {
    const cat = req.params['category'],
        reg = req.params['reg'],
        fid = req.params['fid'];
    db.readPoi(fid)
        .then(poi => {
            res.render('poi-full', {
                poi: poi,
            });
        }).catch(err => errorHandler(err, res));
});

module.exports = router;
