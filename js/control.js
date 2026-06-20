async function main(){
  // console.log(Misc);

  // temporary variable
  let temp = 0;

  // dynamic import for modules
  const Misc = await import("./misc.js");
  const CanvasMod = await import("./canvas.js");
  const AudioMod = await import("./audio.js");
  AudioMod.init();

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

  const GeneratorSliderObject = Misc.makeSliderObject(
    "GeneratorSlider",
    0,
    1,
    0.5850,
    0.0025,
    "Generator: "
  );
  MainInputsDiv.appendChild(GeneratorSliderObject.element)

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
    "id": "MainCanvas"
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
      if(O.display){
        O.resize();
      }
    });

    refresh();
  }

  const soundList = new Array();
  let baseFreq = 440.0

  function confSounds(xco, yco){
    let tempList = CanvasMod.getLogFreqsByCoord(
      GeneratorSliderObject.get(),
      xco,
      yco
    );
    tempList.sort();

    if(soundList.length==0){        
      Array.from(
         { length: tempList.length },
         (_, i) => AudioMod.getOsc(baseFreq*Math.pow(2, tempList[i]))
      ).forEach( (sound) => {
        soundList.push(sound);
        sound.start();
      });
    }else{
      let i=0;
      while(i<soundList.length){
        if(i<tempList.length){
          soundList[i].changeFreq(baseFreq*Math.pow(2, tempList[i]));
          i++;
        }else{
          soundList[i].stop();
          soundList.splice(i,1);
        }
      }
      while(i<tempList.length){
        let temp = AudioMod.getOsc(baseFreq*Math.pow(2, tempList[i]));
        soundList.push(temp);
        temp.start();
        i++;
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
  }

  MainCanvas.onmousedown = (ev) => {
    confSounds(ev.offsetX, ev.offsetY);
  }

  MainCanvas.onmousemove = (ev) => {
    refresh(ev);

    if(ev.buttons&1==1){
      confSounds(ev.offsetX, ev.offsetY);
    }else{
      delSounds();
    }
  }

  MainCanvas.onmouseup = (ev) => {
    delSounds();
  }

  MainCanvas.onmouseleave = (ev) => {
    refresh();
    delSounds();
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
        1,
        0.2500,
        0.0025,
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
          display: true,
          get: () => MarkerSliderObject.get()
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
