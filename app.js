const express = require('express');

const Blockchain = require('./lib/blockchain');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const bitcoin = new Blockchain();

app.get('/blockchain', (req, res) => {
	res.send(bitcoin);
});

app.post('/transaction', (req, res) => {

});

app.get('/mine', (req, res) => {

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started at port: ${PORT}`))