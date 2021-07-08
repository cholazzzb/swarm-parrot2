import fs from "fs";

const totalQuads = 2;
const dataNames = ["time", "xPos", "yPos", "zPos", "yaw"];

function DataRecorderFC(setup) {
  this.data = {
    obstacles_position: setup.obstaclesPosition,
    targets_position: setup.targetsPosition,
    distance_quads: {
      time: [],
      distance: [],
    },
  };
  for (let quadIndex = 1; quadIndex <= totalQuads; quadIndex++) {
    this.data[`Quad${quadIndex}`] = {};
    dataNames.forEach((name) => {
      this.data[`Quad${quadIndex}`][name] = [];
    });
  }
}

/**
 * 
 * @param {*} newDistanceData 
 */
DataRecorderFC.prototype.addDistanceData = function (newDistanceData) {
  this.data.distance_quads.time.push(newDistanceData.time);
  this.data.distance_quads.distance.push(newDistanceData.distance);
};

DataRecorderFC.prototype.addData = function (newDatas, quadIndex) {
  newDatas.forEach((newData, dataIndex) => {
    this.data[`Quad${quadIndex}`][dataNames[dataIndex]].push(newData);
  });
};

DataRecorderFC.prototype.saveData = function (extension, folderName, fileName) {
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

export default DataRecorderFC;
