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
  // let upperBound = window.innerHeight*(4*location+1)/(4*division)
  // let lowerBound = window.innerHeight*(4*location+3)/(4*division)
  let center = window.innerHeight*(2*location+1)/(2*division)

  let start = cv.width/8
  let delta = cv.width*3/4

  // ctx.clearRect(0, upperBound, ctx.canvas.width, lowerBound-upperBound)

  ctx.font = "20px serif";
  ctx.fillText(String(chordId), start/2, center);

  ctx.save()
  ctx.strokeStyle = `rgba(0 0 0 / 0.25)`
  freqs.forEach( (f) => {
    let temp = start+delta*f.get()

    ctx.beginPath()
    ctx.moveTo(temp, 0)
    ctx.lineTo(temp, cv.height)
    ctx.closePath()
    ctx.stroke()

    ctx.fillText(String(f.name), start+delta*f.get(), center);
  });
  ctx.restore()
}

function makeChord(g, fn, bn, ml, frp){
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
        get: () => frp( i*g )
      }, 
      {
        name: i+1,
        get: () => frp( (i+1)*g )
      },
      {
        name: i+cAr.length,
        get: () => frp( (i+cAr.length)*g )
      }
    ];

    ml.forEach( (elem, j) => {
      // console.log([i, g, elem.get(), j])
      if(elem.display){
        cOb[i].push(
          {
            name: "M" + String(j),
            get: () => { return frp( i*g + elem.get() ) }
          }
        );
      }
    });

    // cOb[i].forEach((e) => console.log([e.name, e.get()]));
  });

  return [cAr, cOb]
}

export function configureCanvas(canvas, gen, fcn, bcn, mkl, frp){
  // console.log(gen);
  // console.log(fcn);

  const context = canvas.getContext('2d');

  let [chordIdArray, chordObject] = makeChord(gen, fcn, bcn, mkl, frp);

  // console.log(chordIdArray)
  // console.log(chordObject)

  writeCanvas(canvas, context, chordIdArray, chordObject);
  // console.log(context);
}