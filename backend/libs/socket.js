
// socket.js
import { Server } from 'socket.io'

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)

    socket.on('join_user', userId => socket.join(`user_${userId}`))
    socket.on('join_delivery', agentId => socket.join(`delivery_${agentId}`))
    socket.on('join_restaurant', restId => socket.join(`restaurant_${restId}`))

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export { io }