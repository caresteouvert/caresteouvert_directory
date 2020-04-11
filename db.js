const { Pool } = require('pg'),
    _ = require('lodash');

const connectionString = process.env.DATABASE_URL;

const pgPool = new Pool({ connectionString });
const poiOsmTable = 'poi_osm';
const normalizedCatColumn = 'normalized_cat';
const fidColumn = 'fid';

const colums = {
    poi:
        [
            'fid', 'name', 'cat', 'normalized_cat',
            'brand', 'brand_wikidata', 'brand_hours', 'brand_infos',
            'status', 'opening_hours', 'delivery', 'tags',
        ].map(col => 'poi.' + col),
    poiLocation:
        [
            'ST_X(ST_Transform(poi.geom, 4326)) AS lon',
            'ST_Y(ST_Transform(poi.geom, 4326)) AS lat',
        ],
    com: ['com', 'libelle'].map(col => `com.${col} AS com_${col}`),
    dep: ['dep', 'libelle'].map(col => `dep.${col} AS dep_${col}`),
    reg: ['reg', 'libelle'].map(col => `reg.${col} AS reg_${col}`),
}

const queryPoi =
    'SELECT ' + _.join(_.concat(colums.poi, colums.poiLocation, colums.com, colums.dep, colums.reg), ',') +
    '  FROM cog_commune com' +
    '  JOIN cog_departement dep ON com.dep=dep.dep' +
    '  JOIN cog_region reg ON reg.reg=com.reg' +
    '  JOIN polygones_insee polygon ON polygon.insee_com=com.com' +
    '  JOIN poi_osm poi ON ST_CONTAINS(polygon.geometrie, poi.geom) ',

    wherePoiCategory = (category) => `  WHERE poi.normalized_cat='${category}' `,
    orderByFidPaginated = (count, offset) => `  ORDER BY poi.fid LIMIT ${count} OFFSET ${offset} `,
    wherePoiFid = (fid) => `  WHERE poi.fid='${fid}'`,
    queryCategories = 'SELECT DISTINCT(normalized_cat) FROM poi_osm';

module.exports = {
    listNormalizedCat: () => {
        const query = queryCategories + ';';
        return pgPool.query(query)
            .then(res => res.rows.map((row => row[normalizedCatColumn])));
    },
    listEntries: (cat, count, page) => {
        const offset = count * page;
        const query = queryPoi + wherePoiCategory(cat) + orderByFidPaginated(count, offset) + ';';
        return pgPool.query(query)
            .then(res => res.rows);
    },
    readPoi: (fid) => {
        const query = queryPoi + wherePoiFid(fid) + ';';
        return pgPool.query(query)
            .then(res => {
                return res.rows.shift()
            });
    },
    close: () => {
        pgPool.end();
    },
}
