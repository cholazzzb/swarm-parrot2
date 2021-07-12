import matplotlib.pyplot as plt
import sys

# Import Data
folderName = "./Data/Map1"
sys.path.append(folderName)
from Quad2 import Quad2 as exData

# Filename for saved figure
fileName = "Quad1" 

'''
--- Format of exData ---
exData = Dictionary
keys : {
    "time" 
    "stateX" 
    "stateY" 
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
    "targetX",
    "targetY",
    "targetZ
}
'''

# Plot X, Y, Z Position
plt.figure()
plt.title("Posisi X, Y, Z")
plt.plot(exData['time'], exData['stateX'], label="xPos")
plt.plot(exData['time'], exData['stateY'], label="yPos")
plt.plot(exData['time'], exData['stateZ'], label="zPos")
plt.plot(exData['time'], exData['targetX'], label="xTarget")
plt.plot(exData['time'], exData['targetY'], label="yTarget")
plt.plot(exData['time'], exData['targetZ'], label="zTarget")
plt.xlabel("Waktu (sekon)")
plt.ylabel("Posisi (meter)")
plt.legend(loc="upper left")
plt.savefig(folderName + "/"+ fileName + "Pos")

# Plot Yaw
plt.figure()
plt.title("Sudut Yaw")
plt.plot(exData['time'], exData['stateYaw'], label="yaw")
plt.legend(loc="lower right")
plt.xlabel("Waktu (sekon)")
plt.ylabel("Sudut Yaw (derajat)")
# plt.ylim(-2.5, 2.5)
plt.savefig(folderName + "/"+ fileName + "Yaw")

# Plot Error
plt.figure()
plt.title("Error X, Y, Z")
plt.plot(exData['time'], exData['errX'], label="error X")
plt.plot(exData['time'], exData['errY'], label="error Y")
plt.plot(exData['time'], exData['errZ'], label="error Z")
plt.legend(loc="lower right")
plt.xlabel("Waktu (sekon)")
plt.ylabel("Error Posisi (meter)")
# plt.ylim(-2.5, 2.5)
plt.savefig(folderName + "/"+ fileName + "Error")

# Plot Input Pengontrol U
plt.figure()
plt.title("Input Control U")
plt.plot(exData['time'], exData['ux'], label="input X")
plt.plot(exData['time'], exData['uy'], label="input Y")
plt.plot(exData['time'], exData['uz'], label="input Z")
plt.legend(loc="lower right")
plt.xlabel("Waktu (sekon)")
plt.ylabel("Input (meter)")
# plt.ylim(-2.5, 2.5)
plt.savefig(folderName + "/"+ fileName + "ControlU")

plt.show()
