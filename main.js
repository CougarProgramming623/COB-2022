const { app, BrowserWindow, ipcMain } = require('electron')
const ipc = ipcMain;

let win;
function createWindow () {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      }
    })
  
    win.loadFile('src/index.html')
  }


  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

  app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  // wpilib stuff
const ntClient = require('wpilib-nt-client');
const client = new ntClient.Client();
client.setReconnectDelay(1000);

// Adds a listener to the client
client.addListener((key, val, type, id) => {
    console.log({ key, val, type, id });
})
let clientDataListener = (key, val, valType, mesgType, id, flags) => {
    if (val === 'true' || val === 'false') {
        val = val === 'true';
    }
    win.webContents.send(mesgType, {
        key,
        val,
        valType,
        id,
        flags
    });
  };
  
ipc.on('ready', (ev, mesg) => {
    console.log('NetworkTables is ready');

    // Remove old Listener
    client.removeListener(clientDataListener);

    // Add new listener with immediate callback
    client.addListener(clientDataListener, true);
});
// When the user chooses the address of the bot than try to connect
ipc.on('connect', (ev, address, port) => {
    let callback = (connected, err) => {
        try{
          win.webContents.send('connected', connected); //throws error ere
        } catch(e){ console.log(e) }
    };
    if (port) {
        client.start(callback, address, port);
    } else {
        client.start(callback, address);
        console.log("connecting to " + address)
    }
  });
  ipc.on('stop-connect', () => {
    client.stop()
  });
  ipc.on('add', (ev, mesg) => {
    client.Assign(mesg.val, mesg.key, (mesg.flags & 1) === 1);
  });
  ipc.on('update', (ev, mesg) => {
    client.Update(mesg.id, mesg.val);
  });
  ipc.on('delete', (ev, mesg) => {
    client.Delete(mesg.id)
  });
client.addListener(clientDataListener, true);
