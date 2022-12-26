let socket;
let userName = '';

// (2) 退室時のUIリセット
const resetUI = () => {
  document.getElementById('userName').disabled = false;
  document.getElementById('enterLeaveButton').innerText = '入室';
  document.getElementById('status').innerText = '[退室中]';  
};

const connect = () => {
  // (3) 接続処理
  // ユーザ名をクエリ文字列にセットして送信
  socket = new WebSocket('ws://localhost:8080/?' + encodeURIComponent(userName));
  socket.addEventListener('open', () => {
    document.getElementById('status').innerText = '[入室済]';
  });

  // (4) メッセージ受信時の処理を追加
  socket.addEventListener('message', msg => {
    const obj = JSON.parse(msg.data);
    if(obj.type === 'message') {
      document.getElementById('fromServer').innerHTML += `${obj.name}: ${obj.data}<br />`;
    }
    else if(obj.type === 'enter') {
      document.getElementById('fromServer').innerHTML += `${obj.name}が入室しました！<br />`;
    }
    else if(obj.type === 'leave') {
      document.getElementById('fromServer').innerHTML += `${obj.name}が退室しました！<br />`;
    }
  });  

  // (5) サーバから切断されたときの処理を追加
  socket.addEventListener('close', () => {
    if(socket !== null) {
      // サーバ側から切断された場合のみアラート表示
      alert('サーバから切断されました');
      socket = null;
      resetUI();
    }
  });
};

// (6) メッセージ送信処理
const sendMessage = () => {
  if (socket.readyState === WebSocket.OPEN) {
    const obj = {
      type: 'message',
      // 基本課題 12-1
      // ここで nameプロパティを追加してもよいが、通信量が増えてしまう欠点あり。
      // name: userName, 
      data: document.getElementById('fromClient').value,
    };
    socket.send(JSON.stringify(obj));
    document.getElementById('fromClient').value = '';
  }  
};

// Enterキーでメッセージ送信
document.getElementById('fromClient').addEventListener('change', sendMessage);

// (1) 入退室処理
const enterLeaveRoom = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    socket = null;
    resetUI();
  }
  else {
    userName = document.getElementById('userName').value;
    if (userName) {
      document.getElementById('userName').disabled = true;
      document.getElementById('enterLeaveButton').innerText = '退室';
      connect();
    }
 }
};

// 入室・退室ボタン
document.getElementById('enterLeaveButton').addEventListener('click', enterLeaveRoom);
