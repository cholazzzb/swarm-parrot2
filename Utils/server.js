import http from "http";
import * as socketIO from "socket.io";

const server = http.createServer();
const io = new socketIO.Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 4000;
const QUAD1_COMMAND = "QUAD1_COMMAND";
const QUAD2_COMMAND = "QUAD2_COMMAND";
const EVENT_LISTS = [QUAD1_COMMAND, QUAD2_COMMAND];

io.on("connection", (socket) => {
  // Join a conversation
  const { type } = socket.handshake.query;
  console.log(`Client type: ${type} -id:${socket.id} connected`);
  socket.join(type);

  // Listen for new messages
  EVENT_LISTS.forEach((EVENT) => {
    socket.on(EVENT, (data) => {
      io.in(type).emit(EVENT, data);
      console.log(`--- EMIT DATA ${EVENT} ---`);
      console.log(`Data, ${data}`);
    });
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log(`Client type: ${type} -id: ${socket.id} diconnected`);
    socket.leave(type);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
