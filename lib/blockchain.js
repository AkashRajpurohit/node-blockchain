const crypto = require('crypto');
const uuid = require('uuid/v1');

const currentNodeUrl = process.argv[3];

class Blockchain {
	constructor() {
		this.chain = [];
		this.pendingTransactions = [];

		this.currentNodeUrl = currentNodeUrl;
		this.networkNodes = [];

		this.createNewBlock(100, '0', '0'); // Genesis Block
	}

	createNewBlock(nonce, previousBlockHash, hash) {
		const newBlock = {
			index: this.chain.length + 1,
			timestamp: Date.now(),
			transactions: this.pendingTransactions,
			nonce,
			hash,
			previousBlockHash
		};

		this.pendingTransactions = [];
		this.chain.push(newBlock);

		return newBlock;
	}

	getLastBlock() {
		return this.chain[this.chain.length - 1];
	}

	createNewTransaction(amount, sender, recipient) {
		const newTransaction = {
			amount,
			sender,
			recipient,
			transactionId: uuid().split('-').join('')
		};

		return newTransaction;
	}

	addTransactionToPendingTransactions(transactionObj) {
		this.pendingTransactions.push(transactionObj);
		return this.getLastBlock()['index'] + 1;
	}

	hashBlock(previousBlockHash, currentBlockData, nonce) {
		const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

		const hash = crypto.createHash('sha256');
		hash.update(dataAsString);

		return hash.digest('hex');
	}

	proofOfWork(previousBlockHash, currentBlockData) {
		let nonce = 0;
		let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

		while(hash.substring(0, 4) !== '0000') {
			nonce += 1;
			hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		}

		return nonce;
	}

	chainIsValid(blockchain) {
		for(let i = 1; i < blockchain.length; i++) {
			const currentBlock = blockchain[i];
			const previousBlock = blockchain[i - 1];
			const blockHash = this.hashBlock(previousBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);

			if(blockHash.substring(0, 4) !== '0000') {
				return false;
			}

			if(currentBlock['previousBlockHash'] !== previousBlock['hash']) {
				return false;
			}
		}

		const genesisBlock = blockchain[0];
		// Check for genesis block
		const correctNonce = genesisBlock['nonce'] === 100;
		const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
		const correctHash = genesisBlock['hash'] === '0';
		const correctTransactions = genesisBlock['transactions'].length === 0;

		return correctNonce && correctPreviousBlockHash && correctHash && correctTransactions;
	}

	getBlock(blockHash) {
		this.chain.forEach(block => {
			if(block['hash'] === blockHash) {
				return block;
			}
		});

		return null;
	}

	getTransaction(transactionId) {
		this.chain.forEach(block => {
			block.transactions.forEach(transaction => {
				if(transaction['transactionId'] === transactionId) {
					return { transaction, block };
				}
			});
		});

		return null;
	}
}

module.exports = Blockchain;