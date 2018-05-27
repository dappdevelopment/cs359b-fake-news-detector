pragma solidity ^0.4.22;

contract FakeNewsMarket {

    mapping(address => bytes32) reportersEmails; //address to email
    address[] reporters;

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
        address[] reporters;
        uint[3] sum_votes;
        uint[3] sum_reports;
        uint[3] sum_bets;
    }

    /*event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);*/

    mapping(bytes32 => ArticleMarket) public markets;

    function createArticleMarket(string _article, uint256 _deadline) public returns (uint256){
      bytes32 article_hash = keccak256(_article);
      ArticleMarket memory new_market = ArticleMarket({
          creator: msg.sender,
          deadline: _deadline,
          is_open: true,
          sum_votes: [uint(0),uint(0),uint(0)],
          sum_reports: [uint(0),uint(0),uint(0)],
          sum_bets: [uint(0),uint(0),uint(0)],
          voters: new address[](0),
          reporters: new address[](0)
      });
      markets[article_hash] = new_market;
      address[10] memory reporterAddresses = assignReporters();
      Report memory report = Report({
         is_valid: true,
         vote: 0,
         reputation: 0
      });
      for (uint i = 0; i < 10; i++){
        markets[article_hash].reporters.push(reporterAddresses[i]);
        markets[article_hash].reports[reporterAddresses[i]]= report; //initialize reports
      }

    /*  emit ArticleCreated(msg.sender, initLen, article_hash);*/
      return 1;
    }

    function vote(string _article, uint _vote) public payable returns (bool success) {
        // vote function
        // check if sender's address is already in array, if so, change existing
        // add address and money to map
        if (msg.value == 0) {
            return false;
        }
        bytes32 article_hash = keccak256(_article);
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
      bytes32 hash = keccak256(_article);
      require(markets[hash].reports[msg.sender].is_valid == true);
      markets[hash].reports[msg.sender] = Report({
        vote : _vote,
        reputation : _rep,
        is_valid: true
      });
      //what to do if updating reputation?
    }

    function addReporter(address _address, string email) {
      bytes32 hash = keccak256(email);
      reporters.push(_address);
      reportersEmails[_address] = hash;
    }

    function assignReporters() public returns (address[10] assigned){
        uint[10] memory indices;
        if (reporters.length < 10) {
            for (uint r = 0; r < reporters.length; r++){
              assigned[r] = reporters[r]; //copy whatever reporters exist into addresses
            }
            return assigned;
        }
        uint i = 0;
        while (i < 10) {
          uint random_number = uint(blockhash(block.number-1))%reporters.length + 1;
          bool exists = false;
          for (uint j = 0; j < i; j++) {
            if(indices[j] == random_number) {
              exists = true;
            }
          }
          if (!exists){
            indices[i] = random_number;
            assigned[i] = reporters[random_number];
            i += 1;
          }
        }
        return assigned;
    }

    function closeMarket(string _article) {
        //TODO: check deadline
        bytes32 hash = keccak256(_article);
        ArticleMarket storage market = markets[hash];
        if (market.is_open) {
        //determine winning answer from reporters
        uint256 reports_0 = market.sum_reports[0];
        uint256 reports_1 = market.sum_reports[1];
        uint256 reports_2 = market.sum_reports[2];
        //set vote 0 to be the winner
        uint8 consensus = 0;
        uint256 max_reports = reports_0;
        if (max_reports < reports_1 && reports_1 < reports_2) {
            //vote 2 is the winner
            consensus = 2;
            max_reports = reports_2;
        } else if (max_reports < reports_1 && reports_1 > reports_2) {
            //vote 1 is the winner
            consensus = 1;
            max_reports = reports_1;
        }
        //TODO: handle case where some of the # reports is equal
        uint256 winnings = market.sum_bets[0] + market.sum_bets[1] + market.sum_bets[2];
        uint256 reporter_winnings = winnings/10;
        uint256 correct_voter_winnings = winnings - reporter_winnings;
        distributeWinningsToReporters(market, consensus, reporter_winnings);
        distributeWinningsToVoters(market, consensus, correct_voter_winnings);
        //close market
        market.is_open = false;
        }
    }

    function distributeWinningsToReporters(ArticleMarket storage _market, uint8 _consensus, uint256 _reporterWinnings) private {
        uint256 num_reporters = _market.reporters.length;
        for(uint i;i<num_reporters;i++) {
            address reporter = _market.reporters[i];
            Report storage report = _market.reports[reporter];
            if (report.is_valid && report.vote == _consensus) {
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

    function articleExists(string _article) public view returns (bool exists) {
    bytes32 hash = keccak256(_article);
    if (markets[hash].creator > 0) {
        return true;
    }
    }

    function getVotes(string _article) public view returns (uint[3] sum_votes) {
        bytes32 hash = keccak256(_article);
        if (markets[hash].creator > 0) {
            return markets[hash].sum_votes;
        }
    }

    function getBets(string _article) public view returns (uint[3] sum_bets) {
        bytes32 hash = keccak256(_article);
        if (markets[hash].creator > 0) {
            return markets[hash].sum_bets;
        }
    }


  }
