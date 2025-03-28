const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const config = require(path.join(__dirname, 'data', 'config.json'));

let mainWindow;

let portSelected = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault()
    //console.log(portList);
    for (let i = 0; i < portList.length; i++) {
      if (portList[i].portName == config.ports[portSelected]) {
        console.log(portList[i]);
        callback(portList[i].portId);
        return;
      }
    }
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    //mainWindow.loadURL("http://localhost:5173/");
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Riceve dati da Vue
ipcMain.on('ping', (event, arg) => {
  console.log('Ricevuto:', arg);
  event.reply('reply', 'Ciao da Electron!');
});
ipcMain.on('port', (event, arg) => {
  portSelected = arg;
  console.log('Selected Port:', arg);
  // event.reply('reply', 'Ciao da Electron!');
});
