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
  obstaclesPosition: [],
  targetsPosition: [[5, 0.75, 1]],
  initialFRP: [0, 0.75, 0],
};

const controller = new FormationControl(setup);
let map = {
  agents_position: setup.initialAgentsPosition,
  agents_velocity: [0, 0],
  obstacles_position: setup.obstaclesPosition,
  targets_position: setup.targetsPosition,
};

const connectionTunnel = socketIOClient(SOCKET_SERVER_URL);

connectionTunnel.on(QUAD1_NAVDATA, (nav_data) => {
  map.agents_position[0] = [nav_data.x, nav_data.y, nav_data.z, nav_data.yaw];
});
connectionTunnel.on(QUAD1_VELDATA, (vel_data) => {
  map.agents_velocity[0] = Math.sqrt(vel_data.x ^ (2 + vel_data.y) ^ 2);
  console.log(map.agents_velocity);
});
connectionTunnel.on(QUAD1_REQUEST, (request_data) => {
  if (request_data) {
    // Calculate New Target Position
    connectionTunnel.emit(QUAD1_COMMAND, {});
  }
});

connectionTunnel.on(QUAD2_NAVDATA, (nav_data) => {
  map.agents_position[1] = [nav_data.x, nav_data.y, nav_data.z, nav_data.yaw];
});
connectionTunnel.on(QUAD2_VELDATA, (vel_data) => {
  map.agents_velocity[1] = Math.sqrt(vel_data.x ^ (2 + vel_data.y) ^ 2);
  console.log(map.agents_velocity);
});
connectionTunnel.on(QUAD2_REQUEST, (request_data) => {
  if (request_data) {
    // Calculate New Target Position
    connectionTunnel.emit(QUAD2_COMMAND, {});
  }
});
