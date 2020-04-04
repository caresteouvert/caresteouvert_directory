const { Pool } = require('pg');

const pgPool = new Pool();
const poiOsmTable = 'poi_osm';
const normalizedCatColumn = 'normalized_cat';

const queries = (table) => {
    return {
        selectDistinctFrom: (column) => `SELECT DISTINCT(${column}) FROM ${table};`,
        selectWhereCategory: (category) => `SELECT * FROM ${table} WHERE ${normalizedCatColumn}='${category}' limit 25;`,
        selectWhereCategoryPage: (category, count, offset) => {
            return `SELECT * FROM ${table} WHERE ${normalizedCatColumn}='${category}' ORDER BY fid LIMIT ${count} OFFSET ${offset};`;
        },
    }
};

module.exports = {
    listNormalizedCat: () => {
        return pgPool.query(queries(poiOsmTable).selectDistinctFrom(normalizedCatColumn))
            .then(res => res.rows.map((row => row[normalizedCatColumn])));
    },
    listEntries: (cat, count, page) => {
        const offset = count * page;
        return pgPool.query(queries(poiOsmTable).selectWhereCategoryPage(cat, count, offset))
            .then(res => res.rows);
    },
    close: () => {
        pgPool.end();
    },
}
