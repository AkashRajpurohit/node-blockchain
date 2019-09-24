const express = require('express');
const uuid = require('uuid/v1');
const rp = require('request-promise');

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

// register a new node and broadcast it to network
app.post('/register-and-broadcast-node', async (req, res) => {
	const { newNodeUrl } = req.body;
	if(bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {
		bitcoin.networkNodes.push(newNodeUrl);
	}

	const registerNodesPromises = [];

	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl },
			json: true
		};

		registerNodesPromises.push(rp(requestOptions))
	});

	try {
		await Promise.all(registerNodesPromises);
	} catch(e) {
		console.error("Error registering nodes: ", e);
	}

	const bulkRegisterOptions = {
		uri: newNodeUrl + '/register-node-bulk',
		method: 'POST',
		body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
		json: true
	};

	try {
		await rp(bulkRegisterOptions);
		res.json({ note: 'New node registered with network successfully.' });
	} catch(e) {
		console.error("Error bulk registering nodes: ", e)
	}

});

// register a new node
app.post('/register-node', (req, res) => {
	const { newNodeUrl } = req.body;

	if(!bitcoin.networkNodes.includes(newNodeUrl)
			&& bitcoin.currentNodeUrl !== newNodeUrl) {
		bitcoin.networkNodes.push(newNodeUrl);
	}

	res.json({ note: 'New node registered successfully.' })
});

// register multiple nodes at once
app.post('/register-node-bulk', (req, res) => {
	const { allNetworkNodes } = req.body;

	allNetworkNodes.forEach(networkNodeUrl => {
		if(!bitcoin.networkNodes.includes(networkNodeUrl)
				&& bitcoin.currentNodeUrl !== networkNodeUrl) {
			bitcoin.networkNodes.push(networkNodeUrl);
		}
	});

	res.json({ note: 'Bulk registeration successful.' });
});


const PORT = process.argv[2];
app.listen(PORT, console.log(`Server started at port: ${PORT}`))