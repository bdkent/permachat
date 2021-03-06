pragma solidity >=0.5.0 <0.6.0;

import "./IndexerModel.sol";
import "./IndexerAdminService.sol";

contract DatabaseIndexer is IndexerModel, IndexerAdminService {
  
  function getDatabaseHash(uint databaseIndex) public view requireIndexed(databaseIndex) returns ( bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize ) {
    multihashDigest = databaseHashes[databaseIndex].digest;
    multihashHashFunction = databaseHashes[databaseIndex].hashFunction;
    multihashSize = databaseHashes[databaseIndex].size;
  }

  function getLatestDatabaseState() public view returns ( uint latestIndex, uint paidIndex, bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize ) {
    latestIndex = latestDatabaseIndex;
    paidIndex = paidDatabaseIndex;
    multihashDigest = databaseHashes[latestDatabaseIndex].digest;
    multihashHashFunction = databaseHashes[latestDatabaseIndex].hashFunction;
    multihashSize = databaseHashes[latestDatabaseIndex].size;
  }
  
  function unlockNewestDatabase() public payable requireDatabasePayable {
    if(msg.sender != indexerAdmin) {
      indexerAdmin.transfer(unlockPrice);  
    }
    paidDatabaseIndex = nextActionId - 1;
    emit DatabaseIndexPaidEvent(paidDatabaseIndex);
  }
  
  function isDatabasePayable() public view requireDatabasePayable returns (bool) {
    return true;
  }
  
  function unlockableUpdates() public view returns (uint) {
    if(nextActionId == 0 || (paidDatabaseIndex + 1) >= nextActionId) {
      return 0;
    } else {
      return nextActionId - paidDatabaseIndex - 1;
    }
  }
}
