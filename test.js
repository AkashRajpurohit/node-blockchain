const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(2321, "adkljasldka", "asoidi011");
bitcoin.createNewBlock(2123, "aslkdqwxqlkm", "iacjialncas");
bitcoin.createNewBlock(4211, "0poqp31xnsakl", "laknsdlkasl");

console.log(bitcoin);