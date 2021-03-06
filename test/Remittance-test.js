const Remittance = artifacts.require('./Remittance.sol');
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth.js');

contract('Remittance', (accounts) => {
  const owner = accounts[0];
  const exchange = accounts[1];
  let contract;
  let expectedDeadline;

  beforeEach( () => {
    return Remittance.new({from: owner})
      .then( (instance) => {
        contract = instance;
      });
  });

  it('should be owned by Alice', () => {
    return contract.owner({from:owner})
      .then( (owner) => {
        assert.strictEqual(owner, owner, "Contract is not owned by Alice");
      });
  });

  context('when Alice sends a Remittance with an amount, recipient and passwords', () => {
    const PASSWORD1 = web3.toHex('abc123');
    const HASHED_PASSWORD1 = web3.sha3(PASSWORD1, { encoding: 'hex' });
    const PASSWORD2 = web3.toHex('123abc');
    const HASHED_PASSWORD2 = web3.sha3(PASSWORD2, { encoding: 'hex' });
    const expectedCombinedPassword = web3.sha3(HASHED_PASSWORD1 + HASHED_PASSWORD2.slice(2), { encoding: 'hex' });

    it('it should create a Remittance record with the balance, deadline and exchange address', () => {
      return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: owner, value:10})
        .then( (txn) => {
          expectedDeadline = web3.eth.blockNumber + 10;
          return contract.remitTransactions(expectedCombinedPassword, {from:owner});
        })
        .then( (remit1) => {
          assert.equal(remit1[0], exchange, "Exchange is incorrect");
          assert.equal(remit1[1].toString(10), 10, "Remit Amount is incorrect");
          assert.equal(remit1[2].toString(10), expectedDeadline, "Remit Deadline is incorrect");
        });
    });

    it('only the contract owner can createRemittance()', () => {
      return expectedExceptionPromise(function () {
        return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: exchange, value:10});
          }, 3000000);
    });
    it('once a remittance is created for a password it cannot create another', () => {
      return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: owner, value:10})
        .then( (txn) => {
          return expectedExceptionPromise(function () {
            return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: exchange, value:10});
          }, 3000000);
        });
    });

    describe('.retreiveFunds()', () => {
      it('it should not send the funds when one of the passwords is wrong', () => {return expectedExceptionPromise(function () {
        return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: owner, value:10})
          .then( (txn) => {
            return contract.sendRemittance(HASHED_PASSWORD1, HASHED_PASSWORD1, {from: exchange});
              }, 3000000);
          });
      });
      it('it should send the funds when both of the passwords are correct', () => {
        const exchangeBalance = web3.eth.getBalance(exchange);
        const amount = 1;
        const gasPrice = 1;
        let transactionCost;
        return contract.createRemittance(expectedCombinedPassword, exchange, 10, {from: owner, value:amount})
          .then( (txn) => {
            return contract.sendRemittance(HASHED_PASSWORD1, HASHED_PASSWORD2, {from: exchange, gasPrice: gasPrice});
          })
          .then( (sendTxn) => {
            transactionCost = sendTxn.receipt.gasUsed * gasPrice;
            return web3.eth.getBalance(exchange)
          })
          .then( (newBalance) => {
            assert.equal(exchangeBalance.plus(amount).minus(transactionCost).toString(10), newBalance.toString(10), "Exchange balance did not increase by 10");
          });
      });
    });
  });

});
