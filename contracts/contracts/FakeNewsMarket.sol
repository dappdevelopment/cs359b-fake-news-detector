pragma solidity ^0.4.22;

contract FakeNewsMarket {

    struct Voter {
        bool voted;  // if true, that person already voted
        uint vote;   // 0,1,2
    }

    struct Reporter {
        bool voted;  // if true, that person already voted
        uint vote;   // 0,1,2
        uint weight;
        uint reputation;
    }

    struct ArticleMarket{
        bytes32 articleHash;
        address creator;
        //uint256 votingPeriod;
        mapping(address => Voter) voters;
        mapping(address => Reporter) reporters;
        uint8[3] votes;
        uint8[3] reports;
    }

    event ArticleCreated(address indexed _creator, uint indexed _numberInArray, bytes32 indexed _articleHash);

    ArticleMarket[] public markets;

    function createArticleMarket(string _article) public returns (uint256){
      uint256 initLen = markets.length;
      markets.push(ArticleMarket({
          articleHash: keccak256(_article),
          creator: msg.sender,
          votes: [0,0,0],
          reports: [0,0,0]
      }));
      emit ArticleCreated(msg.sender, initLen, keccak256(_article));
      return initLen;

    }

    function articleExists(string _article) public view returns (bool exists) {
      bytes32 hash = keccak256(_article);
      for (uint i=0; i < markets.length; i++) {
              if (markets[i].articleHash == hash) {
                return true;
              }
            }
          }

      }
