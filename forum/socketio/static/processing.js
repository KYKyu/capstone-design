const { spawn } = require('child_process');

function word_proc(x, y) {
    console.log("before calling");
    const capResult = spawn('python', ['processing.py']);
    capResult.stdout.on('data', function(data) {
        console.log(data.toString());
    })
    console.log("after calling");
}
export { word_proc }