pragma solidity >=0.5.0 <0.6.0;

import "./ActionModel.sol";

contract IndexerModel is ActionModel {
  
  uint public unlockPrice;
  
  address payable indexerAdmin;
  
  constructor() public {
    indexerAdmin = msg.sender;
  }
  
  modifier requireIndexerAdmin { require(indexerAdmin == msg.sender); _; }
  
  modifier requireDatabasePayable { require(paidDatabaseIndex < nextActionId); _; }
  
  modifier requireIndexed(uint databaseIndex) { require(databaseIndex <= latestDatabaseIndex); _; }

  uint public latestDatabaseIndex = 0;
  uint public paidDatabaseIndex = 0;
  mapping(uint => string) databaseHashes;

  event DatabaseIndexPaidEvent(uint databaseIndex);
  event DatabaseIndexUpdateEvent(uint databaseIndex);
  
}
