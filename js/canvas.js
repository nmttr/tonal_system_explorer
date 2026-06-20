const division = 16

let canvas = null;
let context = null;
let chordIdArray = null;
let chordObject = null;

export function getLogFreqsByCoord(gen, xco, yco){
  const start = canvas.width/8
  const end = canvas.width*7/8

  const indexNearMouse = Math.floor(division/window.innerHeight*yco)

  if(indexNearMouse>=chordIdArray.length) return [];

  if(xco <= start || end <= xco){
    return Array.from(
      { length: chordObject[chordIdArray[indexNearMouse]].length },
      (_, i) => chordObject[chordIdArray[indexNearMouse]][i].get(gen)
    );
  }else if(indexNearMouse < chordIdArray.length){
    const logScale = (xco-start)/(end-start)
    let left = 0
    let minv = 1
    let maxv = left

    chordObject[chordIdArray[indexNearMouse]].forEach( (f) => {
      let temp = f.get(gen)

      if(left < temp && temp <= logScale){ left = temp }

      if(temp < minv) { minv = temp }
      if(maxv < temp) { maxv = temp }
    });

    return [(left < minv)?(maxv-1):left];
  } 
}

export function writeCanvas(gen, mouseMoveEvent=null){
  canvas.width = window.innerWidth*3/4;
  canvas.height = window.innerHeight*chordIdArray.length/division;

  const start = canvas.width/8
  const end = canvas.width*7/8
  const delta = canvas.width*3/4

  context.reset();

  if(mouseMoveEvent!==null){
    // console.log(mouseMoveEvent);

    const xco = mouseMoveEvent.clientX;
    const yco = mouseMoveEvent.clientY;

    const indexNearMouse = Math.floor(division/window.innerHeight*yco)

    context.save();
    context.fillStyle = `rgb(255,0,0,0.5)`;

    let temp = window.innerHeight*indexNearMouse/division
    if(xco <= start || end <= xco){
      context.fillRect(
        0, temp,
        canvas.width/8, window.innerHeight/division
      );

      context.fillRect(
        canvas.width*7/8, temp,
        canvas.width/8, window.innerHeight/division
      );
    }else if(indexNearMouse < chordIdArray.length){
      let left = start
      let right = canvas.width*7/8
      let minv = right
      let maxv = left

      chordObject[chordIdArray[indexNearMouse]].forEach( (f) => {
        let temp = start+delta*f.get(gen)

        // if(mouseMoveEvent.buttons==1){ console.log([left, temp, xco, right]); }

        if(left < temp && temp <= xco){ left = temp }
        if(xco < temp && temp < right){ right = temp }

        if(temp < minv) { minv = temp }
        if(maxv < temp) { maxv = temp }
      });

      // if(mouseMoveEvent.buttons==1){ console.log([left, right]); }

      context.fillRect(
        left, temp,
        right-left, window.innerHeight/division
      );

      if(left < minv){
        context.fillRect(
          maxv, temp,
          canvas.width*7/8-maxv, window.innerHeight/division
        );
      }
      if(maxv < right){
        context.fillRect(
          start, temp,
          minv-start, window.innerHeight/division
        );
      }
    }
    context.restore();
  }

  context.beginPath();
  context.moveTo(start, 0);
  context.lineTo(start, canvas.height);  
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(end, 0);
  context.lineTo(end, canvas.height);  
  context.closePath();
  context.stroke();

  context.save()
  context.font = "20px serif";
  context.strokeStyle = `rgba(0 0 0 / 0.25)`

  for(let i=0; i<chordIdArray.length; i++){
    // writePointsOfChordId(gen, i, chordIdArray[i], chordObject[chordIdArray[i]]);

    let center = window.innerHeight*(2*i+1)/(2*division)

    context.fillText(String(chordIdArray[i]), start/2, center);

    chordObject[chordIdArray[i]].forEach( (f) => {
      let temp = start+delta*f.get(gen)

      context.beginPath()
      context.moveTo(temp, 0)
      context.lineTo(temp, canvas.height)
      context.closePath()
      context.stroke()

      context.fillText(String(f.name), temp, center);
    });
  }
  context.restore()
}

export function configureChord(fn, bn, ml, frp){
  let cAr = Array.from(
    {length: fn + bn + 2},
    (_, i) => i - bn - 1
  );

  let cOb = new Object();
  // every member of cOb should be an Object
  cAr.forEach((i) => {
    cOb[i] = [
      {
        name: i,
        get: (g) => frp( i*g )
      }, 
      {
        name: i+1,
        get: (g) => frp( (i+1)*g )
      },
      {
        name: i+cAr.length,
        get: (g) => frp( (i+cAr.length)*g )
      }
    ];

    ml.forEach( (elem, j) => {
      // console.log([i, g, elem.get(), j])
      if(elem.display){
        cOb[i].push(
          {
            name: "M" + String(j),
            get: (g) => { return frp( i*g + elem.get() ) }
          }
        );
      }
    });

    // cOb[i].forEach((e) => console.log([e.name, e.get()]));
  });

  [chordIdArray, chordObject] = [cAr, cOb]
}

export function initCanvas(cv){
  canvas = cv;
  context = cv.getContext('2d');
}