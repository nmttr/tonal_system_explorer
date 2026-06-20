let context = null;
let compressor = null;

export function getOsc(freq, type='triangle'){
  const osc = context.createOscillator();
  const gainNode = context.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, context.currentTime);

  osc.connect(gainNode);
  gainNode.connect(compressor);

  let isPlaying = false;

  let start = () => {
    if(isPlaying) return;

    osc.start();
    isPlaying = true;
  };

  let changeFreq = (newFreq) => {
    if(!isPlaying) return;

    osc.frequency.setTargetAtTime(newFreq, context.currentTime, 0.05);
  };

  let stop = () => {
    if(!isPlaying) return;

    let now = context.currentTime;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

    osc.stop(now + 0.15);
    isPlaying = false;
  }

  osc.onended = (ev) => {
    gainNode.disconnect();
    osc.disconnect();
  }

  return {start: start, changeFreq: changeFreq, stop: stop}
}

export function init(){
  if(!context){
    context = new window.AudioContext();

    compressor = context.createDynamicsCompressor();

    let now = context.currentTime;

    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(20, now);
    compressor.ratio.setValueAtTime(4, now);
    compressor.attack.setValueAtTime(0.01, now);
    compressor.release.setValueAtTime(0.25, now);

    compressor.connect(context.destination);
  }
}