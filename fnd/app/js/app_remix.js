console.log("Using web3 version: " + Web3.version);
web3js = new Web3(new Web3.providers.HttpProvider("https://www.rinkeby.infura.io/"));

web3js.eth.getAccounts().then(function (accounts) {
   web3js.eth.defaultAccount = accounts[0];
   console.log("Default account: " + web3js.eth.defaultAccount);
});

function postArticle(article) {
  contract.methods.createArticleMarket(String(article)).call()
  .then(function(result) {
      alert("Article Posted!");
  }).catch(function(e) {
      alert(e);// There was an error! Handle it.
  });
}

$("#post_button").click(function(){
  var article = $("url").val();
  postArticle(article);
});

$("#button").click(function() {
   var toAddress = $("#address").val();
   var amount = $("#amount").val();
   contract.methods.transfer(toAddress, amount).send({from: web3js.eth.defaultAccount});
});


var abi = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "_article",
				"type": "string"
			}
		],
		"name": "articleExists",
		"outputs": [
			{
				"name": "exists",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_article",
				"type": "string"
			}
		],
		"name": "createArticleMarket",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "markets",
		"outputs": [
			{
				"name": "articleHash",
				"type": "bytes32"
			},
			{
				"name": "creator",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];
var address = "0x595e89af9c4183c55de864594808b856e91e7932"; // Replace this address

var contract = new web3js.eth.Contract(abi, address);
console.log(contract);
