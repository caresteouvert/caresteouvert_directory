const express = require('express');
const app = express();
const db = require('./db');

const hostname = '0.0.0.0';
const port = 3000;
const baseRoute = '/annuaire';

app.get(`${baseRoute}`, function (req, res) {
    db.fetchData().then(data => {
        console.log('data has been fetched', data);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }).catch(err => {
        console.error('error fetching data', err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
    });
});

app.get(`${baseRoute}/*`, function (req, res) {
    console.log('getting url', req.url);
    res.end('');
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
