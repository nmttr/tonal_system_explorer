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

  // defining here to refer later
  let gv = (isRaw=false) => {
    return isRaw?slider.valueAsNumber:slider.valueAsNumber/(Number(slider.max) - Number(slider.min));
  }

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
  // in percentage
  afterLabel.innerText = gv(true) + " : " + gv().toFixed(5);
  form.appendChild(afterLabel);

  let minusButton = document.createElement("input");
  setAttributesByObject(minusButton, {
    "type": "button",
    "value": "-" + String(slider.step)
  });
  form.appendChild(minusButton);

  let plusButton = document.createElement("input");
  setAttributesByObject(plusButton, {
    "type": "button",
    "value": "+" + String(slider.step)
  });
  form.appendChild(plusButton);

  let cr = (newmax, newmin=0, preventInput=true) => {
    let temp = gv();
    let newdefval = Math.floor(temp*(newmax - newmin)+0.5);

    setAttributesByObject(slider, 
      {
        "min": newmin,
        "max": newmax
      }
    );
    slider.value = newdefval;
    if(preventInput){
      afterLabel.innerText = gv(true) + " : " + gv().toFixed(5);
    }else{
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  let rsz = () => {
    setAttributesByObject(slider, {
      "style": "width: " + String(window.innerWidth/2) + "px;"
    });
  }

  slider.oninput = () => {
    afterLabel.innerText = gv(true) + " : " + gv().toFixed(5);
  }

  plusButton.onclick = () => {
    slider.value = slider.valueAsNumber + Number(slider.step);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  minusButton.onclick = () => {
    slider.value = slider.valueAsNumber - Number(slider.step);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return {changeRange: cr, element: form, get: gv, resize: rsz};
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

  let minusButton = document.createElement("input");
  setAttributesByObject(minusButton, {
    "type": "button",
    "value": "-1"
  });
  form.appendChild(minusButton);

  let plusButton = document.createElement("input");
  setAttributesByObject(plusButton, {
    "type": "button",
    "value": "+1"
  });
  form.appendChild(plusButton);

  form.onsubmit = (ev) => { ev.preventDefault(); }

  plusButton.onclick = () => {
    numberInput.value = numberInput.valueAsNumber + 1;
    numberInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  minusButton.onclick = () => {
    numberInput.value = numberInput.valueAsNumber - 1;
    numberInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return {element: form, get: gv}
}