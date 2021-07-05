import autonomy from "ardrone-autonomy";

var [client1, control1, mission1] = autonomy.createMission({
  ip: "192.168.1.1",
});
var [client2, control2, mission2] = autonomy.createMission({
  ip: "192.168.2.2",
});
console.log("success connecting");

client1.land();
client2.land();
