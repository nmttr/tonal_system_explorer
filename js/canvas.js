const division = 16

function writeCanvas(cv, cvCtx, cAr, cOb){
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

  // ctx.clearRect(0, upperBound, ctx.canvas.width, lowerBound-upperBound)

  ctx.font = "20px serif";
  ctx.fillText(String(chordId), start/2, center);

  for(let i=0; i<freqs.length; i++){
    ctx.fillText(String(freqs[i].gen), start+delta*freqs[i].get(), center);
  }
}

function makeChord(g, fn, bn, frp){
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
        get: () => frp( i*g )
      }, 
      {
        gen: i+1,
        get: () => frp( (i+1)*g )
      },
      {
        gen: i+cAr.length,
        get: () => frp( (i+cAr.length)*g )
      }
    ]
  );

  return [cAr, cOb]
}

export function configureCanvas(canvas, gen, fcn, bcn, frp){
  // console.log(gen);
  // console.log(fcn);

  const context = canvas.getContext('2d');

  let [chordIdArray, chordObject] = makeChord(gen, fcn, bcn, frp);

  // console.log(chordIdArray)
  // console.log(chordObject)

  writeCanvas(canvas, context, chordIdArray, chordObject);
  // console.log(context);
}