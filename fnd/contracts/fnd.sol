pragma solidity ^0.4.21;

contract FakeNewsMarket {
 mapping (address => uint256) public votes;
 address creator;
 uint256 article;
 uint256 votingPeriod;

 function FakeNewsMarket(string _article) public {
   creator = msg.sender;
   article = sha256(_article);
   votingTime = now + 1 days; //arbitrarily set to one day
 }

 function voteOnArticle(bool _vote) public{
   require(msg.sender != creator);
   votes[msg.sender] == _vote;
 }
}
