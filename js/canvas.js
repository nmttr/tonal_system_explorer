const division = 16

let canvas = null;
let context = null;
let chordIdArray = null;
let chordObject = null;

export function writeCanvas(gen){
  canvas.width = window.innerWidth*3/4;
  canvas.height = window.innerHeight*chordIdArray.length/division;

  context.reset();

  context.beginPath();
  context.moveTo(canvas.width/8, 0);
  context.lineTo(canvas.width/8, canvas.height);  
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(canvas.width*7/8, 0);
  context.lineTo(canvas.width*7/8, canvas.height);  
  context.closePath();
  context.stroke();

  for(let i=0; i<chordIdArray.length; i++){
    writePointsOfChordId(gen, i, chordIdArray[i], chordObject[chordIdArray[i]]);
  }
}

function writePointsOfChordId(gen, location, chordId, freqs){
  // let upperBound = window.innerHeight*(4*location+1)/(4*division)
  // let lowerBound = window.innerHeight*(4*location+3)/(4*division)
  let center = window.innerHeight*(2*location+1)/(2*division)

  let start = canvas.width/8
  let delta = canvas.width*3/4

  // ctx.clearRect(0, upperBound, canvas.width, lowerBound-upperBound)

  context.font = "20px serif";
  context.fillText(String(chordId), start/2, center);

  context.save()
  context.strokeStyle = `rgba(0 0 0 / 0.25)`
  freqs.forEach( (f) => {
    let temp = start+delta*f.get(gen)

    context.beginPath()
    context.moveTo(temp, 0)
    context.lineTo(temp, canvas.height)
    context.closePath()
    context.stroke()

    context.fillText(String(f.name), temp, center);
  });
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