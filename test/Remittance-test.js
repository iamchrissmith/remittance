const Remittance = artifacts.require('./Remittance.sol');

contract('Remittance', (accounts) => {
  const alice = accounts[0],
        carol = accounts[1];
  let contract;

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

  it('should start with a balance of 0', () => {
    return contract.balance({from:alice})
      .then( (balance) => {
        assert.equal( balance.toString(10), 0, "Intial Balance is not Zero");
      });
  });

  context('when Alice sends funds with an amount, recipient and two passwords', () => {
    xit('it should increase the balance', () => {});
    xit('it should store the passwords as secure hashes', () => {});
  });

  describe('.retreiveFunds()', () => {
    xit('it should not send the funds when one of the passwords is wrong', () => {});
    xit('it should send the funds when both of the passwords are right', () => {});
  });
});
