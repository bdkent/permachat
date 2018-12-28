pragma solidity >=0.5.0 <0.6.0;

contract IdentityModel {
  address payable identityAdmin;
  uint public requestPrice;
    
  constructor() public {
    identityAdmin = msg.sender;
  }
  
  // maybe provider should be a uint8 ?
  
  struct IdentityRequest {
    uint id;
    address requestor;
    string provider; // twitter, github, linkedin, youtube, whatever
    string userName; // @theRealDude, etc    
    string identifier;
    uint timestamp;
  }
  
  event NewRequestEvent(
      uint identityRequestId
  );
  
  event NewApprovedProviderEvent(
    uint identityId,
    uint providerId
  );

  uint public nextIdentityRequestIndex = 1;
  uint public pendingIdentityRequestIndex = 1;
  mapping(uint => IdentityRequest) requests;
  
  modifier isIdentityAdmin { require(identityAdmin == msg.sender); _; }
  
  modifier isNonEmpty(string memory s) { require(bytes(s).length > 0); _; }
  
  modifier isPendingRequestAvailable() { require(pendingIdentityRequestIndex < nextIdentityRequestIndex); _; }
  
  modifier isValidRequestId(uint requestId) { require(requestId < nextIdentityRequestIndex); _; }
  
  modifier isMyRequestId(uint requestId) { require(requests[requestId].requestor == msg.sender); _; }
  
  function toIdentityId(address identityAddress) internal view returns ( uint ) {
    return identityLookup[identityAddress];
  }
  
  struct Provider {
    uint requestId;
    uint timestamp;
    bool active;
  }
  
  struct Identity {
    uint id;
    Provider[] providers;
    Rejection[] rejections;
  }
  
  enum RejectionReason {
    UNKNOWN_PROVIDER,
    UNKNOWN_USERNAME,
    UNKNOWN_IDENTIFIER,
    MISMATCHED_USERNAME
  }
  
  struct Rejection {
    uint requestId;
    RejectionReason reason;
  }
  
  uint nextIdentityIndex = 1;
  mapping(uint => Identity) identities;
  mapping(address => uint) identityLookup;
  mapping(string => mapping(string => uint)) providerLookup; // provider => username => identityId
  
  modifier hasIdentity { require( identities[identityLookup[msg.sender]].providers.length > 0 ); _; }
  
}
