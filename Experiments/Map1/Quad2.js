import autonomy from "ardrone-autonomy";
import socketIOClient from "socket.io-client";
import DataRecorder from "../../Utils/DataRecorder.js";
import {
  QUAD2_NAVDATA,
  QUAD2_REQUEST,
  QUAD2_COMMAND,
} from "../../Utils/CONSTANT.js";

const folderName = "./Data/Map1";
const fileName = "Quad2";

const SOCKET_SERVER_URL = "http://localhost:4000";
const socketConnection = socketIOClient(SOCKET_SERVER_URL);

const Recorder = new DataRecorder();
let initialTime = new Date().getTime();

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.2.2",
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
    currentTarget.z
  ]);
  socketConnection.emit(QUAD2_NAVDATA, {
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
});

socketConnection.on(QUAD2_COMMAND, (command_data) => {
  console.log("COMMAND DATA", command_data);
  if (command_data.command == "GO") {
    console.log("CURRENT POS", currentPos);
    currentTarget = command_data.target[1];
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
  socketConnection.emit(QUAD2_REQUEST, "REQUEST");
}, 500);

try {
  console.log("TAKEOFF!");
  client1.takeoff();

  console.log("GO!");
  client1.after(5000, () => {
    intervalId;
  });
} catch (error) {
  client1.stop();
  client1.land();
  console.error(`ERROR! : ${error}`);
}
