const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pgPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const poiOsmTable = 'poi_osm';
const normalizedCatColumn = 'normalized_cat';
const fidColumn = 'fid';

const queries = (table) => {
    return {
        selectDistinctFrom: (column) => `SELECT DISTINCT(${column}) FROM ${table};`,
        selectWhereCategoryPage: (category, count, offset) => {
            return `SELECT * FROM ${table} WHERE ${normalizedCatColumn}='${category}' ORDER BY fid LIMIT ${count} OFFSET ${offset};`;
        },
        selectWhereFid: (fid) => `SELECT * FROM ${poiOsmTable} WHERE ${fidColumn}='${fid}';`,
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
    readPoi: (fid) => {
        return pgPool.query(queries(poiOsmTable).selectWhereFid(fid))
            .then(res => {
                return res.rows.shift()
            });
    },
    close: () => {
        pgPool.end();
    },
}
