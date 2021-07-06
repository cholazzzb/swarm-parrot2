import autonomy from "ardrone-autonomy";
import DataRecorder from "../../Utils/DataRecorder.js";

const folderName = "./Data/Map1";
const fileName = "Quad1";

const Recorder = new DataRecorder();
let initialTime = new Date().getTime();

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.1.1",
});

client1.on("navData", (data) => {
  console.log("NavData", data);

  // Save Velocity Data
});

control1.on("controlData", (newData) => {
  let time = Math.round((new Date().getTime() - initialTime) / 10, 2) / 100;
  Recorder.addState([
    time,
    newData.state.x,
    newData.state.y,
    newData.state.z,
    newData.state.yaw,
  ]);
});

// try {
//   console.log("TAKEOFF!");
//   client1.takeoff();

//   console.log("GO!");
//   client1.after(5000, () => {
//     control1.zero();
//     control1.go({ x: 3, y: 0, z: 0.7 });
//   });

//   client1.after(5000, () => {
//     console.log("LAND!");
//     Recorder.saveData("py", folderName, fileName);
//     console.log("DATA SAVED!");
//     client1.stop();
//     client1.land();
//   });
// } catch (error) {
//   console.error(`ERROR! : ${error}`);
// }
