// import 'regenerator-runtime/runtime';
import EasySeeso from './seeso-minjs/easy-seeso.js';

const licenseKey = 'dev_pkxpmmwufa7sghpf3hzc9690979w19mdjvpam877';

function showGazeInfoOnDom (gazeInfo) {
    let gazeInfoDiv = document.getElementById("gazeInfo")
    gazeInfoDiv.innerText = `Gaze Information Below \nx: ${gazeInfo.x}\ny: ${gazeInfo.y}`
}

function hideGazeInfoDom () {
    let gazeInfoDiv = document.getElementById("gazeInfo");
    gazeInfoDiv.innerText = "";
}

function showGazeDotOnDom (gazeInfo) {
    let canvas = document.getElementById("output")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.clearRect(0, 0, canvas.width, canvas.height )
    ctx.beginPath();
    ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
    ctx.fill();
}

function hideGazeDotOnDom() {
    let canvas = document.getElementById("output");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
  
function showGaze(gazeInfo) {
    showGazeInfoOnDom(gazeInfo)
    showGazeDotOnDom(gazeInfo)
}
  
function hideGaze(){
    hideGazeInfoOnDom();
    hideGazeDotOnDom();
}
  
export { showGaze, hideGaze }