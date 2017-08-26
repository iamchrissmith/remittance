pragma solidity ^0.4.6;

contract Remittance {
  struct remitTransaction {
    address exchange;
    uint amount;
    uint deadline;
  }

  address public owner;

  mapping(bytes32 => remitTransaction) public remitTransactions;

  function Remittance() {
    owner = msg.sender;
  }

  modifier onlyMe() {
    require( msg.sender == owner );
    _;
  }

  function createRemittance(bytes32 combinedPwHash, address exchange, uint _deadline)
    public
    onlyMe()
    payable
    returns (bool success)
  {
    require(msg.value > 0);
    require(combinedPwHash != 0);
    require(exchange != address(0));
    require(remitTransactions[combinedPwHash].exchange == address(0));

    remitTransaction memory newRemit;
    newRemit.amount = msg.value;
    newRemit.exchange = exchange;
    newRemit.deadline = block.number + _deadline;
    remitTransactions[combinedPwHash] = newRemit;
    return true;
  }

  function sendRemittance(bytes32 pwHash1, bytes32 pwHash2)
    public
    returns (bool success)
  {
    require(pwHash1 != 0);
    require(pwHash2 != 0);

    bytes32 combinedPassword = keccak256(pwHash1, pwHash2);
    require(remitTransactions[combinedPassword].exchange == msg.sender);
    require(remitTransactions[combinedPassword].amount != 0);
    require(block.number < remitTransactions[combinedPassword].deadline);

    uint toSend = remitTransactions[combinedPassword].amount;
    remitTransactions[combinedPassword].amount = 0;

    msg.sender.transfer(toSend);

    return true;
  }
}
