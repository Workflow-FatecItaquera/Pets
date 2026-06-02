import { io } from 'socket.io-client';
import { BACKEND_URI } from '@env';

const socket = io(BACKEND_URI, {
  transports: ['websocket'],
  autoConnect: true
});

export default socket;