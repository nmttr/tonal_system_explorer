function makeSliderObject(sliderId, min, max, value, step, label, Misc){
  const form = document.createElement("form")

  const Slider = document.createElement("input");
  Misc.setAttributesByObject(Slider, 
    {
      "id": sliderId,
      "type": "range",
      "min": min,
      "max": max,
      "step": step,
      "style": "width: " + String(window.innerWidth/2) + "px;"
    }
  );
  Slider.value = value;

  // before Slider append label for it
  let beforeLabel = document.createElement("label")
  Misc.setAttributesByObject(beforeLabel, {
    "for": Slider.id
  });
  beforeLabel.innerText = label
  form.appendChild(beforeLabel);

  form.appendChild(Slider);

  // after Slider append value for it
  let afterLabel = document.createElement("label");
  Misc.setAttributesByObject(afterLabel, {
    "for": Slider.id
  });
  afterLabel.innerText = Slider.value
  form.appendChild(afterLabel);
  
  let cv = () => {
    afterLabel.innerText = Slider.value
  }
  return {changeVal: cv, element: form, slider: Slider}
}

async function main(){
  // console.log(Misc);

  // temporary variable
  let temp = 0;

  // dynamic import for modules
  const Misc = await import("./misc.js");
  const CanvasMod = await import("./canvas.js");

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

  const GeneratorSliderObject = makeSliderObject(
    "GeneratorSlider",
    0,
    1,
    0.5850,
    0.0025,
    "Generator: ",
    Misc
  );
  MainInputsDiv.appendChild(GeneratorSliderObject.element)

  const FcnForm = document.createElement("form")
  MainInputsDiv.appendChild(FcnForm)

  const ForwardChordNumber = document.createElement("input");
  Misc.setAttributesByObject(ForwardChordNumber, {
    "id": "ForwardChordNumber",
    "type": "number",
    "value": 1,
    "min": 0
  });

  temp = document.createElement("label");
  Misc.setAttributesByObject(temp, {
    "for": ForwardChordNumber.id
  });
  temp.innerText = "Forward: "
  FcnForm.appendChild(temp);

  FcnForm.appendChild(ForwardChordNumber);

  const BcnForm = document.createElement("form")
  MainInputsDiv.appendChild(BcnForm)

  const BackwardChordNumber = document.createElement("input");
  Misc.setAttributesByObject(BackwardChordNumber, {
    "id": "BackwardChordNumber",
    "type": "number",
    "value": 1,
    "min": 0
  });

  temp = document.createElement("label");
  Misc.setAttributesByObject(temp, {
    "for": BackwardChordNumber.id
  });
  temp.innerText = "Backward: "
  BcnForm.appendChild(temp);

  BcnForm.appendChild(BackwardChordNumber);

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
      parseInt(ForwardChordNumber.value),
      parseInt(BackwardChordNumber.value),
      MarkerList,
      Misc.fractionPart
    );
  }
  confChord();

  function refresh(event=null){
    CanvasMod.writeCanvas(
      Number(GeneratorSliderObject.slider.value),
      event
    );
  };
  refresh();

  window.onresize = (ev) => {
    Misc.setAttributesByObject(GeneratorSliderObject.slider, {
      "style": "width: " + String(window.innerWidth/2) + "px;"
    });

    MarkerList.forEach( (O) => {
      if(O.display){
        Misc.setAttributesByObject(O.slider, {
          "style": "width: " + String(window.innerWidth/2) + "px;"
        });
      }
    });

    refresh();
  }

  MainCanvas.onmousemove = (ev) => {
    refresh(ev);
  }

  GeneratorSliderObject.slider.oninput = (ev) =>{
    GeneratorSliderObject.changeVal();

    refresh();
  };
 
  ForwardChordNumber.onchange = (ev) =>{
    confChord();
    refresh();
  };

  BackwardChordNumber.onchange = (ev) =>{
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

      let MarkerSliderObject = makeSliderObject(
        "MarkerSlider" + String(markerId),
        0,
        1,
        0.2500,
        0.0025,
        "Marker" + String(markerId) + ": ",
        Misc
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
          get: () => Number(MarkerSliderObject.slider.value),
          slider: MarkerSliderObject.slider
        }
      );

      confChord();
      refresh();
  
      MarkerSliderObject.slider.oninput = (ev) =>{
        MarkerSliderObject.changeVal();

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
