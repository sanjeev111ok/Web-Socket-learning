import app from "./src/app"
import { envConfig } from "./src/config/config"
import connectToDb from "./src/config/db"
import { Server } from "socket.io"

let io: Server | undefined

function startServer() {
  connectToDb()
  const port = envConfig.port || 4000
  const server = app.listen(port, () => {
    console.log(`Server has started at port[${port}]`)
  })
  io = new Server(server)
}

function getSocketIo() {
  if (!io) {
    throw new Error("socket initialized bhako xaina")
  }
  return io
}
startServer()
export { getSocketIo }
