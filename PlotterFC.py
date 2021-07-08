import matplotlib.pyplot as plt
import sys

# Import Data
folderName = "./Data/Map1"
sys.path.append(folderName)
from FC import FC as exData

# Filename for saved figure
fileName = "FC"

'''
--- Format of exData ---
exData = Dictionary
exData = {
    "Quad1": {
        "time" =[],
        "xPos" =[],
        "yPos" =[],
        "zPos" =[],
        "yaw"  =[]
    },
    "Quad2": {
        "time" =[],
        "xPos" =[],
        "yPos" =[],
        "zPos" =[],
        "yaw"  =[]
    }
}
'''

# Plot Map
plt.figure()
plt.title("Peta Posisi")
plt.scatter(exData['Quad1']['xPos'], exData['Quad1']['yPos'], label="Quad1")
plt.scatter(exData['Quad2']['xPos'], exData['Quad2']['yPos'], label="Quad2")
for obstacle in exData['obstacles_position']:
    plt.scatter([obstacle[0]], [obstacle[1]], label="Obstacle")
for target in exData['targets_position']:
    plt.scatter([target[0]], [target[1]], label="Target")
plt.xlabel("Posisi X (meter)")
plt.ylabel("Posisi Y (meter)")
plt.legend(loc="upper left")
plt.savefig(folderName + "/" + fileName + "Map")

# Plot Distance between Quad
plt.figure()
plt.title("Jarak antar Quadrotor")
plt.plot(exData['distance_quads']['time'], exData['distance_quads']['distance'])
plt.xlabel("Waktu (sekon)")
plt.ylabel("Jarak (meter)")
# plt.ylim(-2.5, 2.5)
plt.savefig(folderName + "/" + fileName + "Distance")

# # Plot Error
# plt.figure()
# plt.title("Error X, Y, Z")
# plt.plot(exData['time'], exData['errX'], label="error X")
# plt.plot(exData['time'], exData['errY'], label="error Y")
# plt.plot(exData['time'], exData['errZ'], label="error Z")
# plt.legend(loc="lower right")
# plt.xlabel("Waktu (sekon)")
# plt.ylabel("Error Posisi (meter)")
# # plt.ylim(-2.5, 2.5)
# plt.savefig(folderName + "/" + fileName + "Error")

# # Plot Input Pengontrol U
# plt.figure()
# plt.title("Input Control U")
# plt.plot(exData['time'], exData['ux'], label="input X")
# plt.plot(exData['time'], exData['uy'], label="input Y")
# plt.plot(exData['time'], exData['uz'], label="input Z")
# plt.legend(loc="lower right")
# plt.xlabel("Waktu (sekon)")
# plt.ylabel("Input (meter)")
# # plt.ylim(-2.5, 2.5)
# plt.savefig(folderName + "/" + fileName + "ControlU")

plt.show()
