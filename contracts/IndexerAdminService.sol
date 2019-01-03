pragma solidity >=0.5.0 <0.6.0;

import "./IndexerModel.sol";

contract IndexerAdminService is IndexerModel {

  function setUnlockPrice(uint price) public requireIndexerAdmin {
    unlockPrice = price;
  }

  function setDatabaseIndex(uint databaseIndex, bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize) public requireIndexerAdmin requireIndexable(databaseIndex){
    if(latestDatabaseIndex < databaseIndex) {
      latestDatabaseIndex = databaseIndex;
    }

    databaseHashes[databaseIndex] = Multihash({
      digest: multihashDigest,
      hashFunction: multihashHashFunction,
      size: multihashSize
    });
  }
  
  function resetDatabase() public requireIndexerAdmin {
    latestDatabaseIndex = 0;
  }
}
