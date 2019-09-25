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
	const { newTransaction } = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);

	res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transaction/broadcast', async (req, res) => {
	const { amount, sender, recipient } = req.body;
	const newTransaction = bitcoin.createNewTransaction(amount, sender, recipient);

	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const newTransactionPromises = [];

	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: { newTransaction },
			json: true
		}

		newTransactionPromises.push(rp(requestOptions));
	});

	try {
		await Promise.all(newTransactionPromises);
	} catch(e) {
		console.log(e);
		return;
	}

	res.json({ note: 'Transaction created and broadcasted successfully.' });

});

app.get('/mine', async (req, res) => {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};

	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	const addNewBlockPromises = [];

	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock },
			json: true
		}

		addNewBlockPromises.push(rp(requestOptions));
	});

	try {
		await Promise.all(addNewBlockPromises);
	} catch(e) {
		console.log(e);
		return;
	}

	// Reward this node
	const requestOptions = {
		uri: currentNodeUrl + '/transaction/broadcast',
		method: 'POST',
		body: {
			amount: 12.5,
			sender: '00',
			recipient: NODE_ADDRESS
		},
		json: true
	}

	try {
		await rp(requestOptions);
	} catch(e) {
		console.log("Reward did not processed: " ,e);
		return;
	}

	res.json({
		note: 'New block mined & broadcasted successfully.',
		block: newBlock
	});

});

app.post('/receive-new-block', (req, res) => {
	const { newBlock } = req.body;

	// Validate this new block before adding
	const lastBlock = bitcoin.getLastBlock();
	if(lastBlock['hash'] === newBlock.previousBlockHash 
		&& newBlock['index'] ===lastBlock['index'] + 1) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];

		res.json({ note: 'New block received and accepted.', newBlock });
	} else {
		res.json({ note: 'New block rejected.', newBlock });
	}
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