const Remittance = artifacts.require('./Remittance.sol');
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth.js');

contract('Remittance', (accounts) => {
  const alice = accounts[0],
        carol = accounts[1];
  let contract,
      expectedDeadline;

  beforeEach( () => {
    return Remittance.new({from: alice})
      .then( (instance) => {
        contract = instance;
      });
  });

  it('should be owned by Alice', () => {
    return contract.owner({from:alice})
      .then( (owner) => {
        assert.strictEqual(owner, alice, "Contract is not owned by Alice");
      });
  });



  context('when Alice sends a Remittance with an amount, recipient and passwords', () => {
    const PASSWORD1 = web3.toHex('abc123');
    const HASHED_PASSWORD1 = web3.sha3(PASSWORD1, { encoding: 'hex' });
    const PASSWORD2 = web3.toHex('123abc');
    const HASHED_PASSWORD2 = web3.sha3(PASSWORD2, { encoding: 'hex' });

    it('it should create a Remittance record with the balance, deadline and exchange address', () => {
      return contract.createRemittance(HASHED_PASSWORD1, HASHED_PASSWORD2, carol, 10, {from: alice, value:10})
        .then( (txn) => {
          expectedDeadline = web3.eth.blockNumber + 10;
          return contract.remitTransactions(carol, {from:alice});
        })
        .then( (remit1) => {
          assert.equal(remit1[0].toString(10), 10, "Remit Amount is incorrect");
          expectedCombinedPassword = web3.sha3(HASHED_PASSWORD1 + HASHED_PASSWORD2.slice(2), { encoding: 'hex' });
          assert.equal(remit1[1], expectedCombinedPassword, "Password Hash is incorrect");
          assert.equal(remit1[2].toString(10), expectedDeadline, "Remit Deadline is incorrect");
        });
    });
    it('only the contract owner can createRemittance()', () => {
      return expectedExceptionPromise(function () {
        return contract.createRemittance(HASHED_PASSWORD1, HASHED_PASSWORD2, carol, 10, {from: carol, value:10});
          }, 3000000);
    });
    xit('once a remittance is created for an address it cannot create another', () => {});

    describe('.retreiveFunds()', () => {
      xit('it should not send the funds when one of the passwords is wrong', () => {});
      xit('it should send the funds when both of the passwords are right', () => {});
    });
  });

});
