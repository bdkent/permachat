pragma solidity >=0.5.0 <0.6.0;

contract ActionModel {
  
  enum TargetType { POST, REPLY, COMMENT }
  
  uint public nextActionId = 1;
  
  struct Action {
    uint targetId;
    TargetType targetType;
  }
    
  mapping(uint => Action) actions;
  
  event NewActionEvent(
    uint actionId,
    uint targetId,
    TargetType targetType
  );
  
  function getAction(uint actionId) public view returns ( uint targetId, TargetType targetType ) {
    targetId = actions[actionId].targetId;
    targetType = actions[actionId].targetType;
  }
  
  function addAction(uint targetId, TargetType targetType) internal returns (uint) {
    uint newActionId = nextActionId;
    actions[newActionId] = Action({
      targetId: targetId,
      targetType: targetType
    });

    nextActionId += 1;
    
    emit NewActionEvent({
      actionId: newActionId,
      targetId: targetId,
      targetType: targetType
    });
    
    return newActionId;
  }
  
}
