pragma solidity >=0.4.22 <0.6.0;


contract IdentityRegistry {
  
  address public identityAdmin;
  uint public requestPrice;
    
  constructor() public {
    identityAdmin = msg.sender;
  }
  
  struct IdentityRequest {
    bytes32 id;
    address requestor;
    string evidenceUri;
    uint timestamp;
  }
  
  event NewRequestEvent(
      bytes32 evidenceHash 
  );
  
  event NewApprovedProviderEvent(
    uint identityId,
    uint providerId
  );

  mapping(bytes32 => IdentityRequest) requests;
  bytes32[] requestHashes;
  
  modifier isIdentityAdmin { require(identityAdmin == msg.sender); _; }
  
  modifier isNonEmpty(string s) { require(bytes(s).length > 0); _; }
  
  modifier isPendingRequestAvailable() { require(requestHashes.length > 0); _; }
  
  function submitRequest(string evidenceUri) public isNonEmpty(evidenceUri) payable {
    bytes32 evidenceHash = sha256(bytes(evidenceUri));
    requests[evidenceHash] = IdentityRequest({
      id: evidenceHash,
      requestor: msg.sender,
      evidenceUri: evidenceUri,
      timestamp: block.timestamp * 1000
    });
    requestHashes.push(evidenceHash);
    identityAdmin.transfer(requestPrice);
    emit NewRequestEvent({
      evidenceHash: evidenceHash
    });
  }
  
  function setRequestPrice(uint price) public isIdentityAdmin() {
    requestPrice = price;
  }
  
  function getRequestById(bytes32 evidenceHash) public view isIdentityAdmin() returns ( bytes32 , address requestor, string evidenceUri, uint timestamp) {
    return ( 
      evidenceHash, 
      requests[evidenceHash].requestor,
      requests[evidenceHash].evidenceUri,
      requests[evidenceHash].timestamp
    );
  }
  
  function getNextRequestId() public view isIdentityAdmin() isPendingRequestAvailable() returns ( bytes32 evidenceHash, address requestor, string evidenceUri, uint timestamp) {
    return getRequestById(requestHashes[0]);
  }
  
  struct Provider {
    address identityAddress;
    string provider; // twitter, github, linkedin, youtube, whatever
    string userName; // @theRealDude, etc    
    uint timestamp;
    string evidenceUri;
    bool active;
  }
  
  struct Identity {
    uint id;
    Provider[] providers;
  }
  
  uint nextIdentityIndex = 1;
  mapping(uint => Identity) identities;
  mapping(address => uint) identityLookup;
  mapping(string => mapping(string => uint)) providerLookup; // provider => username => identityId
  
  function getOrCreateIdentityId(address user, string provider, string userName) internal isIdentityAdmin() returns ( uint ) {
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
  
  function cleanupRequest(bytes32 evidenceHash) internal isIdentityAdmin {
    delete requests[evidenceHash];
    for (uint i = 0; i < requestHashes.length; i++) {
      if(requestHashes[i] == evidenceHash) {
        delete requestHashes[i];
        return;
      }
    }
  }
  
  function approve(bytes32 evidenceHash, string provider, string userName) public isIdentityAdmin() {
    
    address requestor = requests[evidenceHash].requestor;
    
    uint id = getOrCreateIdentityId(requestor, provider, userName);
    
    identities[id].providers.push(Provider({
      identityAddress: requestor,
      provider: provider,
      userName: userName,
      timestamp: requests[evidenceHash].timestamp,
      evidenceUri: requests[evidenceHash].evidenceUri,
      active: true
    }));
    
    identityLookup[requestor] = id;
    providerLookup[provider][userName] = id;
    
    emit NewApprovedProviderEvent({
      identityId: id,
      providerId: identities[id].providers.length - 1
    });

    cleanupRequest(evidenceHash);
  }
  
  function reject(bytes32 evidenceHash) public isIdentityAdmin() {
    cleanupRequest(evidenceHash);
  }
  
  function getMyIdentity() internal view returns ( Identity ) {
    return identities[identityLookup[msg.sender]];
  }
  
  function getIdentityByAddress(address a) internal view returns ( Identity ) {
    return identities[identityLookup[a]];
  }
  
  
  function getMyIdentityInfo() public view returns ( uint id, uint providerCount ) {
    return getIdentityInfo(identityLookup[msg.sender]);
  }
  
  
  function getMyProviderInfo(uint providerId) public view returns ( address identityAddress, string provider, string userName, uint timestamp, string evidenceUri, bool active ) {
    return getProviderInfo(identityLookup[msg.sender], providerId);
  }
  
  function getIdentityInfoByAddress(address identityAddress) public view returns ( uint id, uint providerCount ) {
    return getIdentityInfo(identityLookup[identityAddress]);
  }
  
  function getIdentityInfo(uint identityId) public view returns ( uint id, uint providerCount ) {
    Identity memory identity = identities[identityId];
    id = identity.id;
    providerCount = identity.providers.length;
  }
  
  function getProviderInfo(uint identityId, uint providerId) public view returns ( address identityAddress, string provider, string userName, uint timestamp, string evidenceUri, bool active ) {
    Identity memory identity = identities[identityId];
    require(providerId < identity.providers.length);
    Provider memory p = identity.providers[providerId];
    identityAddress = p.identityAddress;
    provider = p.provider;
    userName = p.userName;
    timestamp = p.timestamp;
    evidenceUri = p.evidenceUri;
    active = p.active;
  }
  
}
