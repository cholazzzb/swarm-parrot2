import fs from "fs";

const dataNames = [
  "time",
  "stateX",
  "stateY",
  "stateZ",
  "stateYaw",
  "errX",
  "errY",
  "errZ",
  "errYaw",
  "goalX",
  "goalY",
  "goalZ",
  "goalYaw",
  "ux",
  "uy",
  "uz",
  "uyaw",
];

function DataRecorder() {
  this.data = {};
  dataNames.forEach((name) => {
    this.data[name] = [];
  });

  this.velData = {
    x: [],
    y: []
  }
}

DataRecorder.prototype.addData = function (newDatas) {
  newDatas.forEach((newData, dataIndex) => {
    this.data[dataNames[dataIndex]].push(newData);
  });
};

DataRecorder.prototype.addVelData = function([xVel, yVel]){
  this.velData.x.push(xVel)
  this.velData.y.push(yVel)
}

DataRecorder.prototype.saveData = function (extension, folderName, fileName) {
  let content;
  switch (extension) {
    case "js":
      content = `const ${fileName} = ${JSON.stringify(
        this.state
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
