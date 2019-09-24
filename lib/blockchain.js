const crypto = require('crypto');

class Blockchain {
	constructor() {
		this.chain = [];
		this.pendingTransactions = [];

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
			recipient
		};

		this.pendingTransactions.push(newTransaction);

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
}

module.exports = Blockchain;