const express = require('express');
const path = require('path');
const app = express();

// Serve static files (html, css, js, images)
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});