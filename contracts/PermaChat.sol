pragma solidity >=0.5.0 <0.6.0;

import "./IdentityRegistry.sol";
import "./DatabaseIndexer.sol";
import "./ChatService.sol";
import "./ChatViews.sol";

contract PermaChat is IdentityRegistry, DatabaseIndexer, ChatService, ChatViews { }
