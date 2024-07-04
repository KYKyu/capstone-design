import EasySeeSo from '../node_modules/seeso/easy-seeso.js';

const seeso = new EasySeeSo();
seeso.startTracking(seeso.onGaze, seeso.onDebug)