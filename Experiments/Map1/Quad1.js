import autonomy from "ardrone-autonomy";
import socketIOClient from "socket.io-client";
import DataRecorder from "../../Utils/DataRecorder.js";
import {
  QUAD1_NAVDATA,
  QUAD1_REQUEST,
  QUAD1_COMMAND,
} from "../../Utils/CONSTANT.js";

const folderName = "./Data/Map1";
const fileName = "Quad1";

const SOCKET_SERVER_URL = "http://localhost:4000";
const socketConnection = socketIOClient(SOCKET_SERVER_URL);

const Recorder = new DataRecorder();
let initialTime = new Date().getTime();

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.1.1",
});

var currentPos;
var currentTarget;
control1.on("controlData", (newData) => {
  let time = Math.round((new Date().getTime() - initialTime) / 10, 2) / 100;
  Recorder.addData([
    time,
    newData.state.x,
    newData.state.y,
    newData.state.z,
    newData.state.yaw,
    newData.error.ex,
    newData.error.ey,
    newData.error.ez,
    newData.error.eyaw,
    newData.goal.x,
    newData.goal.y,
    newData.goal.z,
    newData.goal.yaw,
    newData.control.ux,
    newData.control.uy,
    newData.control.uz,
    newData.control.uyaw,
    currentTarget.x,
    currentTarget.y,
    currentTarget.z,
  ]);
  socketConnection.emit(QUAD1_NAVDATA, {
    x: newData.state.x,
    y: newData.state.y,
    z: newData.state.z,
    yaw: newData.state.yaw,
  });
  currentPos = {
    x: newData.state.x,
    y: newData.state.y,
    z: newData.state.z,
  };
  console.log("CURRENT POS", currentPos);
});

socketConnection.on(QUAD1_COMMAND, (command_data) => {
  console.log("COMMAND DATA", command_data);
  if (command_data.command == "GO") {
    console.log("CURRENT POS", currentPos);
    currentTarget = command_data.target[0];
    currentTarget.z = 0.7;
    console.log("NEW TARGET", currentTarget);
    control1.go(currentTarget);
  } else {
    console.log("LAND!");
    client1.stop();
    client1.land();
    Recorder.saveData("py", folderName, fileName);
    console.log("DATA SAVED!");
    clearInterval(intervalId);
  }
});

var intervalId = setInterval(() => {
  socketConnection.emit(QUAD1_REQUEST, "REQUEST");
}, 500);

try {
  console.log("TAKEOFF!");
  client1.takeoff();

  console.log("GO!");
  client1.after(5000, () => {
    // intervalId;
    control1.go({ x: 0.5, y: 0, z: 0.7, yaw: 0 });
  });
} catch (error) {
  client1.stop();
  client1.land();
  console.error(`ERROR! : ${error}`);
}
