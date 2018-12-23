pragma solidity >=0.5.0 <0.6.0;

import "./IdentityModel.sol";
import "./IdentityAdminService.sol";

contract IdentityRegistry is IdentityModel, IdentityAdminService {
    
  function submitRequest(string memory provider, string memory userName, string memory identifier) public isNonEmpty(provider) isNonEmpty(userName) isNonEmpty(identifier) payable {
    uint newId = nextIdentityRequestIndex;
    requests[newId] = IdentityRequest({
      id: newId,
      requestor: msg.sender,
      provider: provider,
      userName: userName,
      identifier: identifier,
      timestamp: block.timestamp * 1000
    });
    nextIdentityRequestIndex += 1;
    identityAdmin.transfer(requestPrice);
    emit NewRequestEvent({
      identityRequestId: newId
    });
  }
  
  function getRequestById(uint requestId) public view isValidRequestId(requestId) returns ( uint , address requestor,  string memory provider, string memory userName, string memory identifier, uint timestamp ) {
    return ( 
      requestId,
      requests[requestId].requestor,
      requests[requestId].provider,
      requests[requestId].userName,
      requests[requestId].identifier,
      requests[requestId].timestamp
    );
  }

  function getNextRequest() public view isPendingRequestAvailable() returns ( uint requestId, address requestor,  string memory provider, string memory userName, string memory identifier, uint timestamp ) {
    return getRequestById(pendingIdentityRequestIndex);
  }
  
  function getMyIdentity() internal view returns ( Identity memory ) {
    return identities[identityLookup[msg.sender]];
  }
  
  function getIdentityByAddress(address a) internal view returns ( Identity memory ) {
    return identities[identityLookup[a]];
  }
  
  
  function getMyIdentityInfo() public view returns ( uint id, uint providerCount, uint rejectionCount ) {
    return getIdentityInfo(identityLookup[msg.sender]);
  }
  
  function getMyProviderInfo(uint providerId) public view returns ( uint requestId, address identityAddress, string memory provider, string memory userName, uint timestamp, bool active ) {
    return getProviderInfo(identityLookup[msg.sender], providerId);
  }
  
  function getIdentityInfoByAddress(address identityAddress) public view returns ( uint id, uint providerCount, uint rejectionCount ) {
    return getIdentityInfo(identityLookup[identityAddress]);
  }
  
  function getIdentityInfo(uint identityId) public view returns ( uint id, uint providerCount, uint rejectionCount ) {
    Identity memory identity = identities[identityId];
    id = identity.id;
    providerCount = identity.providers.length;
    rejectionCount = identity.rejections.length;
  }
  
  function getProviderInfo(uint identityId, uint providerId) public view returns ( uint requestId, address identityAddress, string memory provider, string memory userName, uint timestamp, bool active ) {
    Identity memory identity = identities[identityId];
    require(providerId < identity.providers.length);
    Provider memory p = identity.providers[providerId];
    requestId = p.requestId;
    IdentityRequest memory request = requests[requestId];
    identityAddress = request.requestor;
    provider = request.provider;
    userName = request.userName;
    timestamp = p.timestamp;
    active = p.active;
  }
  
}
