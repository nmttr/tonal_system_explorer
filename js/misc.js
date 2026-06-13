export function setAttributesByObject(elem, obj){
  Object.entries(obj).forEach( ([key, value]) => {
      elem.setAttribute(key, value);
    }
  );
}

export function fractionPart(num){
  return num-Math.floor(num)
}