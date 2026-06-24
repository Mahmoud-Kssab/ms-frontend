import { io, Socket } from 'socket.io-client';

import { env } from '@/constants/env';

let socket: Socket | null = null;

export function getSocketClient() {
  if (!socket) {
    socket = io(env.socketUrl, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  return socket;
}
