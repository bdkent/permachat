pragma solidity >=0.5.0 <0.6.0;

import "./IdentityModel.sol";

contract IdentityAdminService is IdentityModel {

  function setRequestPrice(uint price) public isIdentityAdmin() {
    requestPrice = price;
  }
  
  function getOrCreateIdentityId(address user, string memory provider, string memory userName) internal isIdentityAdmin() returns ( uint ) {
    uint userId = identityLookup[user];
    if(userId > 0) {
      return userId;
    } else {
      userId = providerLookup[provider][userName];
      if(userId > 0) {
        return userId;
      } else {
        uint newUserId = nextIdentityIndex;
        identities[newUserId].id = newUserId;
        nextIdentityIndex += 1;
        return newUserId;        
      }
    }
  }

  function approve(uint requestId) public isIdentityAdmin() {
    
    IdentityRequest memory request = requests[requestId];
    address requestor = request.requestor;
    string memory provider = request.provider;
    string memory userName = request.userName;
    
    uint id = getOrCreateIdentityId(requestor, provider, userName);
    
    identities[id].providers.push(Provider({
      requestId: requestId,
      timestamp: block.timestamp * 1000,
      active: true
    }));
    
    identityLookup[requestor] = id;
    providerLookup[provider][userName] = id;
    
    pendingIdentityRequestIndex += 1;
    
    emit NewApprovedProviderEvent({
      identityId: id,
      providerId: identities[id].providers.length - 1
    });
  }
  
  function reject(uint requestId, RejectionReason reason) public isIdentityAdmin() {
    
    IdentityRequest memory request = requests[requestId];
    address requestor = request.requestor;
    string memory provider = request.provider;
    string memory userName = request.userName;
    
    uint id = getOrCreateIdentityId(requestor, provider, userName);
    
    identities[id].rejections.push(Rejection({
      requestId: requestId,
      reason:reason
    }));
    
    identityLookup[requestor] = id;
    
    pendingIdentityRequestIndex += 1;
  }
}
