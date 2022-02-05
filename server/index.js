const restify = require('restify');
const Pool = require('pg').Pool

// const pool = new Pool({
//   user: 'vincent',
//   host: 'localhost',
//   database: 'bikemap',
//   port: 5432,
// })

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
})

function respondPoint(req, res, next) {
  pool.query(`SELECT 
      ST_AsGeoJSON(geog_point) as geo_json, name FROM features WHERE type = '${req.params.type}' ORDER BY id ASC`, (error, results) => {
    if (error) {
      throw error
    }
    res.send(results.rows.map(({ geo_json, ...rest }) => ({
      ...rest,
      geo_json: JSON.parse(geo_json)
    })));
    next();
  })
}

function respondLine(req, res, next) {
  pool.query(`
    SELECT
      ST_AsGeoJSON(geog_line) as geo_json,
      name
    FROM
      features
    WHERE
      type = '${req.params.type}'
    ORDER BY id ASC
  `, (error, results) => {
    if (error) {
      throw error
    }
    res.send(results.rows.map(({ geo_json, ...rest }) => ({
      ...rest,
      geo_json: JSON.parse(geo_json)
    })));
    next();
  })
}

var server = restify.createServer();
server.get('/point-features/:type', respondPoint);
server.head('/point-features/:type', respondPoint);

server.get('/line-features/:type', respondLine);
server.head('/line-features/:type', respondLine);


server.listen(process.env.PORT || 8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});