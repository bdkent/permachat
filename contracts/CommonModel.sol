pragma solidity >=0.5.0 <0.6.0;

contract CommonModel {

  // see https://github.com/saurfang/ipfs-multihash-on-solidity 
  
  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }
}
