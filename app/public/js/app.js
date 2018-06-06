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
   $.get(
     path + "articles",
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
              <input type=\"radio\" id=\"no-errors\" name=\"demo-priority\" checked>\
              <label for=\"no-errors\">No errors</label>\
              <input type=\"radio\" id=\"some-errors\" name=\"demo-priority\" checked>\
              <label for=\"some-errors\">Some errors</label>\
              <input type=\"radio\" id=\"many-errors\" name=\"demo-priority\" checked>\
              <label for=\"many-errors\">Many errors</label>\
              <ul class=\"actions\"> \
              <li><a href=\""+value.url+"\"class=\"button\">Vote</a></li>\
              </ul>\
              </article>"
              inHTML += article;
            });
            $('#article_feed').html(inHTML);
          });
         }
       );

  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      var contractData = results[0];
      var networkId = results[1];
      var accounts = results[2];
      userAccount = accounts[0];

      // Make sure the contract is deployed on the connected network
      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }

      var contractAddress = "0xA7E32C4C51Bfd7fd35f5cDa1ebEc67C9c271b35D";
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
      console.log("Contract Address:", contract);
      console.log("got to end of first then")
      $("#loader").hide();
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
      refreshReputation()
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
                   <input type=\"radio\" id=\"no-errors\" name=\"demo-priority\" checked>\
                   <label for=\"no-errors\">No errors</label>\
                   <input type=\"radio\" id=\"some-errors\" name=\"demo-priority\" checked>\
                   <label for=\"some-errors\">Some errors</label>\
                   <input type=\"radio\" id=\"many-errors\" name=\"demo-priority\" checked>\
                   <label for=\"many-errors\">Many errors</label>\
                   <ul class=\"actions\"> \
                   <li><a href=\""+value.url+"\"class=\"button\">Report</a></li>\
                   </ul>\
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
        $("#loader").hide();
      });
    }

    function postArticle(article, deadline) {
       console.log(path + "post_article?url="+article+"&deadline="+deadline);
       console.log(article.valueOf());
       console.log(Date.parse(deadline));
       contract.methods.articleExists(article.valueOf()).call()
       .then(function(result) {
         console.log(result);
          if (result == true) {
            alert("Article already exists! Cannot post.");
            $("#loader").hide();
          }
          else {
            contract.methods.createArticleMarket(article.valueOf(),Date.parse(deadline)).send({from:userAccount})
              .then(function() {
                console.log(path + "post_article?url="+article+"&deadline="+deadline);
                $.get(
                  path + "post_article?url="+article+"&deadline="+deadline
                );
                $("#loader").hide();
                alert("Article Posted!");
              }).catch(function(e) {
                  alert(e);// There was an error! Handle it.
                  $("#loader").hide();
              });
          }
       }).catch(function(e) {
          alert(e);// There was an error! Handle it.
          $("#loader").hide();
       });

      // contract.methods.getAssignedReporters(article.valueOf()).call()
      //   .then(function(result) {
      //     console.log(result);
      //     for (reporter of result) {
      //       $.get(
      //         path + "assign_reporter?url="+article+"&deadline="+deadline+"&address="+reporter
      //       );
      //     }
      //     $("#loader").hide();
      //   }).catch(function(e) {
      //       alert(e);// There was an error! Handle it.
      //   });
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
      $("#loader").show();
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

$("#button").click(function() {
  var toAddress = $("#address").val();
  var amount = $("#amount").val();
  transfer(toAddress, amount);
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

// $("#signup_button").click(function() {
//   var email = $("#email").val();
//   console.log(email);
//   contract.methods.addReporter(userAccount, email.valueOf()).send({from:userAccount})
//    .then(function(result) {
//      alert("Signed up as a reporter!");
//    }).catch(function(e) {
//        alert(e);// There was an error! Handle it.
//    });
//  });



}
$(document).ready(app);
