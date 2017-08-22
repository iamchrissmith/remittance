pragma solidity ^0.4.6;

contract Remittance {
  struct remitTransaction {
    uint amount;
    bytes32 combinedPassword;
    uint deadline;
  }

  address public owner;

  mapping(address => remitTransaction) public remitTransactions;

  function Remittance() {
    owner = msg.sender;
  }

  modifier onlyMe() {
    require( msg.sender == owner );
    _;
  }

  function createRemittance(bytes32 pwHash1, bytes32 pwHash2, address exchange, uint _deadline)
    public
    onlyMe()
    payable
    returns (bool success)
  {
    if(msg.value == 0) revert();
    if(remitTransactions[exchange].amount != 0) revert();

    remitTransaction memory newRemit;
    newRemit.amount = msg.value;
    newRemit.combinedPassword = keccak256(pwHash1, pwHash2);
    newRemit.deadline = block.number + _deadline;
    remitTransactions[exchange] = newRemit;
    return true;
  }

  function sendRemittance(bytes32 pwHash1, bytes32 pwHash2)
    public
    payable
    returns (bool success)
  {
    if(remitTransactions[msg.sender].amount == 0) revert();
    if(block.number > remitTransactions[msg.sender].deadline) revert();
    if(remitTransactions[msg.sender].combinedPassword != keccak256(pwHash1, pwHash2)) revert();
    uint toSend = remitTransactions[msg.sender].amount;
    remitTransactions[msg.sender].amount = 0;

    msg.sender.transfer(toSend);
    return true;
  }
}
