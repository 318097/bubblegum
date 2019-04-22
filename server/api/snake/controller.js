exports.get = (req, res) => {
  res.socket.on('connection', (socket) => {
    console.log('A user connected');
  });
}