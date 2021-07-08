import * as Util from "../../Utils/FormationControl/Util.js";
import FormationControl from "../../Utils/FormationControl/FormationControl.js";
import socketIOClient from "socket.io-client";
import {
  QUAD1_NAVDATA,
  QUAD1_COMMAND,
  QUAD1_REQUEST,
  QUAD2_NAVDATA,
  QUAD2_COMMAND,
  QUAD2_REQUEST,
} from "../../Utils/CONSTANT.js";
import DataRecorderFC from "../../Utils/DataRecorderFC.js";

const SOCKET_SERVER_URL = "http://localhost:4000";

const folderName = "./Data/Map1";
const fileName = "FC";
const setup = {
  /**
   * initial agents position : [x, y, z, yaw] (Quad Frame)
   * */
  initialAgentsPosition: [
    [-1.0, -0.75, 0.7, 0],
    [0.0, 1.25, 0.7, 0],
  ],
  obstaclesPosition: [[2, 0, 0.7]],
  targetsPosition: [[5, 0.75, 0.7]],
  initialFRP: [0, 0.75, 0.7],
};

const Recorder = new DataRecorderFC(setup);

const controller = new FormationControl(setup);
let current_map = {
  agents_position: [...setup.initialAgentsPosition],
  agents_velocity: [[0, 0, 0]], // FRP Vel,
  obstacles_position: [...setup.obstaclesPosition],
  targets_position: [...setup.targetsPosition],
};

let current_FRP_time = new Date().getTime();
let last_FRP_pos = setup.initialFRP;
let delta_FRP = [0, 0, 0];
let initial_time = new Date().getTime();

const connectionTunnel = socketIOClient(SOCKET_SERVER_URL);

connectionTunnel.on(QUAD1_NAVDATA, (nav_data) => {
  let new_nav_data = [
    nav_data.x + setup.initialAgentsPosition[0][0],
    nav_data.y + setup.initialAgentsPosition[0][1],
    nav_data.z,
    nav_data.yaw,
  ];
  current_map.agents_position[0] = new_nav_data;
  let time = (new Date().getTime() - initial_time) / 1000;
  Recorder.addData(
    [time, new_nav_data[0], new_nav_data[1], new_nav_data[2], new_nav_data[3]],
    1
  );
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

    let current_time = new Date().getTime();
    let delta_time = (current_time - current_FRP_time) / 1000; // ms to s * 1/1000
    current_FRP_time = current_time;

    current_map.agents_velocity[0][0] = delta_FRP[0] / delta_time;
    current_map.agents_velocity[0][1] = delta_FRP[1] / delta_time;
    current_map.agents_velocity[0][2] = delta_FRP[2] / delta_time;

    // console.log("----- -----");
    // console.log("INPUT", positions, current_map.agents_velocity, yaws);

    controller.calculateTargetPos(positions, current_map.agents_velocity, yaws);
    let [
      [targetX1, targetY1, targetZ1, targetYaw1],
      [targetX2, targetY2, targetZ2, targetYaw2],
    ] = controller.NewAgentsTargetPos;
    let new_target_pos = [
      {
        x: targetX1 - setup.initialAgentsPosition[0][0],
        y: targetY1 - setup.initialAgentsPosition[0][1],
        z: targetZ1,
        yaw: targetYaw1,
      },
      {
        x: targetX2 - setup.initialAgentsPosition[1][0],
        y: targetY2 - setup.initialAgentsPosition[1][1],
        z: targetZ2,
        yaw: targetYaw2,
      },
    ];
    // console.log("NEW TARGET", new_target_pos);

    connectionTunnel.emit(QUAD1_COMMAND, {
      command: "GO",
      target: new_target_pos,
    });
    let time = (new Date().getTime() - initial_time) / 1000;

    Recorder.addDistanceData({
      time: time,
      distance: Util.calculateEucDistance(
        current_map.agents_position[0],
        current_map.agents_position[1]
      ),
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
      console.log("FINISH! -FROM QUAD1");
      Recorder.saveData("py", folderName, fileName);
      console.log("DATA SAVED! -FROM QUAD1");
    }
    delta_FRP[0] = controller.VS.Formation_Reference_Point[0] - last_FRP_pos[0];
    delta_FRP[1] = controller.VS.Formation_Reference_Point[1] - last_FRP_pos[1];
    delta_FRP[2] = 0;
    last_FRP_pos = controller.VS.Formation_Reference_Point;
  }
});

connectionTunnel.on(QUAD2_NAVDATA, (nav_data) => {
  let new_nav_data = [
    nav_data.x + setup.initialAgentsPosition[1][0],
    nav_data.y + setup.initialAgentsPosition[1][1],
    nav_data.z,
    nav_data.yaw,
  ];

  current_map.agents_position[1] = new_nav_data;
  let time = (new Date().getTime() - initial_time) / 1000;
  Recorder.addData(
    [time, new_nav_data[0], new_nav_data[1], new_nav_data[2], new_nav_data[3]],
    2
  );
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
    // console.log("INPUT", positions, current_map.agents_velocity, yaws);
    let current_time = new Date().getTime();
    let delta_time = (current_time - current_FRP_time) / 1000; // ms to s * 1/1000
    current_FRP_time = current_time;

    current_map.agents_velocity[0][0] = delta_FRP[0] / delta_time;
    current_map.agents_velocity[0][1] = delta_FRP[1] / delta_time;
    current_map.agents_velocity[0][2] = delta_FRP[2] / delta_time;
    // console.log("delta FRP - time", delta_FRP, delta_time);
    controller.calculateTargetPos(positions, current_map.agents_velocity, yaws);
    let [
      [targetX1, targetY1, targetZ1, targetYaw1],
      [targetX2, targetY2, targetZ2, targetYaw2],
    ] = controller.NewAgentsTargetPos;
    console.log("NEW TARGET", controller.NewAgentsTargetPos);
    let new_target_pos = [
      {
        x: targetX1 - setup.initialAgentsPosition[0][0],
        y: targetY1 - setup.initialAgentsPosition[0][1],
        z: targetZ1,
        yaw: targetYaw1,
      },
      {
        x: targetX2 - setup.initialAgentsPosition[1][0],
        y: targetY2 - setup.initialAgentsPosition[1][1],
        z: targetZ2,
        yaw: targetYaw2,
      },
    ];
    console.log("INITIAL AGENT POS", setup.initialAgentsPosition);
    console.log("NEW TARGET POS NEW", new_target_pos);
    connectionTunnel.emit(QUAD2_COMMAND, {
      command: "GO",
      target: new_target_pos,
    });
    let time = (new Date().getTime() - initial_time) / 1000;

    Recorder.addDistanceData({
      time: time,
      distance: Util.calculateEucDistance(
        current_map.agents_position[0],
        current_map.agents_position[1]
      ),
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
      console.log("FINISH! -FROM QUAD2");
      Recorder.saveData("py", folderName, fileName);
      console.log("DATA SAVED! -FROM QUAD2");
    }
    // console.log(
    //   "FRP current - last",
    //   controller.VS.Formation_Reference_Point,
    //   last_FRP_pos
    // );
    delta_FRP[0] = controller.VS.Formation_Reference_Point[0] - last_FRP_pos[0];
    delta_FRP[1] = controller.VS.Formation_Reference_Point[1] - last_FRP_pos[1];
    delta_FRP[2] = 0;
    last_FRP_pos = controller.VS.Formation_Reference_Point;
  }
});
