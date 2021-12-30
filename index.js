const restify = require('restify');
const Pool = require('pg').Pool

const pool = new Pool({
  user: 'vincent',
  host: 'localhost',
  database: 'bikemap',
  port: 5432,
})

function respond(req, res, next) {
  pool.query(`SELECT ST_XMax(geog::geometry) as long, ST_YMax(geog::geometry) as lat, name FROM features WHERE type = '${req.params.type}' ORDER BY id ASC`, (error, results) => {
    if (error) {
      throw error
    }
    res.send(results.rows);
    next();
  })
}

var server = restify.createServer();
server.get('/features/:type', respond);
server.head('/features/:type', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});