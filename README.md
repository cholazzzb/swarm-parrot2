# swarm-parrot2

## A repo to control Multiple Parrot AR.2 Drone with Virtual Structure and Artificial Potential Field

## Warning

This Repo is using ardrone-autonomy package, there are some lines of code of ardrone-autonomy to be edited before using this package:

(In ardrone-autonomy package)
/index.js
function createMission(){
return [client, controller, mission] // Change this line
}

/lib/Controller.js
Controller.prototype.\_control(){
var cx = within(Math.cos(yaw) _ ux + Math.sin(yaw) _ uy, -0.1, 0.1); // Change this line
var cy = within(-Math.sin(yaw) _ ux + Math.cos(yaw) _ uy, -0.1, 0.1); // Change this line
}
