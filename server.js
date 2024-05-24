const http = require('http');
const fs = require('fs');
const url = require('url');

const DATA_FILE = 'hospitals.json';

// Utility function to read JSON data from file
function readData(callback) {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, JSON.parse(data));
        }
    });
}

// Utility function to write JSON data to file
function writeData(data, callback) {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8', callback);
}

// Create server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname;
    const id = parsedUrl.query.id;

    if (path === '/hospitals') {
        if (method === 'GET') {
            readData((err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                }
            });
        } else if (method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const newHospital = JSON.parse(body);
                readData((err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    } else {
                        data.push(newHospital);
                        writeData(data, err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            } else {
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(newHospital));
                            }
                        });
                    }
                });
            });
        } else if (method === 'PUT' && id) {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const updatedHospital = JSON.parse(body);
                readData((err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    } else {
                        const index = data.findIndex(hospital => hospital.name === id);
                        if (index !== -1) {
                            data[index] = updatedHospital;
                            writeData(data, err => {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify(updatedHospital));
                                }
                            });
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Hospital Not Found' }));
                        }
                    }
                });
            });
        } else if (method === 'DELETE' && id) {
            readData((err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    const index = data.findIndex(hospital => hospital.name === id);
                    if (index !== -1) {
                        data.splice(index, 1);
                        writeData(data, err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            } else {
                                res.writeHead(204, { 'Content-Type': 'application/json' });
                                res.end();
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Hospital Not Found' }));
                    }
                }
            });
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad Request' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
