import * as util from "./Util.js";

/**
 * NEED TO ADD INITIAL FRP
 * @param {*} shape_type
 * @returns VS Position for Heading Angle 0 degree
 */
function getShapePoints(shape_type) {
  let shape_points = [];
  switch (shape_type) {
    case "line":
      shape_points = [
        [0, -0.75, 0.7],
        [0, 0.75, 0.7],
      ];
      break;

    default:
      break;
  }
  return shape_points;
}

function VirtualStructure(Formation_Reference_Point) {
  /**
   * Formation
   *
   * Assumption : z is constant
   * POSITION
   * Virtual Structure = ()
   * Quadrotor 1 = ()
   * Quadrotor 2 = ()
   *
   */
  this.Heading_Angle = 0; // Yaw / Phi in Degree
  this.Shape_Points = getShapePoints("line"); // Agent Position from Formation Reference Point
  this.Formation_Reference_Point = Formation_Reference_Point;
  this.VS_Points = []; // Current Quadrotors Position in VS
  this.Shape_Points.forEach((shape_point) => {
    this.VS_Points.push(
      util.calculateWithVector(
        "plus",
        this.Formation_Reference_Point,
        shape_point
      )
    );
  });
  // this.Current_Positions = []; // Current Quadrotors Position in Real World
  this.Movement_Range = 0.1;
}

VirtualStructure.prototype.setCurrentVSPoints = function (Current_VS_Points) {
  this.VS_Points = Current_VS_Points;
};

VirtualStructure.prototype.calculateFRPVel = function (APFForce) {
  return util.calculateWithVector("times", 1 / util.mass, APFForce[0]);
};

VirtualStructure.prototype.calculateNewFRPPoint = function (APFForce) {
  let velocity = this.calculateFRPVel(APFForce);
  velocity.forEach((velElement, velIndex) => {
    if (velElement > this.Movement_Range) {
      velocity[velIndex] = this.Movement_Range;
    } else if (velElement < -this.Movement_Range) {
      velocity[velIndex] = -this.Movement_Range;
    }
  });

  let newFRPPoint = util.calculateWithVector(
    "plus",
    this.Formation_Reference_Point,
    velocity
  );

  this.Formation_Reference_Point = newFRPPoint;
};

/**
 * return new VS Points : [VSPoint1, VSPoint2]. VSPointx = [xPos, yPos, constant]
 */
VirtualStructure.prototype.calculateVSPoint = function () {
  let newVSPoints = [];
  this.Shape_Points.forEach((Shape_Point) => {
    let newVSPoint = util.transToWorldFrame(Shape_Point, this.Heading_Angle);
    newVSPoints.push(
      util.calculateWithVector(
        "plus",
        this.Formation_Reference_Point,
        newVSPoint
      )
    );
  });
  return newVSPoints;
};

VirtualStructure.prototype.calculateNewVSPoint = function (APFForce) {
  this.calculateNewFRPPoint(APFForce);
  this.VS_Points = this.calculateVSPoint();
  for (
    let VS_Point_Index = 0;
    VS_Point_Index < this.VS_Points.length;
    VS_Point_Index++
  ) {
    this.VS_Points[VS_Point_Index].push(0);
  }
  return this.VS_Points;
};

export default VirtualStructure;
