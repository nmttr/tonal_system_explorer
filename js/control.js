async function main(){
  // console.log(Misc);

  // temporary variable
  let temp = 0;

  // dynamic import for modules
  const Misc = await import("./misc.js");
  const CanvasMod = await import("./canvas.js");
  const AudioMod = await import("./audio.js");
  await AudioMod.init();

  const HomeDiv = document.getElementById("HomeForControl.js");

  const StatusDiv = document.createElement("div");

  const MainVisualsDiv = document.createElement("div");
  Misc.setAttributesByObject(MainVisualsDiv, {
   "id": "MainVisuals"
  });

  const MainInputsDiv = document.createElement("div");
  Misc.setAttributesByObject(MainInputsDiv, {
    "id": "MainInputs"
  });

  const MarkersDiv = document.createElement("div");
  Misc.setAttributesByObject(MarkersDiv, {
    "id": "Markers"
  });
  
  HomeDiv.appendChild(StatusDiv);
  HomeDiv.appendChild(MainInputsDiv);
  HomeDiv.appendChild(MainVisualsDiv);
  HomeDiv.appendChild(MarkersDiv);

  const ChordStatusDiv = document.createElement("div");
  Misc.setAttributesByObject(ChordStatusDiv, {
    "id": "ChordStatus"
  });
  ChordStatusDiv.innerText = "chord: not focused";
  StatusDiv.appendChild(ChordStatusDiv);

  const ParameterStatusDiv = document.createElement("div");
  Misc.setAttributesByObject(ParameterStatusDiv, {
    "id": "ParameterStatus"
  });
  StatusDiv.appendChild(ParameterStatusDiv);

  const AudioStatusDiv = document.createElement("div");
  Misc.setAttributesByObject(AudioStatusDiv, {
    "id": "SystemStatus"
  });
  StatusDiv.appendChild(AudioStatusDiv);

  const FcnObject = Misc.makeNumberInput(
    "ForwardChordNumber",
    1,
    0,
    "Forward: "
  );
  MainInputsDiv.appendChild(FcnObject.element)

  const BcnObject = Misc.makeNumberInput(
    "BackwardChordNumber",
    1,
    0,
    "Backward: "
  );
  MainInputsDiv.appendChild(BcnObject.element)

  const DivisionNumberObject = Misc.makeNumberInput(
    "DivisionNumber",
    12,
    1,
    "Division of Octave: "
  );
  MainInputsDiv.appendChild(DivisionNumberObject.element)

  const GeneratorSliderObject = Misc.makeSliderObject(
    "GeneratorSlider",
    0,
    DivisionNumberObject.get(),
    7,
    1,
    "Generator: "
  );
  MainInputsDiv.appendChild(GeneratorSliderObject.element)

  const ButtonsForm = document.createElement("form");
  MarkersDiv.appendChild(ButtonsForm);

  // make AddMarkerButton
  const AddMarkerButton = document.createElement("input");
  Misc.setAttributesByObject(AddMarkerButton, {
    "type": "button",
    "value": "add marker"
  });
  ButtonsForm.appendChild(AddMarkerButton);

  // make MarkerList
  let MarkerList = new Array();

  // make canvas
  const MainCanvas = document.createElement("canvas");
  Misc.setAttributesByObject(MainCanvas, {
    "id": "MainCanvas",
    "style": "-webkit-user-select: none; user-select: none; touch-action: none;"
  });
  MainCanvas.innerText = "no canvas element!"
  MainVisualsDiv.appendChild(MainCanvas);

  // use canvas.js module for changing MainCanvas
  CanvasMod.initCanvas(MainCanvas);

  // wrapping to make edit easy
  function confChord(){
    CanvasMod.configureChord(
      FcnObject.get(),
      BcnObject.get(),
      DivisionNumberObject.get(),
      MarkerList
    );
  }
  confChord();

  function refresh(event=null){
    CanvasMod.writeCanvas(
      GeneratorSliderObject.get(),
      event
    );
  };
  refresh();

  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){
      AudioMod.suspend();
      // console.log("suspended");
    }else{
      AudioMod.resume();
      // console.log("resumed");
    }
    changeParameterStatus();
    changeAudioStatus();
  });

  window.onresize = (ev) => {
    GeneratorSliderObject.resize();

    MarkerList.forEach( (O) => {
      O.resize();
    });

    refresh();
  }

  let baseFreq = 440.0

  const soundList = new Array();
  let beforeLogFreqsList = new Array();
  function confSounds(xco, yco){
    let tempList = CanvasMod.getLogFreqsByCoord(
      GeneratorSliderObject.get(),
      GeneratorSliderObject.get(true),
      DivisionNumberObject.get(),
      xco,
      yco
    );
    // console.log([tempList, beforeLogFreqsList]);
    tempList.sort();

    if(soundList.length==0){        
      Array.from(
         { length: tempList.length },
         (_, i) => AudioMod.getOsc(baseFreq*Math.pow(2, tempList[i][0]))
      ).forEach( (sound) => {
        soundList.push(sound);
        sound.start();
      });

      beforeLogFreqsList = tempList;
    }else{
      let flag = false;
      if(beforeLogFreqsList.length != tempList.length){
        flag = true;
      }else{
        for(let j=0; j<tempList.length; j++){
          if(beforeLogFreqsList[j][0]!=tempList[j][0]
            && beforeLogFreqsList[j][1]!=tempList[j][1]){
            flag = true;
            break;
          }
        }
      }
      if(flag){
        delSounds();
        confSounds(xco, yco);
      }
    }
  }

  function delSounds(){
    soundList.forEach( (sound) => {
      sound.stop();
    });
    while(soundList.length>0){
      soundList.pop();
    }
    beforeLogFreqsList = new Array();
  }

  function changeChordStatus(){
    let result = "chord: ";
    if(beforeLogFreqsList.length===0){
      result += "not focused";
    }else{
      result += "[ ";
      beforeLogFreqsList.forEach( (logFreq, index) => {
        result += index===0?"":", ";
        result += String(logFreq[1]) + " : " + logFreq[0].toFixed(5);
      });
      result += " ]";
    }
    ChordStatusDiv.innerText = result
  }

  function changeParameterStatus(){
    let result = [
      FcnObject.get(), 
      BcnObject.get(), 
      DivisionNumberObject.get(),
      GeneratorSliderObject.get(true)
    ];
    let temp = [];
    MarkerList.forEach( (O) => {
      if(O.display) temp.push(O.get(true));
    });
    result.push(temp);
    ParameterStatusDiv.innerText = "Parameter: " + JSON.stringify(result)
  }
  changeParameterStatus();

  function changeAudioStatus(){
    AudioStatusDiv.innerText = "audioContext: " + AudioMod.contextState();
    if(navigator.audioSession){
      AudioStatusDiv.innerText += 
        ", AudioSessionType: " + navigator.audioSession.type
    }
  }
  changeAudioStatus();

  MainCanvas.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    refresh(ev);
    confSounds(ev.offsetX, ev.offsetY);
    changeChordStatus();
    changeAudioStatus();
  }, { passive: false });

  MainCanvas.addEventListener("pointermove", (ev) => {
    ev.preventDefault();

    refresh(ev);

    if(ev.buttons&1==1){
      confSounds(ev.offsetX, ev.offsetY);
    }else{
      delSounds();
    }
    changeChordStatus();
    changeAudioStatus();
  }, { passive: false });

  MainCanvas.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    refresh(ev);
    delSounds();
    changeChordStatus();
    changeAudioStatus();
  }, { passive: false });

  MainCanvas.addEventListener("pointerleave", (ev) => {
    ev.preventDefault();
    refresh();
    delSounds();
    changeChordStatus();
    changeAudioStatus();
  }, { passive: false });

  MainCanvas.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
  }, { passive: false });

  GeneratorSliderObject.element.oninput = (ev) =>{
    refresh();
    changeParameterStatus();
  };
 
  FcnObject.element.oninput = (ev) =>{
    confChord();
    refresh();
    changeParameterStatus();
  };

  BcnObject.element.oninput = (ev) =>{
    confChord();
    refresh();
    changeParameterStatus();
  };

  DivisionNumberObject.element.oninput = (ev) => {
    let temp = DivisionNumberObject.get();

    GeneratorSliderObject.changeRange(temp);

    MarkerList.forEach( (O) => {
      O.changeRange(temp);
    });

    refresh();
    changeParameterStatus();
  };

  AddMarkerButton.onclick = (ev) => {
    let markerId = MarkerList.findIndex( 
      (elem) => elem.display === false
    );

    // console.log(markerId)
    if(markerId === -1){ 
      markerId = MarkerList.length

      let MarkerSliderObject = Misc.makeSliderObject(
        "MarkerSlider" + String(markerId),
        0,
        DivisionNumberObject.get(),
        Math.floor(DivisionNumberObject.get()/4),
        1,
        "Marker" + String(markerId) + ": "
      ); 

      let DeleteMarkerButton = document.createElement("input");
      Misc.setAttributesByObject(DeleteMarkerButton, {
        "type": "button",
        "value": "delete this"
      });
      MarkerSliderObject.element.appendChild(DeleteMarkerButton);

      MarkersDiv.appendChild(MarkerSliderObject.element);
      MarkerList.push(
        {
          changeRange: MarkerSliderObject.changeRange,
          display: true,
          get: MarkerSliderObject.get,
          resize: MarkerSliderObject.resize
        }
      );

      confChord();
      refresh();
      changeParameterStatus();
  
      MarkerSliderObject.element.oninput = (ev) =>{
        refresh();
        changeParameterStatus();
      };

      DeleteMarkerButton.onclick = (ev) => {
        // actually set display: none in form CSS
        MarkerList[markerId].display = false
        MarkerSliderObject.element.style = "display: none; ";    

        confChord();
        refresh();
        changeParameterStatus();
      };
    }else{
      MarkerList[markerId].display = true
      document.getElementById("MarkerSlider" + String(markerId)).parentNode.style = "";    

      confChord();
      refresh();
      changeParameterStatus();
    }

    // console.log(MarkerList)
  };
}

addEventListener("load", main);
