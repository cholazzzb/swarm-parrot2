import autonomy from "ardrone-autonomy";
import socketIOClient from "socket.io-client";
import DataRecorder from "../../Utils/DataRecorder.js";
import {
  QUAD1_NAVDATA,
  QUAD1_VELDATA,
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

client1.on("navdata", (data) => {
  if (data.demo != undefined) {
    let demoData = Object(data.demo);
    Recorder.addVelData([demoData.velocity.x, demoData.velocity.y]);
    socketConnection.emit(QUAD1_VELDATA, 0.1);
  }
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
});

let fakeSensor = {
  x: 0,
  y: 0,
  z: 0.7,
  yaw: 0,
};
let fakeVel = [0,0,0]
let target = 0;
socketConnection.on(QUAD1_COMMAND, (command_data) => {
  console.log("COMMAND DATA", command_data);
  if (command_data.command == "GO") {
    currentTarget = command_data.target[0];
    console.log("NEW TARGET", currentTarget);
    fakeVel = [
      currentTarget.x - fakeSensor.x,
      currentTarget.y - fakeSensor.y,
      currentTarget.z - fakeSensor.z,
    ]
    fakeSensor = currentTarget;

    socketConnection.emit(QUAD1_NAVDATA, fakeSensor);
    socketConnection.emit(QUAD1_VELDATA, fakeVel);
    // target = Math.round((target + 0.1) * 100) / 100;
    // console.log("CURRENT TARGET", target)
    control1.go({ x: target, y: 0, z: 0, yaw: 0 });
  } else {
    console.log("LAND!");
    client1.stop();
    client1.land();
    Recorder.saveData("py", folderName, fileName);
    console.log("DATA SAVED!");
    clearInterval(intervalId);
  }
});

try {
  console.log("TAKEOFF!");
  client1.takeoff();

  console.log("GO!");
  client1.after(5000, () => {
    var intervalId = setInterval(() => {
      // console.log("CURRENT POSITION", currentPos);
      socketConnection.emit(QUAD1_REQUEST, "REQUEST");

      if (target == 2.0) {
        console.log("XPOS", currentPos);
        console.log("LAND!");
        console.log("DATA SAVED!");
        client1.stop();
        client1.land();
        Recorder.saveData("py", folderName, fileName);
        clearInterval(intervalId);
      }
    }, 500);
  });
} catch (error) {
  client1.stop();
  client1.land();
  console.error(`ERROR! : ${error}`);
}
