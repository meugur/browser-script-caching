// Attempt at local web server that instruments script files
// Security issues with this approach

const url = require('url');
const http = require('http');
const https = require('https');

const hostname = '127.0.0.1';
const port = 8080;

const overwriteScript = (data) => {
    return "// comment added - meugur \n" + data;
};

const server = http.createServer((req, res) => {
    let query = url.parse(req.url, true).query

    console.log(query);

    if (query.url === undefined) {
        res.end();
        return;
    }

    https.get(query.url, (resp) => {
        let body = "";
        resp.on("data", data => {
            body += data;
        });
        resp.on("end", () => {
            res.writeHead(
                200,
                {
                    'Cache-Control': 'public, max-age=31536000',
                    'Content-Type': 'application/javascript',
                }
            );
            res.end(overwriteScript(body));
        });
      }).on('error', (e) => {
        console.error(e);
      });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
