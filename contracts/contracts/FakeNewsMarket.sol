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
      address[10] reporterAddresses = assignReporters();
      for (uint i = 0; i < 10; i++){
        new_market.reporters[reporterAddresses[i]] = Report({valid: true}); //initialize reports
      }
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
    function assignReporters() public returns (address[10] assigned){
        uint[10] indices;
        uint i = 0;
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
      for (uint i=0; i < markets.length; i++) {
              if (markets[i].articleHash == hash) {
                return true;
              }
      }
    }

  }
