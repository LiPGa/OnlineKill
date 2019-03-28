const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;

let mainWindow;

function createWindow () {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 667,
        height: 375,
        maximizable: false,
        center: true,
        resizable: false,
        useContentSize: true});
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});