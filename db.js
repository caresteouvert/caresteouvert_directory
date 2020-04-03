const { Pool } = require('pg');
const Cursor = require('pg-cursor');

//const pgClient = new Client();
const pgPool = new Pool();
const poiOsmTable = 'poi_osm';
const normalizedCatColumn = 'normalized_cat';
const selectDistinctFrom = (column, table) => `SELECT DISTINCT(${column}) FROM ${table};`;

module.exports = {
    fetchData: () => {
        return pgPool.query(selectDistinctFrom(normalizedCatColumn, poiOsmTable))
            .then(res => res.rows.map((row => row[normalizedCatColumn])));
    },
    close: () => {
        pgPool.end();
    },
}
