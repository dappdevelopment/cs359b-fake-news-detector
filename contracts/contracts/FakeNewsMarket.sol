pragma solidity ^0.4.22;

contract FakeNewsMarket {

    mapping(address => bytes32) reporters;

    struct Bet {
        uint vote;   // 0,1,2
        uint amount;
    }

    struct Report {
        uint vote;   // 0,1,2
        uint reputation;
    }

    struct ArticleMarket{
        address creator;
        //uint256 votingPeriod;
        mapping(address => Bet) votes;
        mapping(address => Report) reporters;
        uint[3] sum_votes;
        uint[3] sum_reports;
    }

    event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);

    mapping(bytes32 => ArticleMarket) public markets;

    function createArticleMarket(string _article) public returns (uint256){
      uint256 initLen = markets.length;
      bytes32 article_hash = keccak256(_article);
      ArticleMarket new_market = ArticleMarket({
          creator: msg.sender,
          sum_votes: [uint(0),uint(0),uint(0)],
          sum_reports: [uint(0),uint(0),uint(0)]
      });
      markets[article_hash] = new_market;

      emit ArticleCreated(msg.sender, initLen, article_hash);
      return initLen;
    }

    function vote(string _article, uint _vote, uint _amount) public returns (bool success) {
    // vote function
    // check if sender's address is already in array, if so, change existing
    // add address and money to map
    bytes32 article_hash = keccak256(_article);
    ArticleMarket market = markets[article_hash];
    if (market.creator != 0) { //market exists
        if ()
        Bet new_bet = Bet({
            vote: _vote,
            amount: _amount
        });
        market.votes =
    }
    }

    // report function
    // check if sender's address is in array, if not, block
    // update report in map

    // assign reporters

    // close market and distribute money

    function articleExists(string _article) public view returns (bool exists) {
      bytes32 hash = keccak256(_article);
      for (uint i=0; i < markets.length; i++) {
              if (markets[i].articleHash == hash) {
                return true;
              }
      }
    }

  }
