import FormationControl from "../../Utils/FormationControl/FormationControl.js";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:4000";
const SOMETHING = "";

const setup = {
  /**
   * initial agents position : [x, y, z, yaw] (Quad Frame)
   * */
  
  initialAgentsPosition: [
    [0.0, -0.75, 0, 0],
    [0.0, 0.75, 0, 0],
  ],
  obstaclesPosition: [],
  targetsPosition: [[5, 0.75, 1]],
  initialFRP: [0, 0, 0],
};

const controller = new FormationControl(setup);

const connectionTunnel = socketIOClient(SOCKET_SERVER_URL, {
  query: "",
});

connectionTunnel.on(SOMETHING, (data) => {});
