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
  
  HomeDiv.appendChild(MainVisualsDiv);
  HomeDiv.appendChild(MainInputsDiv);
  HomeDiv.appendChild(MarkersDiv);

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
  MainInputsDiv.appendChild(ButtonsForm);

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
      MarkerList,
      Misc.fractionPart
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
      xco,
      yco
    );
    // console.log([tempList, beforeLogFreqsList]);
    tempList.sort();

    if(soundList.length==0){        
      Array.from(
         { length: tempList.length },
         (_, i) => AudioMod.getOsc(baseFreq*Math.pow(2, tempList[i]))
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
          if(beforeLogFreqsList[j]!=tempList[j]){
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

  MainCanvas.onpointerdown = (ev) => {
    ev.preventDefault();
    refresh(ev);
    confSounds(ev.offsetX, ev.offsetY);
  }

  MainCanvas.addEventListener("pointermove", (ev) => {
    ev.preventDefault();

    refresh(ev);

    if(ev.buttons&1==1){
      confSounds(ev.offsetX, ev.offsetY);
    }else{
      delSounds();
    }
  }, { passive: false });

  MainCanvas.onpointerup = (ev) => {
    ev.preventDefault();
    refresh(ev);
    delSounds();
  }

  MainCanvas.onpointerleave = (ev) => {
    ev.preventDefault();
    refresh();
    delSounds();
  }

  MainCanvas.oncontextmenu = (ev) => {
    ev.preventDefault();
  }

  GeneratorSliderObject.element.oninput = (ev) =>{
    refresh();
  };
 
  FcnObject.element.oninput = (ev) =>{
    confChord();
    refresh();
  };

  BcnObject.element.oninput = (ev) =>{
    confChord();
    refresh();
  };

  DivisionNumberObject.element.oninput = (ev) => {
    let temp = DivisionNumberObject.get();

    GeneratorSliderObject.changeRange(temp);

    MarkerList.forEach( (O) => {
      O.changeRange(temp);
    });

    refresh();
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
  
      MarkerSliderObject.element.oninput = (ev) =>{
        refresh();
      };

      DeleteMarkerButton.onclick = (ev) => {
        // actually set display: none in form CSS
        MarkerList[markerId].display = false
        MarkerSliderObject.element.style = "display: none; ";    

        confChord();
        refresh();
      };
    }else{
      MarkerList[markerId].display = true
      document.getElementById("MarkerSlider" + String(markerId)).parentNode.style = "";    

      confChord();
      refresh();
    }

    // console.log(MarkerList)
  };
}

addEventListener("load", main);
