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
        bytes32 articleHash;
        address creator;
        //uint256 votingPeriod;
        mapping(address => Bet) votes;
        mapping(address => Report) reporters;
        uint[3] sum_votes;
        uint[3] sum_reports;
    }

    event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);

    ArticleMarket[] public markets;

    function createArticleMarket(string _article) public returns (uint256){
      uint256 initLen = markets.length;
      markets.push(ArticleMarket({
          articleHash: keccak256(_article),
          creator: msg.sender,
          sum_votes: [uint(0),uint(0),uint(0)],
          sum_reports: [uint(0),uint(0),uint(0)]
      }));
      emit ArticleCreated(msg.sender, initLen, keccak256(_article));
      return initLen;
    }

    // vote function
    // check if sender's address is already in array, if so, change existing
    // add address and money to map

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
