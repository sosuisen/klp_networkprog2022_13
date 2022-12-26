const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const host = 'localhost';
const port = 8080;

const app = express();
// 本プログラムでは、Expressはstatic以下のファイルのGETにのみ用いています。
app.use(express.static('static'));

app.get(req => {
  console.log('url:' + req.baseUrl);
})

// ExpressとSocket.ioを同じポートで動作させる場合、
// http.createServerにappを渡して
// 生成されたhttp.Serverオブジェクトでlistenすること。
// app.listenは使いません
var server = http.createServer(app);
server.listen({ host, port }, () => {
  console.log(`Starting Express and Socket.io (websocket) server at http://${host}:${port}/`)
});

const io = new Server(server);

io.on('connection', socket => {
  console.log('a user connected');
})

/*
const members = {};
ws.on('connection', (socket, req) => {
  // （１）入室時の処理
  const ip = req.socket.remoteAddress;
  // ユーザ名を取得
  const urlArray = req.url.split('?');
  let userName = '';
  if (urlArray.length > 1) {
    userName = decodeURIComponent(urlArray[1]);
  }
  else {
    socket.terminate();
    return;
  }

  // メンバーを追加
  // 同じ名前のユーザが接続してきた場合には未対応
  members[userName] = 1;

  console.log(`[WebSocket] connected from ${userName} (${ip})`);
  // 全ての入室中のクライアントへ送信
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'enter',
        name: userName,
      }));
    }
  });


  // (2) メッセージ受信時の処理を追加
  socket.on('message', data => {
    console.log('[WebSocket] message from client: ' + data);
    const req = JSON.parse(data);
    
    // bot宛か？
    // 発展課題 12aに対応するには、まずbot宛かどうかを判定し、
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
        socket.send(JSON.stringify(req));
      }
      // bot の場合はここで終わり。
      return;
    }

    // bot宛でないメッセージの場合
    // 基本課題 12-1
    // 送信元のuserNameをnameプロパティを追加
    req.name = userName;
    // 全ての入室中のクライアントへ返信
    ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(req)); // JSON文字列に変換して送信
      }
    });
  });


  // (3) 退室時の処理を追加
  socket.on('close', () => {
    console.log(`[WebSocket] disconnected from ${userName} (${ip})`);

    // メンバーを削除
    // （クライアントの不正な切断による退室には未対応）
    delete members[userName];

    // 退室したクライアントを除く全ての入室中のクライアントへ送信
    ws.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'leave',
          name: userName,
        }));
      }
    });
  });
});
*/