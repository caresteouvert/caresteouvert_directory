const express = require('express'),
    router = express.Router(),
    db = require('./db'),
    errorHandler = require('./error-handler').defaultErrorHandler;

const elementPerPage = 100;

/**
 * Route to Regions list
 */
router.get(`/`, function (req, res) {
    db.listRegs()
        .then(regs => {
            res.json({
                data: regs,
                links: regs.map(reg => {
                    return {
                        url: `${req.baseUrl}/${reg.libelle}`,
                        alt: `Departments in ${reg.libelle}`,
                    }
                }),
            });
        }).catch(err => errorHandler(err, res));
});

/**
 * route to region
 */
router.get(`/:reg`, function (req, res) {
    db.listDeps(req.params['reg'])
        .then(deps => res.json({
            data: deps,
            links: deps.map(dep => {
                return {
                    url: `${req.originalUrl}/${dep.libelle}`,
                    alt: `Link to department ${dep.libelle}`,
                }
            })
        })).catch(err => errorHandler(err, res));
});

/**
 * route to department
 */
router.get(`/:reg/:dep`, function (req, res) {
    db.listComs(req.params['dep'])
        .then(coms => res.json({
            data: coms,
            links: coms.map(com => {
                return {
                    url: `${req.originalUrl}/${com.libelle}`,
                    alt: `Link to county ${com.libelle}`,
                }
            })
        })).catch(err => errorHandler(err, res));
});

/**
 * route to categories
 */
router.get(`/:reg/:dep/:com`, function (req, res) {
    const com = req.params['com'];
    db.listNormalizedCat()
        .then(categories => {
            res.json({
                data: categories,
                links: categories.map(cat => {
                    return {
                        url: `${req.originalUrl}/${cat}?page=0`,
                        alt: `POIs ${cat} in ${com}`,
                    }
                }),
            });
        }).catch(err => errorHandler(err, res));
});

/**
 * route to category page
 */
router.get(`/:reg/:dep/:com/:category`, function (req, res) {
    const cat = req.params['category'];
    const com = req.params['com'];
    const page = req.query['page'] ? parseInt(req.query['page']) : 0;
    const pageQueryParam = '?page=';
    const urlWithoutPage = (url) => {
        const index = url.indexOf(pageQueryParam);
        return index > 0 ? url.substring(0, index) : url;
    };
    const urlAtPage = (url, targetPage) => {
        return urlWithoutPage(url) + pageQueryParam + targetPage;
    };

    const navigationForPage = (url, page, elements) => {
        const previous = page > 0 ? [{
            url: urlAtPage(url, page - 1),
            alt: `Previous`,
        }] : [];
        const next = elements >= elementPerPage ? [{
            url: urlAtPage(url, page + 1),
            alt: `Next`,
        }] : [];
        return [].concat(previous, next);
    }

    db.listPoisByCatAndCom(cat, com, elementPerPage, page)
        .then(pois => {
            res.json({
                data: pois,
                links: pois.map(poi => {
                    return {
                        url: `${urlWithoutPage(req.originalUrl)}/${poi.name},${poi.fid}`,
                        alt: `Description for POI ${poi.cat} ${poi.name}`,
                    }
                }).concat(navigationForPage(req.originalUrl, page, pois.length)),
            });
        }).catch(err => errorHandler(err, res));
});

/**
 * route to poi
 */
router.get(`/:reg/:dep/:com/:category/:nom,:fid`, function (req, res) {
    const fid = req.params['fid'];
    db.readPoi(fid)
        .then(poi => res.json({
            data: poi,
            links: {},
        })).catch(err => errorHandler(err, res));
});

module.exports = router;
