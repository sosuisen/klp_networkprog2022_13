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
  // ユーザ名をセットして送信
  socket = io('ws://localhost:8080/', {
    query: {
      userName
    },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', socket => {
    document.getElementById('status').innerText = '[入室済]';
  });

  // (4) メッセージ受信時の処理を追加
  socket.on('chat message', obj => {
    if (obj.type === 'message') {
      document.getElementById('fromServer').innerHTML += `${obj.name}: ${obj.data}<br />`;
    }
    else if (obj.type === 'enter') {
      document.getElementById('fromServer').innerHTML += `${obj.name}が入室しました！<br />`;
    }
    else if (obj.type === 'leave') {
      document.getElementById('fromServer').innerHTML += `${obj.name}が退室しました！<br />`;
    }
  });

  // (5) サーバから切断されたときの処理を追加
  socket.on('disconnect', reason => {
    console.log('Disconnected: ' + reason);
    if (reason === 'io server disconnect') {
      // サーバ側から切断された場合のみアラート表示
      alert('サーバから切断されました');
      socket = null;
      resetUI();
      return;
    }
    console.log('切断: ' + Date());
  });

  // 再接続を試行
  socket.io.on("reconnect_attempt", () => {
    console.log('再接続試行: ' + Date());
  });

  // 試行の失敗
  socket.io.on("reconnect_error", () => {
    console.log('試行失敗: ' + Date());
  });

  // 指定数の再接続に失敗したときの処理
  socket.io.on('reconnect_failed', function() {
    alert('サーバへ接続できません');
    socket = null;
    resetUI();
  }); 
};

// (6) メッセージ送信処理
const sendMessage = () => {
  socket.emit('chat message', {
    type: 'message',
    data: document.getElementById('fromClient').value,
  });
  document.getElementById('fromClient').value = '';
};

// Enterキーでメッセージ送信
document.getElementById('fromClient').addEventListener('change', sendMessage);

// (1) 入退室処理
const enterLeaveRoom = () => {
  if (socket && !socket.disconnected) {
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
