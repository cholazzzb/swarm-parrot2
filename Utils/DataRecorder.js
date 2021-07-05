import fs from "fs";

function DataRecorder() {
  this.state = {
    time: [],
    xPos: [],
    yPos: [],
    zPos: [],
    yaw: [],
  };
  this.goal = {
    goal: [],
  };
  this.control = {
    u_x: [],
    u_y: [],
    u_z: [],
    u_yaw: [],
  };
}

DataRecorder.prototype.addState = function ([
  newTime,
  newX,
  newY,
  newZ,
  newYaw,
]) {
  this.state.time.push(newTime);
  this.state.xPos.push(newX);
  this.state.yPos.push(newY);
  this.state.zPos.push(newZ);
  this.state.yaw.push(newYaw);
};

DataRecorder.prototype.saveData = function (extension, folderName, fileName) {
  let content;
  switch (extension) {
    case "js":
      content = `const ${fileName} = ${JSON.stringify(
        this.data
      )}; export default ${fileName}`;
      break;
    case "py":
      content = `${fileName} = ${JSON.stringify(this.data)}`;
      break;

    default:
      break;
  }
  fs.writeFileSync(`${folderName}/${fileName}.${extension}`, content, "utf-8");
};

export default DataRecorder;
