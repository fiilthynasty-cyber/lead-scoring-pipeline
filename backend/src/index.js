const express = require('express');
const app = express();

// Handle GET request for the root URL
app.get('/', (req, res) => {
    res.sendStatus(200);
});

// Handle HEAD request for the root URL
app.head('/', (req, res) => {
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});