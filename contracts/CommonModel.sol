pragma solidity >=0.5.0 <0.6.0;

contract CommonModel {
  
  enum TargetType { POST, COMMENT }
  
  uint public nextActionId = 1;
  
  struct Action {
    uint targetId;
    TargetType targetType;
  }
    
  mapping(uint => Action) actions;
  
  function getAction(uint actionId) public view returns ( uint targetId, TargetType targetType ) {
    targetId = actions[actionId].targetId;
    targetType = actions[actionId].targetType;
  }
  
  function addAction(uint targetId, TargetType targetType) internal {
    actions[nextActionId] = Action({
      targetId: targetId,
      targetType: targetType
    });

    nextActionId += 1;
  }
  
}
