function app() {
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
  console.log("Using web3 version: " + Web3.version);

  var contract;
  var userAccount;

  var contractDataPromise = $.getJSON('FakeNewsMarket.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts

  // $.get(
  //   "http://localhost:3000/articles",
  //       // {paramOne : 1, paramX : 'abc'},
  //       function(data) {
  //         $('#feed').text(data[0].url);
  //       }
  //     );
  //
  // $.get(
  //   "http://localhost:3000/users",
  //     // {paramOne : 1, paramX : 'abc'},
  //     function(data) {
  //       $('#users').text(data[0].first_name);
  //     }
  //   );

  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      console.log("starting init app");
      var contractData = results[0];
      var networkId = results[1];
      var accounts = results[2];
      userAccount = accounts[0];

      // Make sure the contract is deployed on the connected network
      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }

      var contractAddress = "0x595e89af9c4183c55de864594808b856e91e7932";
      console.log(contractAddress);
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
      console.log("got to end of first then")
    })
    .catch(console.error);

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

    // function vote(article, voteId){
    //   console.log("got to here in vote");
    //   console.log(voteId);
    // }

    $("#vote_button").click(function() {
      var article = $("url").val();
      var vote;
      if (document.getElementById('vote0').checked) {
        voteId = 0;
      }
      if (document.getElementById('vote1').checked) {
        voteId = 1;
      }
      if (document.getElementById('vote0').checked) {
        voteId = 2;
      }
    });

function transfer(to, amount) {
  console.log(to, amount)
  if (!to || !amount) return console.log("Fill in both fields");
  $("#loader").show();

  contract.methods.transfer(to, amount).send({from: userAccount})
  .then(refreshBalance)
  .catch(function (e) {
    $("#loader").hide();
  });
}

function mint(amount) {
  $("#loader").show();
  console.log(amount)
  console.log(userAccount)
  contract.methods.mint(amount).send({from: userAccount})
  .then(refreshBalance)
  .catch(function (e) {
    $("#loader").hide();
  });
}

$("#button").click(function() {
  var toAddress = $("#address").val();
  var amount = $("#amount").val();
  transfer(toAddress, amount);
});

$("#mint_button").click(function() {
  var amount = $("#amount").val();
  mint(amount);
});

$("#create_account_button").click(function() {
  var first_name = $("#first_name").val();
  var last_name = $("#last_name").val();
  var password = $("#password").val();
  // $.get(
  //   "http://localhost:3000/users",
  //   // {paramOne : 1, paramX : 'abc'},
  //   function(data) {
  //     for (var i in data)
  //     {
  //       console.log(data[i].first_name)
  //     }
  //
  //   }
  // );
});


}
$(document).ready(app);
