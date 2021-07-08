import { calculateEucDistance, calculateWithVector } from "./Util.js";

function ArtificialPotentialField(
  Agents_Position,
  Obstacles_Position,
  Targets_Position
) {
  this.Constants = {
    odr: 1,
    tdr: 1,
  };
  this.Parameters = {
    ktvi: 7.65,
    ktp: 8.97,
    kobp1: 7.93,
    kobp2: 5.55,
  };

  this.Agents_Position = Agents_Position;
  this.Obstacles_Position = Obstacles_Position;
  this.Targets_Position = Targets_Position; // Only 1 Target and Assume the target is static
  this.TPF = [[0, 0, 0]]; // Target Potential Force
  this.OPF = [[0, 0, 0]]; // Obstacle Potential Force
}

ArtificialPotentialField.prototype.setAgentsPosition = function (
  New_Agents_Position
) {
  this.Agents_Position = New_Agents_Position;
};
ArtificialPotentialField.prototype.setObstaclesPosition = function (
  New_Obstacles_Position
) {
  this.Obstacles_Position = New_Obstacles_Position;
};
ArtificialPotentialField.prototype.setTargetsPosition = function (
  New_Targets_Position
) {
  this.Targets_Position = New_Targets_Position;
};

ArtificialPotentialField.prototype.calculateTargetsPotentialForce = function (
  Agents_Velocity
) {
  let forces = [];
  this.Agents_Position.forEach((Agent_Position, index) => {
    let force = [0, 0, 0];
    let dampForce = [0, 0, 0];
    let distance = calculateEucDistance(
      Agent_Position,
      this.Targets_Position[0]
    );
    
    let distanceVector = calculateWithVector(
      "minus",
      Agent_Position,
      this.Targets_Position[0]
      );
    if (distance < this.Constants.tdr) {
      let coef = -this.Parameters.ktp / this.Constants.tdr;
      force = calculateWithVector("times", coef, distanceVector);
    } else {
      let distanceVectorUnit = calculateWithVector(
        "times",
        1 / distance,
        distanceVector
      );
      force = calculateWithVector(
        "times",
        -this.Parameters.ktp,
        distanceVectorUnit
      );
      dampForce = calculateWithVector(
        "times",
        this.Parameters.ktvi,
        Agents_Velocity[index]
      );
    }
    
    console.log("APF AGENTS", this.Agents_Position)
    console.log("force damp Force", force, Agents_Velocity)
    force = calculateWithVector("minus", force, dampForce);
    forces.push(force);
  });
  return forces;
};

// Formation Radius in VS (?)
ArtificialPotentialField.prototype.calculateObstaclesPotentialForce =
  function () {
    let forces = [];
    this.Agents_Position.forEach((Agent_Position) => {
      let force = [0, 0, 0];
      this.Obstacles_Position.forEach((Obstacle_Position) => {
        // If the obstacle detected ( distance to obstacle less than odr/obstacle detectring range)
        let distance = calculateEucDistance(Agent_Position, Obstacle_Position);
        console.log("FRP in APF", Agent_Position)
        let distanceVector = calculateWithVector(
          "minus",
          Agent_Position,
          Obstacle_Position
        );
        let distanceVectorUnit = calculateWithVector(
          "times",
          1 / distance,
          distanceVector
        );
        if (distance < this.Constants.odr) {
          let coef =
            ((1 / distance - 1 / this.Constants.odr) * this.Parameters.kobp1) /
              distance /
              distance -
            this.Parameters.kobp2 * (distance - this.Constants.odr);
          let newForce = calculateWithVector("times", coef, distanceVectorUnit);
          force = calculateWithVector("plus", force, newForce);
        }
      });
      
      forces.push(force);
    });
    return forces;
  };

ArtificialPotentialField.prototype.calculateTotalForce = function (
  currentVelocity
) {
  // TPF = Target Potential Force
  this.TPF = this.calculateTargetsPotentialForce(currentVelocity);
  // OPF = Obstacle Potential Force
  this.OPF = this.calculateObstaclesPotentialForce();
  console.log("OPF", this.OPF)
  console.log("TPF", this.TPF)
  let totalAPF = [];
  this.TPF.forEach((Force, Index) => {
    let totalForce = calculateWithVector("plus", Force, this.OPF[Index]);
    totalAPF.push(totalForce);
  });
  console.log("TOTAL APF", totalAPF)
  console.log("-----")
  return totalAPF;
};

export default ArtificialPotentialField;
