pragma solidity >=0.5.0 <0.6.0;

import "./CommonModel.sol";

contract DatabaseIndexer is CommonModel {
  
  address indexerAdmin;

  constructor() public {
    indexerAdmin = msg.sender;
  }
  
  modifier isIndexerAdmin { require(indexerAdmin == msg.sender); _; }
  
  // DB MANAGEMENT:

  uint public latestDatabaseIndex = 0;
  mapping(uint => string) datebaseHashes;

  event DBUpdateEvent(uint currentDatabaseIndex);

  function setNewDB(string memory ipfsHash) public isIndexerAdmin {
    latestDatabaseIndex += 1;
    datebaseHashes[latestDatabaseIndex] = ipfsHash;
    emit DBUpdateEvent(latestDatabaseIndex);
  }

  function getDB(uint currentDatabaseIndex) public view returns ( string memory ) {
    require(currentDatabaseIndex >= 0 &&  currentDatabaseIndex <= latestDatabaseIndex);
    return datebaseHashes[currentDatabaseIndex];
  }

  function getLatestDBIndex() public view returns (uint) {
    return latestDatabaseIndex;
  }

  function getLatestDBHash() public view returns ( string memory ) {
    return datebaseHashes[latestDatabaseIndex];
  }
}
