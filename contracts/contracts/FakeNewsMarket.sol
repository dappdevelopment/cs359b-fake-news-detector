pragma solidity ^0.4.22;

contract FakeNewsMarket {

    mapping(address => Reporter) reportersData; //address to email
    address[] reporters;
    address[] blacklisted;
    uint256 minRep = 15;

    struct Reporter {
        bytes32 email;
        uint reputation;
        bool is_valid;
    }

    struct Bet {
        uint vote;   // 0,1,2
        uint amount;
    }

    struct Report {
        uint vote;   // 0,1,2
        uint reputation;
        bool is_valid;
    }

    struct ArticleMarket{
        address creator;
        uint256 deadline;
        bool is_open;
        mapping(address => Bet) votes;
        mapping(address => Report) reports;
        address[] voters;
        address[50] reporters;
        uint[3] sum_votes;
        uint[3] sum_reports;
        uint[3] sum_bets;
        uint[3] sum_rep; //sum of reputation
        uint consensus;
    }

    event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);

    mapping(bytes32 => ArticleMarket) public markets;
    uint public numArticles = 0;

    function createArticleMarket(string _article, uint256 _deadline) public returns (uint added){
      bytes32 article_hash = keccak256(abi.encodePacked(_article));
      address[50] memory reporterAddresses = assignReporters();
      ArticleMarket memory new_market = ArticleMarket({
          creator: msg.sender,
          deadline: _deadline,
          is_open: true,
          sum_votes: [uint(0),uint(0),uint(0)],
          sum_reports: [uint(0),uint(0),uint(0)],
          sum_bets: [uint(0),uint(0),uint(0)],
          sum_rep: [uint(0), uint(0), uint(0)],
          voters: new address[](0),
          reporters: reporterAddresses,
          consensus: 256
      });
      markets[article_hash] = new_market;
      Report memory report = Report({
         is_valid: true,
         vote: 0,
         reputation: 0
      });
      for (uint i = 0; i < 50; i++){
        markets[article_hash].reports[reporterAddresses[i]]= report; //initialize reports
      }
      emit ArticleCreated(msg.sender, numArticles, article_hash);
      numArticles += 1;
      return 1;
    }


    function getAssignedReporters(string _article) public view returns (address[50] assigned){
      bytes32 article_hash = keccak256(abi.encodePacked(_article));
      return markets[article_hash].reporters;
    }

    function vote(string _article, uint _vote) public payable returns (bool success) {
        // vote function
        // check if sender's address is already in array, if so, change existing
        // add address and money to map
        if (msg.value == 0) {
            return false;
        }
        bytes32 article_hash = keccak256(abi.encodePacked(_article));
        ArticleMarket storage market = markets[article_hash];
        if (market.creator != 0) { //market exists
            Bet storage curr_bet = market.votes[msg.sender];
            if (curr_bet.amount > 0) {
                //voter has already bet/voted
                uint refund = 0;
                if (msg.value > curr_bet.amount) {
                    //send back difference (msg.value - curr_bet.amount)
                    refund = msg.value - curr_bet.amount;

                } else if (msg.value < curr_bet.amount) {
                    //send back difference (curr_bet.amount - msg.value)
                    refund = curr_bet.amount - msg.value;
                } else if (msg.value == curr_bet.amount) {
                    //reject new money
                    refund = msg.value;
                }
                if (curr_bet.vote != _vote) { //voter is changing previous vote
                    market.sum_votes[curr_bet.vote] -= 1;
                    market.sum_bets[curr_bet.vote] -= curr_bet.amount;
                    market.sum_bets[_vote] = msg.value;
                } else {
                    market.sum_bets[curr_bet.vote] += (msg.value - refund);
                }
                refund_voter(msg.sender, refund);

            } else {
                market.sum_bets[_vote] += msg.value;
                market.voters.push(msg.sender);
            }
            market.sum_votes[_vote] += 1;
            curr_bet.amount = msg.value;
            curr_bet.vote = _vote;
        }
        return true;
        }

    function refund_voter(address _to, uint _amount) private {
        _to.transfer(_amount);
    }

    function report(string _article, uint _vote, uint _rep) {
      bytes32 hash = keccak256(abi.encodePacked(_article));
      require(markets[hash].reports[msg.sender].is_valid == true);
      require(markets[hash].reports[msg.sender].reputation == 0); //not reported yet
      require(reportersData[msg.sender].reputation >= _rep);
      reportersData[msg.sender].reputation -= _rep;
      markets[hash].reports[msg.sender] = Report({
        vote : _vote,
        reputation : _rep,
        is_valid: true
      });
      markets[hash].sum_reports[_vote] += 1;
      markets[hash].sum_rep[_vote] += _rep;
    }

    function addReporter(address _address, string email) {
      bytes32 hash = keccak256(abi.encodePacked(email));
      require(reporterBlacklisted(_address) == false);
      reporters.push(_address);
      reportersData[_address] = Reporter({
        email : hash,
        reputation: 15, //starting reputation
        is_valid: true
      });
    }

    function assignReporters() private view returns (address[50] assigned){
        uint[50] memory indices;
        if (reporters.length < 50) {
            for (uint r = 0; r < reporters.length; r++){
              assigned[r] = reporters[r]; //copy whatever reporters exist into addresses
            }
            return assigned;
        }
        uint i = 0;
        while (i < 50) {
          uint rep_idx = uint(sha256(abi.encodePacked(blockhash(block.number-1), msg.sender, now)))%reporters.length + 1;
          bool exists = false;
          for (uint j = 0; j < i; j++) {
            if(indices[j] == rep_idx) {
              exists = true;
            }
          }
          if (!exists){
            indices[i] = rep_idx;
            assigned[i] = reporters[rep_idx];
            i += 1;
          }
        }
        return assigned;
    }

    function closeMarket(string _article) {
        //TODO: check deadline
        bytes32 hash = keccak256(abi.encodePacked(_article));
        ArticleMarket storage market = markets[hash];
        if (market.deadline < now && market.is_open) {
          //determine winning answer from reporters
          uint256 reports_0 = market.sum_reports[0];
          uint256 reports_1 = market.sum_reports[1];
          uint256 reports_2 = market.sum_reports[2];
          //set vote 0 to be the winner
          uint8 consensus = 0;
          uint256 max_reports = reports_0;
          uint256 rep_redistribute = market.sum_rep[1] + market.sum_rep[2];
          if (max_reports < reports_1 && reports_1 < reports_2) {
              //vote 2 is the winner
              consensus = 2;
              max_reports = reports_2;
              rep_redistribute = market.sum_rep[0] + market.sum_rep[1];
          } else if (max_reports < reports_1 && reports_1 > reports_2) {
              //vote 1 is the winner
              consensus = 1;
              max_reports = reports_1;
              rep_redistribute = market.sum_rep[0] + market.sum_rep[2];
          }
          //TODO: handle case where some of the # reports is equal
          uint256 winnings = market.sum_bets[0] + market.sum_bets[1] + market.sum_bets[2];
          uint256 reporter_winnings = winnings/10;
          uint256 correct_voter_winnings = winnings - reporter_winnings;

          distributeWinningsToReporters(market, consensus, reporter_winnings);
          distributeWinningsToVoters(market, consensus, correct_voter_winnings);
          distributeReputation(market, consensus, rep_redistribute);
          //close market
          market.is_open = false;
          market.consensus = consensus;
          }
    }

    function distributeWinningsToReporters(ArticleMarket storage _market, uint8 _consensus, uint256 _reporterWinnings) private {
        uint256 num_reporters = _market.reporters.length;
        for(uint i;i<num_reporters;i++) {
            address reporter = _market.reporters[i];
            Report storage inReport = _market.reports[reporter];
            if (inReport.is_valid && inReport.vote == _consensus) {
                reporter.transfer(_reporterWinnings/num_reporters);
            }
            i++;
        }
    }

    function distributeWinningsToVoters(ArticleMarket storage _market, uint8 _consensus, uint256 _correctVoterWinnings) private {
        uint256 num_voters = _market.voters.length;
        for(uint i;i<num_voters;i++) {
            address voter = _market.voters[i];
            Bet storage voter_bet = _market.votes[voter];
            if (voter_bet.vote == _consensus) {
                uint256 voter_winnings = _correctVoterWinnings * voter_bet.amount / _market.sum_bets[_consensus];
                voter.transfer(voter_winnings);
            }
            i++;
        }
    }

    function removeReporter(address _reporter){
      reportersData[_reporter].is_valid = false;
      uint initLen = reporters.length;
      uint idx  = 0;
      while (idx < reporters.length){
        if (reporters[idx] == _reporter) {
          delete reporters[idx];
          break;
        }
        idx += 1;
      }
      reporters[idx] = reporters[initLen-1];
      delete reporters[initLen-1]; //copy last element into the empty spot and delete it
      blacklisted.push(_reporter); //so can't sign up again :)
    }

    function distributeReputation(ArticleMarket storage _market, uint8 _consensus, uint256 _correctReporterWinnings) private {
      uint256 num_reporters = _market.reporters.length;
      for(uint i; i<num_reporters; i++) {
          address reporter = _market.reporters[i];
          Report storage inReport = _market.reports[reporter];
          if (inReport.is_valid) {
            if (inReport.vote == _consensus) {
              uint256 rep_winnings = inReport.reputation + _correctReporterWinnings*inReport.reputation/_market.sum_rep[_consensus];
              reportersData[reporter].reputation += rep_winnings;
            }
            else {
              if (reportersData[reporter].reputation < minRep){
                removeReporter(reporter);
              }
            }
          }
          i++;
      }
    }

    function articleExists(string _article) public view returns (bool exists) {
    bytes32 hash = keccak256(abi.encodePacked(_article));
    if (markets[hash].creator > 0) {
        return true;
    }
    }

    function reporterExists(address _reporter) public view returns (bool exists) {
      if (reportersData[_reporter].is_valid == true) {
        return true;
      }
      return false;
    }

    function reporterBlacklisted(address _reporter) public view returns (bool exists) {
      for (uint i = 0; i < blacklisted.length; i++){
        if (blacklisted[i] == _reporter){
          return true;
        }
      }
      return false;
    }

    function getVotes(string _article) public view returns (uint[3] sum_votes) {
        bytes32 hash = keccak256(abi.encodePacked(_article));
        if (markets[hash].creator > 0) {
            return markets[hash].sum_votes;
        }
    }

    function getBets(string _article) public view returns (uint[3] sum_bets) {
        bytes32 hash = keccak256(abi.encodePacked(_article));
        if (markets[hash].creator > 0) {
            return markets[hash].sum_bets;
        }
    }

    function getReports(string _article) public view returns (uint[3] sum_reports) {
        bytes32 hash = keccak256(abi.encodePacked(_article));
        if (markets[hash].creator > 0) {
            return markets[hash].sum_reports;
        }
    }

    function getReporterRep(address _reporter) public view returns (uint rep){
      if (reportersData[_reporter].is_valid) {
            return reportersData[_reporter].reputation;
      }
    }

    function getRep(string _article) public view returns (uint[3] sum_rep) {
        bytes32 hash = keccak256(abi.encodePacked(_article));
        if (markets[hash].creator > 0) {
            return markets[hash].sum_rep;
        }
    }

    function getConsensus(string _article) public view returns (uint consensus) {
      bytes32 hash = keccak256(abi.encodePacked(_article));
      if (markets[hash].creator > 0) {
          return markets[hash].consensus;
      }
    }

  }
