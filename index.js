const express = require('express');
const app = express();
const db = require('./db');
const _ = require('lodash');

const hostname = '0.0.0.0';
const port = 3000;
const baseRoute = '/annuaire';
const elementPerPage = 30;

class Link {
    href = '';
    rel = '';
    type = 'text/html';
    method = 'GET';

    constructor(href, rel) {
        this.href = href;
        this.rel = rel;
    }
}

class Annuaire {
    categories = [];
    links = [];

    constructor(cats) {
        this.categories = cats;
        this.links = cats.map(this.linkFor);
    }

    linkFor = cat => new Link(`${baseRoute}/${cat}-0`, cat);

    toString = () => JSON.stringify(this, null, 2);

    toHtml = () => {
        const catLis = _.join(this.categories.map(cat => `<li><a href="${this.linkFor(cat).href}">${cat}</a></li>`), '');
        const links = _.join(
            this.links.map(link => {
                return `<link rel="${link.rel}" href="${link.href}" />`;
            }), '');
        return `
            <html>
            <head><title>Ca reste ouvert - Catégories des commerces et lieux ouverts durant le confinement</title></head>
            <body>
                <div>Les catégories présentes sont :
                    <ul>${catLis}</ul>
                </div>
                <links>${links}</links>
            </body>
            </html>
        `;
    };
}

app.get(`${baseRoute}`, function (req, res) {
    db.listNormalizedCat().then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(new Annuaire(data).toHtml());
    }).catch(err => {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
});

app.get(`${baseRoute}/:category-:page`, function (req, res) {
    console.log(req.url);
    console.log(req.params);

    const cat = req.params['category'];
    const page = req.params['page'] ? parseInt(req.params['page']) : 0;
    db.listEntries(cat, elementPerPage, page)
        .then(rows => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(`
            <html>
            <head><title>Ca reste ouvert - POI de type "${cat}" ouverts durant le confinement</title></head>
            <body>
                <div>
                    <ul>
                        ${ _.join(rows.map(row => `<li>${row.fid} - ${row.name} - ${row.status}</li>`), '')}
                        ${ (page > 0) ? `<li><a href='${baseRoute}/${cat}-${page - 1}'>Precedent</a></li>` : ''}
                        ${ (rows.length < elementPerPage) ? '' : `<li><a href='${baseRoute}/${cat}-${page + 1}'>Suivant</a></li>`}
                    </ul>
                </div>
            </body>
            </html>`);
        })
        .catch(err => {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(err));
        });
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
