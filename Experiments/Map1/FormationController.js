import FormationControl from "../../Utils/FormationControl/FormationControl.js";
import socketIOClient from "socket.io-client";
import {
  QUAD1_NAVDATA,
  QUAD1_VELDATA,
  QUAD1_COMMAND,
  QUAD1_REQUEST,
  QUAD2_NAVDATA,
  QUAD2_VELDATA,
  QUAD2_COMMAND,
  QUAD2_REQUEST,
} from "../../Utils/CONSTANT.js";

const SOCKET_SERVER_URL = "http://localhost:4000";

const setup = {
  /**
   * initial agents position : [x, y, z, yaw] (Quad Frame)
   * */
  initialAgentsPosition: [
    [-1.0, -0.75, 0, 0],
    [0.0, 1.25, 0, 0],
  ],
  obstaclesPosition: [[2, 0, 0]],
  targetsPosition: [[5, 0.75, 1]],
  initialFRP: [0, 0.75, 0],
};

const controller = new FormationControl(setup);
let current_map = {
  agents_position: setup.initialAgentsPosition,
  agents_velocity: [
    [0, 0, 0],
    [0, 0, 0],
  ],
  obstacles_position: setup.obstaclesPosition,
  targets_position: setup.targetsPosition,
};

const connectionTunnel = socketIOClient(SOCKET_SERVER_URL);

connectionTunnel.on(QUAD1_NAVDATA, (nav_data) => {
  current_map.agents_position[0] = [
    nav_data.x,
    nav_data.y,
    nav_data.z,
    nav_data.yaw,
  ];
});
connectionTunnel.on(QUAD1_VELDATA, (vel_data) => {
  current_map.agents_velocity[0] = vel_data;
  // console.log(current_map.agents_velocity);
});
connectionTunnel.on(QUAD1_REQUEST, (request_data) => {
  if (request_data) {
    // Calculate New Target Position
    let yaws = [];
    let positions = [];
    current_map.agents_position.forEach((agent_position) => {
      positions.push([agent_position[0], agent_position[1], agent_position[2]]);
      yaws.push(agent_position[3]);
    });
    console.log("----- -----");
    console.log("INPUT", positions, current_map.agents_velocity, yaws);
    controller.calculateTargetPos(positions, current_map.agents_velocity, yaws);
    let [
      [targetX1, targetY1, targetZ1, targetYaw1],
      [targetX2, targetY2, targetZ2, targetYaw2],
    ] = controller.NewAgentsTargetPos;
    let new_target_pos = [
      {
        x: targetX1,
        y: targetY1,
        z: targetZ1,
        yaw: targetYaw1,
      },
      {
        x: targetX2,
        y: targetY2,
        z: targetZ2,
        yaw: targetYaw2,
      },
    ];
    console.log("NEW TARGET", new_target_pos);

    connectionTunnel.emit(QUAD1_COMMAND, {
      command: "GO",
      target: new_target_pos,
    });
    // If already at destination -> Takeoff
    if (
      (controller.VS.Formation_Reference_Point[0] ==
        setup.targetsPosition[0][0]) &
      (controller.VS.Formation_Reference_Point[1] ==
        setup.targetsPosition[0][1])
    ) {
      connectionTunnel.emit(QUAD1_COMMAND, {
        command: "LAND",
      });
    }
  }
});

connectionTunnel.on(QUAD2_NAVDATA, (nav_data) => {
  current_map.agents_position[1] = [
    nav_data.x,
    nav_data.y,
    nav_data.z,
    nav_data.yaw,
  ];
});
connectionTunnel.on(QUAD2_VELDATA, (vel_data) => {
  current_map.agents_velocity[1] = vel_data;
  // console.log("AGENTS VEL", current_map.agents_velocity);
});
connectionTunnel.on(QUAD2_REQUEST, (request_data) => {
  if (request_data) {
    // Calculate New Target Position
    let yaws = [];
    let positions = [];
    current_map.agents_position.forEach((agent_position) => {
      positions.push([agent_position[0], agent_position[1], agent_position[2]]);
      yaws.push(agent_position[3]);
    });
    console.log("INPUT", positions, current_map.agents_velocity, yaws);
    controller.calculateTargetPos(positions, current_map.agents_velocity, yaws);
    let [
      [targetX1, targetY1, targetZ1, targetYaw1],
      [targetX2, targetY2, targetZ2, targetYaw2],
    ] = controller.NewAgentsTargetPos;
    let new_target_pos = [
      {
        x: targetX1,
        y: targetY1,
        z: targetZ1,
        yaw: targetYaw1,
      },
      {
        x: targetX2,
        y: targetY2,
        z: targetZ2,
        yaw: targetYaw2,
      },
    ];
    console.log("NEW TARGET", new_target_pos);
    connectionTunnel.emit(QUAD2_COMMAND, {
      command: "GO",
      target: new_target_pos,
    });
    // If already at destination -> Takeoff
    if (
      (controller.VS.Formation_Reference_Point[0] ==
        setup.targetsPosition[0][0]) &
      (controller.VS.Formation_Reference_Point[1] ==
        setup.targetsPosition[0][1])
    ) {
      connectionTunnel.emit(QUAD2_COMMAND, {
        command: "LAND",
      });
    }
  }
});
