const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const host = 'localhost';
const port = 8080;

const app = express();
// 本プログラムでは、Expressはstatic以下のファイルのGETにのみ用いています。
app.use(express.static('static'));

// ExpressとSocket.ioを同じポートで動作させる場合、
// http.createServerにappを渡して
// 生成されたhttp.Serverオブジェクトでlistenすること。
// app.listenは使いません
var server = http.createServer(app);
server.listen({ host, port }, () => {
  console.log(`Starting Express and Socket.io (websocket) server at http://${host}:${port}/`)
});

const io = new Server(server);

const members = {};
io.on('connection', socket => {
  // （１）入室時の処理
  const ip = socket.handshake.address;
  // 1-1) 入室したユーザの名前を取得
  const userName = socket.handshake.query.userName;
  if (userName === undefined || userName === "") {
    console.log('Disconnected: User name not found.');
    socket.disconnect(true);
    return;
  }

  // メンバーを追加
  // 同じ名前のユーザが接続してきた場合には未対応
  members[userName] = 1;

  console.log(`[WebSocket] connected from ${userName} (${ip})`);
  // 1-2) 全ての入室中のクライアントへ通知
  io.emit('chat message', {
    type: 'enter',
    name: userName,
  });

  // (2) メッセージ受信時の処理を追加
  socket.on('chat message', req => {
    console.log('[WebSocket] message from client: ' + JSON.stringify(req));
    
    // bot宛か？
    // まずbot宛かどうかを判定し、
    // その後、メッセージ本文の内容で分岐します。
    if (req.data.startsWith('@bot ')) {
      const cmdArray = req.data.split(' ');
      if (cmdArray.length > 1) {
        req.name = 'bot';
        const cmd = cmdArray[1];
        if (cmd === 'date') {
          req.data = Date();
        }
        else if (cmd === 'list') {
          req.data = '現在の入室者は ' + Object.keys(members).join(', ');
        }
        else {
          return;
        }
        // 送信元のクライアントにのみ返信
        socket.emit('chat message', req);
      }
      // bot の場合はここで終わり。
      return;
    }

    // bot宛でないメッセージの場合
    // 送信元のuserNameをnameプロパティを追加
    req.name = userName;
    // 全ての入室中のクライアントへ返信
    io.emit('chat message', req);
  });

  // (3) 退室時の処理を追加
  socket.on('disconnect', () => {
    console.log(`[WebSocket] disconnected from ${userName} (${ip})`);

    // メンバーを削除
    // （クライアントの不正な切断による退室には未対応）
    delete members[userName];

    // 退室したクライアントを除く全ての入室中のクライアントへ送信
    socket.broadcast.emit('chat message', {
      type: 'leave',
      name: userName,
    });
  });
});
