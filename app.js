const express = require('express');

const app = express();

app.get('/blockchain', (req, res) => {

});

app.post('/transaction', (req, res) => {

});

app.get('/mine', (req, res) => {

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started at port: ${port}`))