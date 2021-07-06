import ArtificialPotentialField from "./ArtificialPotentialField.js";
import VirtualStructure from "./VirtualStructure.js";
import * as util from "./Util.js";

function FormationControl(setup) {
  this.VS = new VirtualStructure(setup.initialFRP);
  this.APF = new ArtificialPotentialField(
    [setup.initialFRP],
    setup.obstaclesPosition,
    setup.targetsPosition
  );

  let [initialAgentPosition1, initialAgentPosition2] =
    setup.initialAgentsPosition;
  this.NewAgentsTargetPos = [
    initialAgentPosition1, // Quad1 [targetX, targetY, targetZ, targetYaw]
    initialAgentPosition2, // Quad2 [targetX, targetY, targetZ, targetYaw]
  ];
}

/**
 *
 * @param {*} Agents_Position
 * @param {*} Agents_Velocity
 * @param {*} Agents_Yaw
 * @returns {[[xPos, yPos, zPos, yaw]1, [xPos, yPos, zPos, yaw]2]} newPositions
 */
FormationControl.prototype.calculateTargetPos = function (
  Agents_Position,
  Agents_Velocity,
  Agents_Yaw
) {
  let numberQuadrotorOnVSPoint = 0;
  let newPositions;
  // Check how many quads already in target VS point
  Agents_Position.forEach((Agent_Position, Agent_Index) => {
    let posInGlobalFrame = util.transToWorldFrame(
      Agent_Position,
      Agents_Yaw[Agent_Index]
    );
    let VS_Points = this.VS.VS_Points;
    console.log("VS POINTS", VS_Points);
    let distance =
      Math.round(
        Math.sqrt(
          (posInGlobalFrame[0] - VS_Points[Agent_Index][0]) ** 2 +
            (posInGlobalFrame[1] - VS_Points[Agent_Index][1]) ** 2
        ) * 100
      ) / 100;

    if (distance < 0.1) {
      numberQuadrotorOnVSPoint++;
    }
  });

  // console.log("NUMBER IN VS POINT", numberQuadrotorOnVSPoint);
  let distanceVector = util.calculateWithVector(
    "minus",
    this.VS.Formation_Reference_Point,
    this.APF.Targets_Position[0]
  );
  // console.log("Distance Vector", distanceVector);
  let newHeadingAngle =
    Math.round(Math.atan2(distanceVector[1], distanceVector[0]) * 10) / 10;
  // console.log("NEW Heading Angle", newHeadingAngle);
  this.VS.Heading_Angle = newHeadingAngle;
  // Only for 2 quadrotors
  if (numberQuadrotorOnVSPoint == 2) {
    // Calculate APF Force
    let totalAPF = this.APF.calculateTotalForce(Agents_Velocity);
    // Get new VSPoint
    newPositions = this.VS.calculateNewVSPoint(totalAPF);
    this.NewAgentsTargetPos = newPositions;
  } else {
    // Control the Quads to VS Point

    let VS_Points = this.VS.VS_Points;
    this.NewAgentsTargetPos = [
      [VS_Points[0][0], VS_Points[0][1], VS_Points[0][2], 0],
      [VS_Points[1][0], VS_Points[1][1], VS_Points[1][2], 0],
    ];
  }
};

var intervalNumber = 0;
// Control Loop
FormationControl.prototype.intervalControl = function (currentPositions) {
  intervalNumber++;
  let Agents_Position = currentPositions;
  let Agents_Velocity = [
    [
      this.Map.history.xVel[0].data[this.Map.history.xVel[0].data.length - 1].y,
      this.Map.history.yVel[0].data[this.Map.history.yVel[0].data.length - 1].y,
      0,
    ],
    [
      this.Map.history.xVel[1].data[this.Map.history.xVel[1].data.length - 1].y,
      this.Map.history.yVel[1].data[this.Map.history.yVel[1].data.length - 1].y,
      0,
    ],
  ]; 
  // Navdata
  let Agents_Yaw = [
    this.currentDatas[0].currentYaw,
    this.currentDatas[1].currentYaw,
  ]; 


  this.calculateTargetPos(Agents_Position, Agents_Velocity, Agents_Yaw);
  let [
    [targetX1, targetY1, targetZ1, targetYaw1],
    [targetX2, targetY2, targetZ2, targetYaw2],
  ] = this.NewAgentsTargetPos;
};

export default FormationControl;
