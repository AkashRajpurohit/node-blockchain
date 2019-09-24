const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

const previousHashBlock = 'KLDSFKLSADLKASMXKLMASLKADAAX';

const currentBlockData = [
	{
		amount: 20,
		sender: 'IQQPWEQWNXOQIIOQASD',
		recipient: 'WNECLJNSAKMCDWPEOWOEC'
	},
	{
		amount: 50,
		sender: 'ISDCJINWLELKCXNX',
		recipient: 'POQWXSAKLNANSKLNLD'
	},
	{
		amount: 20,
		sender: 'JKSDASVKJSDNDLICJOD',
		recipient: 'ASDIASJDPAOSDOASJDPAS'
	},
];

const nonce = 21321432;

const hash = bitcoin.hashBlock(previousHashBlock, currentBlockData, nonce);

console.log(hash);