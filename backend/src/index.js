const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Restore the API server code from commit f1f717b3de50e24c434ff4dff6a210c2e265e9a5

// Root GET / route
app.get('/', (req, res) => {
    res.status(200).send('200 OK');
});

// Root HEAD / route
app.head('/', (req, res) => {
    res.status(200).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
