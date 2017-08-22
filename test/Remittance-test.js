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

  context('when Alice sends a Remittance with an amount, recipient and combined password', () => {
    xit('it should create a Remittance record with the balance and exchange address', () => {});
    xit('it should store the passwords as secure hashes', () => {});
  });

  describe('.retreiveFunds()', () => {
    xit('it should not send the funds when one of the passwords is wrong', () => {});
    xit('it should send the funds when both of the passwords are right', () => {});
  });
});
