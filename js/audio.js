let context = null;
let compressor = null;

export function getOsc(freq, type='triangle'){
  const osc = context.createOscillator();
  const gainNode = context.createGain();

  let now1 = context.currentTime;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now1);
  gainNode.gain.setValueAtTime(0.0, now1);

  osc.connect(gainNode);
  gainNode.connect(compressor);

  let isPlaying = false;

  let start = () => {
    if(isPlaying) return;

    let now2 = context.currentTime
    gainNode.gain.cancelScheduledValues(now2);
    gainNode.gain.setValueAtTime(0.0, now2);
    gainNode.gain.linearRampToValueAtTime(0.9, now2 + 0.05);

    osc.start();
    isPlaying = true;
  };

  let changeFreq = (newFreq) => {
    if(!isPlaying) return;

    osc.frequency.setTargetAtTime(newFreq, context.currentTime, 0.05);
  };

  let stop = () => {
    if(!isPlaying) return;

    let now3 = context.currentTime;

    gainNode.gain.cancelScheduledValues(now3);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now3);
    gainNode.gain.linearRampToValueAtTime(0, now3 + 0.15);

    osc.stop(now3 + 0.15);
    isPlaying = false;
  }

  osc.onended = (ev) => {
    gainNode.disconnect();
    osc.disconnect();
  }

  return {start: start, changeFreq: changeFreq, stop: stop}
}

export async function init(){
  if(!context){
    context = new (window.AudioContext || window.webkitAudioContext)();
  }

  if(!compressor){
    compressor = context.createDynamicsCompressor();

    let now = context.currentTime;

    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(20, now);
    compressor.ratio.setValueAtTime(4, now);
    compressor.attack.setValueAtTime(0.01, now);
    compressor.release.setValueAtTime(0.25, now);

    compressor.connect(context.destination);
  }

  if(context.state === 'suspended'){ 
    context.resume();
    console.log("end");
  }
}