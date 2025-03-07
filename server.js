const express = require('express');
const app = express();
const port = 8123;

// Middleware per abilitare CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('mode', 'no-cors');
    next();
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
