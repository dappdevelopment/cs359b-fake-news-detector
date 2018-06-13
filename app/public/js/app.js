function app() {
  if (typeof web3 == 'undefined') {
    $('#article_feed').html('No web3 detected. Is Metamask/Mist being used?');
    throw 'No web3 detected. Is Metamask/Mist being used?!!';
  }
  web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
  console.log("Using web3 version: " + Web3.version);

  var contract;
  var userAccount;

  var contractDataPromise = $.getJSON('FakeNewsMarket.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  var isLocal = false;
  var path = "https://dapps.stanford.edu/fakenewsdetector/";
  if (isLocal) {
    alert("ERROR! ON SERVER!");
    path = "http://localhost:3000/fakenewsdetector/";
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
          </article><br>"
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
      alert("Appears you are not on Rinkeby test network. Please switch to Rinkeby to use site.");
      throw new Error("Contract not found in selected Ethereum network on MetaMask.");
    }


    var contractAddress = "0x289c5e03081a6e8397737e8a4b183d0145882a95";
    contract = new web3.eth.Contract(contractData.abi, contractAddress);
    console.log("Contract Address:", contract);
    console.log("got to end of first then")
    console.log(userAccount);
    contract.methods.reporterExists(userAccount).call()
    .then(function(result) {
      if(result == true) {
        $("#signup_link").hide();
      }
      else {
        $("#info_link").hide();
      }
    }).catch(function(e) {
      alert(e);
    });
    showReporterArticles();
    refreshReputation();
    $("#loader").hide();
  })
  .catch(console.error);

  function showReporterArticles() {
    $.get(
      path + "reporters",
      // {paramOne : 1, paramX : 'abc'},
      function(data) {
        //$('#feed').text(data[0].url);
        data.forEach(function(reporterEntry) {
          var inHTML = "";
          $.each(data, function(index, value) {
            if(value.reporter == userAccount) {
              var article = " \
              <article> \
              <header> \
              <span class=\"date\">Deadline: "+value.deadline+"</span> \
              <h2><a href=\""+value.url+"\">"+value.title+"</a></h2>\
              </header>\
              <!-- <a href=\"#\" class=\"image fit\"><img src=\"images/pic02.jpg\" alt=\"\" /></a> -->\
              <a href=\"report.html?url="+value.url+"\"class=\"button\">Report</a>\
              </article>"
              inHTML += article;
            }
          });
          $('#reporter_feed').html(inHTML);
        });
      }
    );
  }

  function refreshReputation() {
    contract.methods.getReporterRep(userAccount).call().then(function (balance) {
      $('#rep_display').text(balance + " REP");
    });
  }

  function reportArticle(article, report, rep) {
    contract.methods.report(article.valueOf(), report, rep).send({from:userAccount})
    .then(function(result) {
      $("#loader").hide();
      alert("Successfully Reported!");
    }).catch(function(e) {
      alert(e);// There was an error! Handle it.
    });
  }

  function signUpReporter(email) {
    console.log(email.valueOf());
    contract.methods.addReporter(userAccount, email.valueOf()).send({from:userAccount})
    .then(function(result) {
      $("#loader").hide();
      alert("Successfully Signed up!");
    }).catch(function(e) {
      alert(e);
    });
  }

  $("#report_button").click(function(){
    var article = $("#url").val();
    var amount = $("#amount").val();
    $("#loader").show();
    if (amount <= 0) {
      alert("You must bet reputation greater than 0.");
      $("#loader").hide();
    }
    else {
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
    }
  });

  $("#signup_button").click(function() {
    var email=$("#email").val();
    console.log(userAccount);
    $("#loader").show();
    signUpReporter(email);
  });


  $("#post_button").click(function(){
    console.log("hit post button");
    var article = $("#url").val();
    var deadline = $("#deadline").val();
    if (article != '' && deadline != '') {
      postArticle(article, deadline);
    } else {
      alert("Please fill in both fields");}
    });

    $("#close_market").click(function(){
      var url = $("#url").val();
      console.log("closing market");
      if (url != '') {
        contract.methods.closeMarket(url).send({from:userAccount})
        .then(function(result) {
          contract.methods.getReports(url).call({from:userAccount})
          .then(function(outcome) {
            console.log(outcome);
            var inHTML = "<h3>";
            var output = "";
            if (outcome < "256") {
              if (outcome == "1") {
                output += "Some errors.";
              } else if (outcome == "2") {
                output += "Fake news!!";
              } else if (outcome == "0"){
                output += "No errors!";
              } else {
                output += "Vote deadline has not passed yet.";
              }
              inHTML += "Consensus is: " + output;
            }
            inHTML += "</h3>";
            console.log(inHTML);
            $('#close_market_outcome').html(inHTML);
          }).catch(function(e) {
            alert(e);
          });
        }).catch(function(e) {

          alert(e);
        });
      } else {
        alert("Please enter an article url.");
      }
    });

    function postArticle(article, deadline) {
      console.log(path + "post_article?url="+article+"&deadline="+deadline);
      console.log(article.valueOf());
      console.log(Date.parse(deadline));
      $("#loader").show();
      contract.methods.articleExists(article.valueOf()).call()
      .then(function(result) {
        console.log(result);
        if (result == true) {
          alert("Article already exists! Cannot post.");
          document.getElementById('url').value = '';
          $("#loader").hide();
        }
        else {
          contract.methods.createArticleMarket(article.valueOf(),Date.parse(deadline)).send({from:userAccount})
          .then(function(result) {
            console.log(path + "post_article?url="+article+"&deadline="+deadline);
            $.get(
              path + "post_article?url="+article+"&deadline="+deadline
            );
            contract.methods.getAssignedReporters(article.valueOf()).call()
            .then(function(result) {
              console.log(result);
              for (reporter of result) {
                console.log(reporter);
                if (reporter != 0) {
                  $.get(
                    path + "assign_reporter?url="+article+"&deadline="+deadline+"&address="+reporter
                  );
                }
              }
            }).catch(function(e) {
              alert(e);// There was an error! Handle it.
            });
            alert("Article Posted!");
            $("#loader").hide();
          }).catch(function(e) {
            alert(e);// There was an error! Handle it.
          });
        }
      }).catch(function(e) {
        alert(e);// There was an error! Handle it.
      });

    }

      $("#vote_button").click(function() {
        $("#loader").show();
        var url = $("#url").val();
        var vote = $('input[name=vote]:checked').val();
        var amount = $("#amount").val();
        if (amount <= 0) {
          alert("You must bet a sum greater than 0.");// There was an error! Handle it.
        } else {
          contract.methods.vote(url.valueOf(), vote).send({from:userAccount, value: web3.utils.toWei(amount, "ether")})
          .then(function(result) {
            alert("Voted!");
            document.getElementById('url').value = '';
            $("#loader").hide();
          }).catch(function(e) {
            alert(e);// There was an error! Handle it.
          });
        }
      });



    }
    $(document).ready(app);
