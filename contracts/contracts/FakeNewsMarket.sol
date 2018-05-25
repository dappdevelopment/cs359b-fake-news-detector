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
        bool valid;
    }

    struct ArticleMarket{
        address creator;
        //uint256 votingPeriod;
        mapping(address => Bet) votes;
        mapping(address => Report) reporters;
        uint[3] sum_votes;
        uint[3] sum_reports;
        uint[3] sum_bets;
    }

    /*event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);*/

    mapping(bytes32 => ArticleMarket) public markets;

    function createArticleMarket(string _article) public returns (uint256){
      bytes32 article_hash = keccak256(_article);
      ArticleMarket memory new_market = ArticleMarket({
          creator: msg.sender,
          sum_votes: [uint(0),uint(0),uint(0)],
          sum_reports: [uint(0),uint(0),uint(0)],
          sum_bets: [uint(0),uint(0),uint(0)]
      });
      markets[article_hash] = new_market;
      address[10] memory reporterAddresses = assignReporters();
      Report memory report = Report({
         valid: true,
         vote: 0,
         reputation: 0
      });
      for (uint i = 0; i < 10; i++){
        markets[article_hash].reporters[reporterAddresses[i]]= report; //initialize reports
      }

    /*  emit ArticleCreated(msg.sender, initLen, article_hash);*/
      return 1;
    }

    function vote(string _article, uint _vote, uint _amount) public payable returns (bool success) {
        // vote function
        // check if sender's address is already in array, if so, change existing
        // add address and money to map
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
                    market.sum_bets[_vote] = _amount;
                } else {
                    market.sum_bets[curr_bet.vote] += (_amount - refund);
                }
                refund_voter(msg.sender, refund);
            } else {
                market.sum_bets[_vote] += _amount;
            }
            market.sum_votes[_vote] += 1;
            curr_bet.amount = _amount;
            curr_bet.vote = _vote;
        }
        return true;
        }

        function refund_voter(address _to, uint _amount) private {
            _to.transfer(_amount);
        }

    function report(string _article, uint _vote, uint _rep) public {
      bytes32 hash = keccak256(_article);
      require(markets[hash].reporters[msg.sender].valid == true);
      markets[hash].reporters[msg.sender] = Report({
        vote : _vote,
        reputation : _rep,
        valid: true
      });
      //what to do if updating reputation?
    }

    // assign reporters
    function assignReporters() public view returns (address[10] assigned){
        uint[10] memory indices;
        uint i = 0;
        if (reporters.length == 0) {
            return assigned;
        }
        while (i < 10) {
          uint random_number = uint(block.blockhash(block.number-1))%reporters.length + 1;
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

    // close market and distribute money

    function articleExists(string _article) public view returns (bool exists) {
    bytes32 hash = keccak256(_article);
    if (markets[hash].creator > 0) {
        return true;
    }
  }


  }
