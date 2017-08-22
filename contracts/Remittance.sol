pragma solidity ^0.4.6;

contract Remittance {
  struct remitTransaction {
    address funder;
    address exchange;
    uint amount;
    bytes32 combinedPassword;
  }

  address public owner;

  remitTransaction[] public remitTransactions;

  function Remittance() {
    owner = msg.sender;
  }
}
