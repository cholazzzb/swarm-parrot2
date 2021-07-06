import autonomy from "ardrone-autonomy";
import socketIOClient from "socket.io-client"
import DataRecorder from "../../Utils/DataRecorder.js";
import {QUAD1_NAVDATA, QUAD1_VELDATA, QUAD1_REQUEST, QUAD1_COMMAND} from "../../Utils/CONSTANT.js";

const folderName = "./Data/Map1";
const fileName = "Quad1";

const SOCKET_SERVER_URL = "http://localhost:4000";
const socketConnection = socketIOClient(SOCKET_SERVER_URL)

const Recorder = new DataRecorder();
let initialTime = new Date().getTime();

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.1.1",
});

client1.on("navdata", (data) => {
  if (data.demo != undefined) {
    let demoData = Object(data.demo);
    Recorder.addVelData([demoData.velocity.x, demoData.velocity.y]);
    socketConnection.emit(QUAD1_VELDATA, demoData.velocity)
  }
});

let xPos;
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
    yaw: newData.state.yaw
  })
  xPos = newData.state.x;
});

// try {
//   console.log("TAKEOFF!");
//   client1.takeoff();

//   console.log("GO!");
//   client1.after(5000, () => {
//     let target = 0.0;
//     var intervalId = setInterval(() => {
//       console.log("NEW TARGET", target);
//       target = Math.round((target + 0.1) * 100) / 100;
//       control1.go({ x: target, y: 0, z: 0, yaw: 0 });
//       if (target == 2.0) {
//         console.log("XPOS", xPos)
//         console.log("LAND!");
//         console.log("DATA SAVED!");
//         client1.stop();
//         client1.land();
//         Recorder.saveData("py", folderName, fileName);
//         clearInterval(intervalId);
//       }
//     }, 500);
//   });
// } catch (error) {
//   console.error(`ERROR! : ${error}`);
// }
