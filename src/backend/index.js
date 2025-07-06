const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để parse JSON body
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
