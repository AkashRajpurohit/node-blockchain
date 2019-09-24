const express = require('express');
const uuid = require('uuid/v1');

const Blockchain = require('./lib/blockchain');

const NODE_ADDRESS = uuid().split('-').join('');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const bitcoin = new Blockchain();

app.get('/blockchain', (req, res) => {
	res.send(bitcoin);
});

app.post('/transaction', (req, res) => {
	const { amount, sender, recipient } = req.body;
	const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);

	res.json({ note: `Transaction will be added in block ${blockIndex}.`})
});

app.get('/mine', (req, res) => {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};

	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

	// Reward this node
	bitcoin.createNewTransaction(12.5, "00", NODE_ADDRESS);

	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	res.json({
		note: 'New block mined successfully',
		block: newBlock
	});

});


const PORT = process.argv[2];
app.listen(PORT, console.log(`Server started at port: ${PORT}`))