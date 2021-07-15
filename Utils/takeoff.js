import autonomy from "ardrone-autonomy";

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.1.1",
});
var [client2, control2, mission2] = autonomy.createMission({
  ip: "192.168.2.2",
});
console.log("success connecting");

// client1.on("navdata", (navdata) => {
//   if (navdata.demo != undefined) {
//     console.log("Battery QUAD 1", navdata.demo.batteryPercentage);
//   }
// });
// client1.takeoff();
// control1.zero();
// client1.after(10000, () => {
//   client1.land();
// });

client2.on("navdata", (navdata) => {
  if (navdata.demo != undefined) {
    console.log("Battery QUAD 2", navdata.demo.batteryPercentage);
  }
});

client2.takeoff();
control2.zero();

client2.after(10000, () => {
  client2.land();
});
