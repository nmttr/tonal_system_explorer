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
  Slider.value = value

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
  
  let cv = (ev) => {
    afterLabel.innerText = Slider.value
  }
  return {changeVal: cv, element: form, slider: Slider}
}

function init(Misc){
  // console.log(Misc);

  // temporary variable
  let temp = 0;

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
    0.5800,
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

  const ButtonsForm = document.createElement("form")
  MainInputsDiv.appendChild(ButtonsForm)

  // make AddMarkerButton and DeleteMarkerButton
  const AddMarkerButton = document.createElement("input");
  Misc.setAttributesByObject(AddMarkerButton, {
    "type": "button",
    "value": "add marker"
  });
  ButtonsForm.appendChild(AddMarkerButton)

  const DeleteMarkerButton = document.createElement("input");
  Misc.setAttributesByObject(DeleteMarkerButton, {
    "type": "button",
    "value": "delete marker"
  });
  ButtonsForm.appendChild(DeleteMarkerButton)

  // make canvas
  const MainCanvas = document.createElement("canvas");
  Misc.setAttributesByObject(MainCanvas, {
    "id": "MainCanvas"
  });
  MainCanvas.innerText = "no canvas element!"
  MainVisualsDiv.appendChild(MainCanvas);

  // use canvas.js module for changing MainCanvas
  import("./canvas.js").then( (module) => {
    module.configureCanvas(
      MainCanvas,
      GeneratorSliderObject,
      ForwardChordNumber,
      BackwardChordNumber,
      Misc.fractionPart
    );
  });
}

function main(){
  // console.log("start to execute main");

  import("./misc.js").then( (module) => {
    init(module);
  });

  // console.log("end executing main")
}

addEventListener("load", main);
