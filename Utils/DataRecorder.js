import fs from "fs";

const dataName = [
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
  dataName.forEach((name) => {
    this.data[name] = [];
  });
}

DataRecorder.prototype.addData = function (newDatas) {
  newDatas.forEach((newData, dataIndex) => {
    this.data[dataName[dataIndex]].push(newData);
  });
};

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
