function app() {
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
  console.log("Using web3 version: " + Web3.version);

  var contract;
  var userAccount;

  var contractDataPromise = $.getJSON('FakeNewsMarket.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  var isLocal = true;
  var path = "https://dapps.stanford.edu/fakenewsdetector/";
  if (isLocal) {
    path = "http://localhost:3000/fakenewsdetector/"
  }

  $('#url').val(window.location.search.split('=')[1]);

  $.get(
    path + "articles_open",
    // {paramOne : 1, paramX : 'abc'},
    function(data) {
      //$('#feed').text(data[0].url);
      data.forEach(function(article) {
        var inHTML = "";
        $.each(data, function(index, value) {
          var article = " \
          <article> \
          <header> \
          <span class=\"date\">Vote Deadline: "+value.deadline+"</span> \
          <h2><a href=\""+value.url+"\">"+value.title+"</a></h2>\
          </header>\
          <!-- <a href=\"#\" class=\"image fit\"><img src=\"images/pic02.jpg\" alt=\"\" /></a> -->\
          <!--  <input type=\"radio\" id=\"no-errors\" name=\"demo-priority\" checked>\
          // <label for=\"no-errors\">No errors</label>\
          // <input type=\"radio\" id=\"some-errors\" name=\"demo-priority\" checked>\
          // <label for=\"some-errors\">Some errors</label>\
          // <input type=\"radio\" id=\"many-errors\" name=\"demo-priority\" checked>\
          // <label for=\"many-errors\">Many errors</label>\
          // <ul class=\"actions\"> \-->\
          <a href=\"vote.html?url="+value.url+"\"class=\"button\">Vote</a>\
          <a href=\"outcome.html?url="+value.url+"\"class=\"button\">View Outcome</a>\
          </article>"
          inHTML += article;
        });
        console.log(inHTML);
        $('#article_feed').html(inHTML);
      });
    }
  );
  $.get(
    path + "articles_closed",
    // {paramOne : 1, paramX : 'abc'},
    function(data) {
      //$('#feed').text(data[0].url);
      data.forEach(function(article) {
        var inHTML = "";
        $.each(data, function(index, value) {
          var article = " \
          <article> \
          <header> \
          <h2><a href=\""+value.url+"\">"+value.title+"</a></h2>\
          <h3>Outcome: FAKE NEWS"+value.deadline+"</h3> \
          </header>\
          </article>"
          inHTML += article;
        });
        $('#closed_article_feed').html(inHTML);
      });
    }
  );

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

    var contractAddress = "0x9fb697e303caceae55eaeb3d6370711061d79c89";
    contract = new web3.eth.Contract(contractData.abi, contractAddress);
    console.log("Contract Address:", contract);
    console.log("got to end of first then")
    $("#loader").hide();

  })
  .catch(console.error);

  function postArticle(article, deadline) {
    console.log(path + "post_article?url="+article+"&deadline="+deadline);
    console.log(article.valueOf());
    console.log(Date.parse(deadline));
    $("#loader").show();
    contract.methods.createArticleMarket(article.valueOf(),Date.parse(deadline)).send({from:userAccount})
    .then(function(result) {
      $.get(
        path + "post_article?url="+article+"&deadline="+deadline
      );
      $("#loader").hide();

      alert("Article Posted!");
    }).catch(function(e) {
      alert(e);// There was an error! Handle it.
    });
  }

  function reportArticle(article, report, rep) {
    contract.methods.report(article.valueOf(), report, rep).send({from:userAccount})
    .then(function(result) {
      alert("Successfully Reported!");
    }).catch(function(e) {
      alert(e);// There was an error! Handle it.
    });
  }

  function signUpReporter(email) {
    console.log(email.valueOf());
    contract.methods.addReporter(userAccount, email.valueOf()).send({from:userAccount})
    .then(function(result) {
      alert("Successfully Signed up!");
    }).catch(function(e) {
      alert(e);
    });
  }

  $("#report_button").click(function(){
    var article = $("#url").val();
    var amount = $("#amount").val();
    if (amount <= 0) {
      alert("You must bet reputation greater than 0.");
    }
    var reportId;
    if (document.getElementById('report0').checked) {
      reportId = 0;
    }
    if (document.getElementById('report1').checked) {
      reportId = 1;
    }
    if (document.getElementById('report2').checked) {
      reportId = 2;
    }
    if (article != '' && (reportId == 0 || reportId == 1 || reportId == 2)) {
      reportArticle(article, reportId, amount);
    }
    else {
      alert("Invalid input!")
    }
  });

  $("#signup_button").click(function() {
    var email=$("#email").val();
    console.log(userAccount);
    signUpReporter(email);
  });

  $("#post_button").click(function(){
    console.log("hit post button");
    var article = $("#url").val();
    var deadline = $("#deadline").val();
    if (article != '' && deadline != '') {
      postArticle(article, deadline);
    }
    else {
      alert("Please fill in both fields");
    }
  });

  $("#vote_button").click(function() {
    var url = $("#url").val();
    var vote = $('input[name=vote]:checked').val();
    var amount = $("#amount").val();
    if (amount <= 0) {
      alert("You must bet a sum greater than 0.");// There was an error! Handle it.
    } else {
      contract.methods.vote(url.valueOf(), vote).send({from:userAccount, value: web3.utils.toWei(amount, "ether")})
      .then(function(result) {
        alert("Voted !");
      }).catch(function(e) {
        alert(e);// There was an error! Handle it.
      });
    }
  });

  $("#close_market").click(function(){
    var url = $("#url").val();
    console.log("closing market");
    if (url != '') {
      contract.methods.close_market(url).send({from:userAccount})
      .then(function(result) {
        console.log(result);
        var inHTML = "Vote deadline has not passed yet.";
        var outcome = "No errors!";
        if (result < 256) {
          if (result == 1) {
            outcome = "Some errors.";
          } else {
            outcome = "Fake news!!";
          }
          inHTML = "Consensus is: " + outcome;
        }
        $('#closed_article_feed').html(inHTML);
      }).catch(function(e) {
        alert(e);
      });
    } else {
      alert("Please enter an article url.");
    }
  });
}

  $(document).ready(app);
