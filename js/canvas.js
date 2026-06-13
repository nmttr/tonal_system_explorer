const division = 16

function initCanvas(cv, cvCtx, cAr, cOb){
  // console.log(cvCtx);
  // console.log([window.innerWidth, window.innerHeight])
  // console.log(cAr.length)

  cv.width = window.innerWidth*3/4;
  cv.height = window.innerHeight*cAr.length/division;

  cvCtx.reset();

  cvCtx.beginPath();
  cvCtx.moveTo(cv.width/8, 0);
  cvCtx.lineTo(cv.width/8, cv.height);  
  cvCtx.closePath();
  cvCtx.stroke();

  cvCtx.beginPath();
  cvCtx.moveTo(cv.width*7/8, 0);
  cvCtx.lineTo(cv.width*7/8, cv.height);  
  cvCtx.closePath();
  cvCtx.stroke();

  for(let i=0; i<cAr.length; i++){
    writePointsOfChordId(cv, cvCtx, i, cAr[i], cOb[cAr[i]]);
  }
}

function writePointsOfChordId(cv, ctx, location, chordId, freqs){
  let upperBound = window.innerHeight*(4*location+1)/(4*division)
  let lowerBound = window.innerHeight*(4*location+3)/(4*division)
  let center = window.innerHeight*(2*location+1)/(2*division)

  let start = cv.width/8
  let delta = cv.width*3/4

  ctx.clearRect(0, upperBound, ctx.canvas.width, lowerBound-upperBound)

  ctx.font = "20px serif";
  ctx.fillText(String(chordId), start/2, center);

  for(let i=0; i<freqs.length; i++){
    ctx.fillText(String(freqs[i].gen), start+delta*freqs[i].get(), center);
  }
}

function makeChord(g, f, b, frp){
  // these are not a number but a string!
  let fn = parseInt(f.value);
  let bn = parseInt(b.value);

  let cAr = Array.from(
    {length: fn + bn + 2},
    (_, i) => i - bn - 1
  );

  let cOb = new Object();
  // every member of cAr should be an Object
  cAr.forEach((i) =>
    cOb[i] = [
      {
        gen: i,
        get: () => frp( i*g.value )
      }, 
      {
        gen: i+1,
        get: () => frp( (i+1)*g.value )
      },
      {
        gen: i+cAr.length,
        get: () => frp( (i+cAr.length)*g.value )
      }
    ]
  );

  return [cAr, cOb]
}

export function configureCanvas(canvas, genOb, fcn, bcn, frp){
  // console.log(genOb);
  // console.log(fcn);
  // console.log(Misc);

  const context = canvas.getContext('2d');

  let [chordIdArray, chordObject] = makeChord(genOb.slider, fcn, bcn, frp);

  console.log(chordIdArray)
  console.log(chordObject)

  initCanvas(canvas, context, chordIdArray, chordObject);
  console.log(context);

  genOb.slider.oninput = (ev) =>{
    // console.log(genOb.slider.value);
    genOb.changeVal(ev);

    initCanvas(canvas, context, chordIdArray, chordObject);
  }

  fcn.onchange = (ev) =>{
    [chordIdArray, chordObject] = makeChord(genOb.slider, fcn, bcn, frp);

    initCanvas(canvas, context, chordIdArray, chordObject);
  }

  bcn.onchange = (ev) =>{
    [chordIdArray, chordObject] = makeChord(genOb.slider, fcn, bcn, frp);

    initCanvas(canvas, context, chordIdArray, chordObject);
  }
}