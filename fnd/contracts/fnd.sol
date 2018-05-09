pragma solidity ^0.4.21;

contract FakeNewsMarket {
 mapping (address => uint256) votes;
 address creator;
 uint256 article;
 uint256 votingPeriod;

 function FakeNewsMarket(string _article) public {
   creator = msg.sender;
   article = sha256(_article);
   votingPeriod = now + 1 days; //arbitrarily set to one day
 }

 function voteOnArticle(uint256 _vote) public{
   require(_vote >= 0 && _vote < 3);
   require(msg.sender != creator);
   votes[msg.sender] == _vote;

 }
}
