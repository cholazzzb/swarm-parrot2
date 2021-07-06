import matplotlib.pyplot as plt
import sys
sys.path.append("./Data/Map1")
from Quad2 import Quad2

Time = Quad2['time']
xPos = Quad2['stateX']
yPos = Quad2["stateY"]
zPos = Quad2["stateZ"]
yaw = Quad2["stateYaw"]

plt.plot(Time, xPos, label="xPos")
plt.plot(Time, yPos, label="yPos")
plt.plot(Time, zPos, label="zPos")
# plt.plot(Time, yaw, label="yaw")
plt.title("")
plt.xlabel("Waktu (sekon)")
plt.ylabel("Posisi (meter)")
plt.legend(loc="lower right")

plt.show()
