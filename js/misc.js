export function setAttributesByObject(elem, obj){
  Object.entries(obj).forEach( ([key, value]) => {
      elem.setAttribute(key, value);
    }
  );
}

export function makeSliderObject(sliderId, min, max, value, step, label){
  const form = document.createElement("form")

  const slider = document.createElement("input");
  setAttributesByObject(slider, 
    {
      "id": sliderId,
      "type": "range",
      "min": min,
      "max": max,
      "step": step,
      "style": "width: " + String(window.innerWidth/2) + "px;"
    }
  );
  slider.value = value;

  // before slider append label for it
  let beforeLabel = document.createElement("label");
  setAttributesByObject(beforeLabel, {
    "for": slider.id
  });
  beforeLabel.innerText = label;
  form.appendChild(beforeLabel);

  form.appendChild(slider);

  // after Slider append value for it
  let afterLabel = document.createElement("label");
  setAttributesByObject(afterLabel, {
    "for": slider.id
  });
  afterLabel.innerText = slider.value;
  form.appendChild(afterLabel);
  
  slider.oninput = () => {
    afterLabel.innerText = slider.value;
  }

  let gv = () => {
    return Number(slider.value);
  }

  let rsz = () => {
    Misc.setAttributesByObject(slider, {
      "style": "width: " + String(window.innerWidth/2) + "px;"
    });
  }
  return {element: form, get: gv, resize: rsz};
}

export function makeNumberInput(numberId, defval, minval, label){
  const form = document.createElement("form")

  const numberInput = document.createElement("input");
  setAttributesByObject(numberInput, {
    "id": numberId,
    "type": "number",
    "min": minval
  });
  numberInput.value = defval;

  let temp = document.createElement("label");
  setAttributesByObject(temp, {
    "for": numberInput.id
  });
  temp.innerText = label
  form.appendChild(temp);

  form.appendChild(numberInput);

  let gv = () => {
    return parseInt(numberInput.value);
  }
  return {element: form, get: gv}
}

export function fractionPart(num){
  return num-Math.floor(num)
}