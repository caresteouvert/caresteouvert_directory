const { Pool } = require('pg');

const pgPool = new Pool();
const poiOsmTable = 'poi_osm';
const normalizedCatColumn = 'normalized_cat';
const selectDistinctFrom = (column, table) => `SELECT DISTINCT(${column}) FROM ${table};`;
const selectWhereCategory = (category, table) => `SELECT * FROM ${table} WHERE ${normalizedCatColumn}='${category}' limit 25;`;
const selectWhereCategoryPage = (category, count, offset, table) => {
    return `SELECT * FROM ${table} WHERE ${normalizedCatColumn}='${category}' ORDER BY fid LIMIT ${count} OFFSET ${offset};`;
}

module.exports = {
    listNormalizedCat: () => {
        return pgPool.query(selectDistinctFrom(normalizedCatColumn, poiOsmTable))
            .then(res => res.rows.map((row => row[normalizedCatColumn])));
    },
    listEntries: (cat, count, page) => {
        const offset = count * page;
        return pgPool.query(selectWhereCategoryPage(cat, count, offset, poiOsmTable))
            .then(res => res.rows);
    },
    close: () => {
        pgPool.end();
    },
}
