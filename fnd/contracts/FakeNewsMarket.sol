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

    bytes32 public articleHash;
    //uint256 public votingPeriod;
    address public creator;

    mapping(address => Voter) public voters;
    mapping(address => Reporter) public reporters;

    uint256[3] votes = [0,0,0];
    uint256[3] reports = [0,0,0];

    function FakeNewsMarket(string _article) public {
        creator = msg.sender;
        articleHash =  keccak256(_article);
        //votingPeriod = now + 1 days;
    }

    function assignReporter(address reporter) public {
        require(
            msg.sender == creator,
            "Only creator can assign reporters."
        );
        require(
            !reporters[reporter].voted,
            "The reporter already voted."
        );
        require(reporters[reporter].weight == 0);
        reporters[reporter].weight = 1;
    }

    function getCreator() public view returns (address creator) {
      return creator;
    }

    function report(uint _vote, uint256 _amount) public {
        Reporter storage reporter = reporters[msg.sender];
        require(!reporter.voted, "Already voted.");
        reporter.voted = true;
        reporter.vote = _vote;
        reports[_vote] += reporter.weight;
    }

    function vote(uint _vote, uint256 _amount) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = _vote;
        votes[_vote] += 1;
    }

    function winningReport() public view
            returns (uint winningReport_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < reports.length; p++) {
            if (reports[p] > winningVoteCount) {
                winningVoteCount = reports[p];
                winningReport_ = p;
            }
        }
    }

}
