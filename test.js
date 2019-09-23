const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(2321, "adkljasldka", "asoidi011");

bitcoin.createNewTransaction(100, "ALEXHHUIBKJBKJH", "JENSDLKKSKXNL");

bitcoin.createNewBlock(34112, "jasknkjajasas", "asjdnajsndjasl");

bitcoin.createNewTransaction(50, "ALEXHHUIBKJBKJH", "JENSDLKKSKXNL");
bitcoin.createNewTransaction(200, "ALEXHHUIBKJBKJH", "JENSDLKKSKXNL");
bitcoin.createNewTransaction(3000, "ALEXHHUIBKJBKJH", "JENSDLKKSKXNL");

bitcoin.createNewBlock(88294, "aslkjdaslkjlkxmlsk", "aSKJAjanJNLKKS");

console.log(bitcoin);