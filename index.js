/* global $fx preloadImagesTmr fxhash fxrand fxpreview */

//
//  fxhash - Flying Pigs
//
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

// Global values, because today I'm being an artist not an engineer!
const ratio = 1 // canvas ratio
const features = {} //  so we can keep track of what we're doing
let nextFrame = null // requestAnimationFrame, and the ability to clear it
let resizeTmr = null // a timer to make sure we don't resize too often
let highRes = false // display high or low res
let drawStarted = false // Flag if we have kicked off the draw loop
let thumbnailTaken = false
let forceDownloaded = false
const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams.entries())
const prefix = 'flying-pigs'
// dumpOutputs will be set to false unless we have ?dumpOutputs=true in the URL
const dumpOutputs = urlParams.dumpOutputs === 'true'

const startTime = new Date().getTime()
let lastTime = startTime

window.$fxhashFeatures = {}

const pig = '001000010000000001111111110000001233332221000013333333222100013333333322100555553333333110545453333333101555553322233100013333222223100001111111111000000101000101000'

const bodies = {
  classic: [null, 'e36291', 'f082aa', 'f099b8', 'bf3d6d', 'e36291'],
  wild: [null, '5d4037', '795548', 'a1887f', '3e2723', '5d4037'],
  water: [null, '1976d2', '2196f3', '64b5f6', '0d47a1', '1976d2'],
  mono: [null, '7f7f7f', 'a1a1a1', 'c3c3c3', '616161', '7f7f7f'],
  gold: [null, 'ffd600', 'ffea00', 'ffff00', 'e0bb03', 'ffd600'],
  frog: [null, '388e3c', '4caf50', '81c784', '2e7d32', '388e3c'],
  farm: [null, 'c68642', 'eac086', 'ffdbac', '8d5524', 'c68642'],
  designer: [null, '9799ba', 'bc85a3', 'feadb9', '006291', '9799ba'],
  cow: [null, '212121', '000000', 'ffffff', '000000', 'f26f9b'],
  bush: [null, '5d4037', '212121', '795548', '212121', '5d4037'],
  bubblegum: [null, 'ab47bc', 'ba68c8', 'ce93d8', '8e24aa', 'ab47bc'],
  blood: [null, 'd32f2f', 'e53935', 'ef5350', 'b71c1c', 'd32f2f']
}
const eyes = {
  blue: '00a2e8',
  green: '1ee656',
  red: 'ed1c24',
  yellow: 'ffc90e',
  black: '000000'
}
const pigs = [
  [bodies.wild, eyes.blue],
  [bodies.classic, eyes.green],
  [bodies.water, eyes.green],
  [bodies.blood, eyes.black],
  [bodies.gold, eyes.green],
  [bodies.gold, eyes.blue],
  [bodies.mono, eyes.yellow],
  [bodies.designer, eyes.yellow],
  [bodies.mono, eyes.black],
  [bodies.classic, eyes.black],
  [bodies.frog, eyes.red],
  [bodies.mono, eyes.black],
  [bodies.classic, eyes.yellow],
  [bodies.classic, eyes.red],
  [bodies.bubblegum, eyes.black],
  [bodies.blood, eyes.green],
  [bodies.mono, eyes.blue],
  [bodies.gold, eyes.black],
  [bodies.mono, eyes.blue],
  [bodies.blood, eyes.red],
  [bodies.cow, eyes.black],
  [bodies.bush, eyes.yellow],
  [bodies.bush, eyes.red],
  [bodies.wild, eyes.black],
  [bodies.frog, eyes.yellow],
  [bodies.blood, eyes.black],
  [bodies.farm, eyes.black],
  [bodies.classic, eyes.red],
  [bodies.frog, eyes.black],
  [bodies.designer, eyes.black],
  [bodies.bush, eyes.yellow],
  [bodies.water, eyes.yellow],
  [bodies.wild, eyes.black]
]
const sourceCloud = [
  -0.3, -0.05, 0.15,
  -0.1, -0.1, 0.12,
  -0.1, 0, 0.12,
  0.1, 0, 0.1,
  0.05, -0.05, 0.1,
  0.2, 0, 0.075
]

//  Work out what all our features are
const makeFeatures = () => {
  features.backgroundColour = '#5EDDEB'
  features.pigs = []
  // Now we want to set the position of 33 pigs
  for (let p = 0; p < 33; p++) {
    const thisPig = {
      index: p,
      x: fxrand() * 2 - 0.5,
      y: fxrand() * 0.5 + 0.25,
      amplitude: fxrand() * 0.7 + 0.15,
      timeStartOffset: fxrand() * 10000 + 10000,
      speed: fxrand() * 1000 + 1500
    }
    features.pigs.push(thisPig)
  }

  features.clouds = []
  // Now we want to set some clouds
  // First level
  for (let c = 0; c < 8; c++) {
    const thisCloud = {
      index: c,
      x: fxrand() * 4 - 2,
      y: 0.5 + (fxrand() * 0.2) - 0.1,
      size: 0.666,
      speed: 0.1 + (fxrand() * 0.05)
    }
    features.clouds.push(thisCloud)
  }

  for (let c = 0; c < 4; c++) {
    const thisCloud = {
      index: c,
      x: fxrand() * 3 - 1,
      y: 0.35 + (fxrand() * 0.2) - 0.1,
      size: 1,
      speed: 0.2 + (fxrand() * 0.075)
    }
    features.clouds.push(thisCloud)
  }

  for (let c = 0; c < 2; c++) {
    const thisCloud = {
      index: c,
      x: fxrand() * 3 - 1,
      y: 0.2 + (fxrand() * 0.2) - 0.1,
      size: 2,
      speed: 0.3 + (fxrand() * 0.1)
    }
    features.clouds.push(thisCloud)
  }
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()

const drawPig = (index, x, y, size) => {
  //   Grab the canvas
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  // Work out the "pixelSize" based on the size of the canvas
  const pixelSize = w * size
  const spriteWidth = pixelSize * 15
  const spriteHeight = pixelSize * 11

  // Grab the body and eye colours
  const body = pigs[index][0]

  // Our sprite is 15 "pixels" wide and 11 "pixels" down, so let's loop thru the "pixels"
  for (let py = 0; py < 11; py++) {
    for (let px = 0; px < 15; px++) {
      // Calculate the ofset
      const offset = py * 15 + px
      // Grab the value from the pig
      const colourIndex = parseInt(pig[offset], 10)
      // Grab the colour
      const colour = body[colourIndex]
      if (colour !== null) {
        ctx.fillStyle = `#${colour}`
        ctx.fillRect((x * w) - (spriteWidth / 2) + (pixelSize * px), (y * h) - (spriteHeight / 2) + (pixelSize * py), pixelSize + (w / 1000), pixelSize + (w / 1000))
        // console.log(colour)
      }
    }
  }

  // Now draw the eyes
  const eyes = pigs[index][1]
  ctx.fillStyle = `#${eyes}`
  ctx.fillRect((x * w) - (spriteWidth / 2) + (pixelSize * 2), (y * h) - (spriteHeight / 2) + (pixelSize * 4), pixelSize, pixelSize)
  ctx.fillRect((x * w) - (spriteWidth / 2) + (pixelSize * 5), (y * h) - (spriteHeight / 2) + (pixelSize * 4), pixelSize, pixelSize)
}

const drawCanvas = async () => {
  //  Let the preloader know that we've hit this function at least once
  drawStarted = true
  // Cancel any pending nextFrame
  window.cancelAnimationFrame(nextFrame)
  // Grab all the canvas stuff
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  const elapsedTime = new Date().getTime() - startTime
  const diffTime = new Date().getTime() - lastTime
  const backgroundOffset = (Math.sin((elapsedTime - 15000) / 10000) + 1) / 2
  // Create a gradient

  const grd = ctx.createLinearGradient(0, 0 - (h * 10 * backgroundOffset), 0, h * 10 - (h * 10 * backgroundOffset))
  grd.addColorStop(0.0, '#52dfea')
  grd.addColorStop(0.1, '#20e8e6')
  grd.addColorStop(0.2, '#91dce3')
  grd.addColorStop(0.3, '#ffc2d9')
  grd.addColorStop(0.4, '#ffb69d')
  grd.addColorStop(0.5, '#fea858')
  grd.addColorStop(0.6, '#ff9460')
  grd.addColorStop(0.7, '#ff7c86')
  grd.addColorStop(0.8, '#885694')
  grd.addColorStop(0.9, '#061986')
  grd.addColorStop(1.0, '#00001d')

  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)

  // Loop through the clouds
  features.clouds.forEach((cloud) => {
    // console.log(cloud)
    // Loop through the cloud array in steps of 3
    const shades = [
      {
        colour: 'grey',
        offset: h / 50
      },
      {
        colour: 'white',
        offset: 0
      }
    ]
    // Loop through the shades
    shades.forEach((shade) => {
      ctx.fillStyle = shade.colour
      for (let i = 0; i < sourceCloud.length; i += 3) {
        // Draw a circle
        ctx.beginPath()
        ctx.arc(((((sourceCloud[i] + cloud.x) - 0.5) * cloud.size) + 0.5) * w, ((((sourceCloud[i + 1] + cloud.y) - 0.5) * cloud.size) + 0.5) * h + shade.offset, (sourceCloud[i + 2] * cloud.size) * w, 0, 2 * Math.PI)
        ctx.fill()
        cloud.x += diffTime / 20000 * cloud.speed
        if (cloud.x > 2.5) cloud.x -= 3.5
      }
    })
  })

  // Loop through all the feature pigs
  features.pigs.forEach((piggy) => {
    const yOffset = Math.sin((elapsedTime + piggy.timeStartOffset) / piggy.speed * 2) * piggy.amplitude
    const xOffset = Math.sin((elapsedTime + piggy.timeStartOffset) / (piggy.speed / 2)) * piggy.amplitude
    drawPig(piggy.index, piggy.x + (xOffset / 8), piggy.y + (yOffset / 2), 0.01)
    piggy.x += diffTime / (piggy.speed * 4)
    if (piggy.x > 1.5) piggy.x -= 2
  })

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Below is code that is common to all the projects, there may be some
  // customisation for animated work or special cases

  // Try various methods to tell the parent window that we've drawn something
  if (!thumbnailTaken) {
    try {
      $fx.preview()
    } catch (e) {
      try {
        fxpreview()
      } catch (e) {
      }
    }
    thumbnailTaken = true
  }

  // If we are forcing download, then do that now
  if (dumpOutputs || ('forceDownload' in urlParams && forceDownloaded === false)) {
    forceDownloaded = 'forceDownload' in urlParams
    await autoDownloadCanvas()
    // Tell the parent window that we have downloaded
    window.parent.postMessage('forceDownloaded', '*')
  } else {
    //  We should wait for the next animation frame here
    nextFrame = window.requestAnimationFrame(drawCanvas)
  }
  //
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  lastTime = new Date().getTime()
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// These are the common functions that are used by the canvas that we use
// across all the projects, init sets up the resize event and kicks off the
// layoutCanvas function.
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//  Call this to start everything off
const init = async () => {
  // Resize the canvas when the window resizes, but only after 100ms of no resizing
  window.addEventListener('resize', async () => {
    //  If we do resize though, work out the new size...
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(async () => {
      await layoutCanvas()
    }, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

//  This is where we layout the canvas, and redraw the textures
const layoutCanvas = async (windowObj = window, urlParamsObj = urlParams) => {
  //  Kill the next animation frame (note, this isn't always used, only if we're animating)
  windowObj.cancelAnimationFrame(nextFrame)

  //  Get the window size, and devicePixelRatio
  const { innerWidth: wWidth, innerHeight: wHeight, devicePixelRatio = 1 } = windowObj
  let dpr = devicePixelRatio
  let cWidth = wWidth
  let cHeight = cWidth * ratio

  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }

  // Grab any canvas elements so we can delete them
  const canvases = document.getElementsByTagName('canvas')
  Array.from(canvases).forEach(canvas => canvas.remove())

  // Now set the target width and height
  let targetHeight = highRes ? 4096 : cHeight
  let targetWidth = targetHeight / ratio

  //  If the alba params are forcing the width, then use that (only relevant for Alba)
  if (windowObj.alba?.params?.width) {
    targetWidth = window.alba.params.width
    targetHeight = Math.floor(targetWidth * ratio)
  }

  // If *I* am forcing the width, then use that, and set the dpr to 1
  // (as we want to render at the exact size)
  if ('forceWidth' in urlParams) {
    targetWidth = parseInt(urlParams.forceWidth)
    targetHeight = Math.floor(targetWidth * ratio)
    dpr = 1
  }

  // Update based on the dpr
  targetWidth *= dpr
  targetHeight *= dpr

  //  Set the canvas width and height
  const canvas = document.createElement('canvas')
  canvas.id = 'target'
  canvas.width = targetWidth
  canvas.height = targetHeight
  document.body.appendChild(canvas)

  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Custom code (for defining textures and buffer canvas goes here) if needed
  //

  drawCanvas()
}

//  This allows us to download the canvas as a PNG
// If we are forcing the id then we add that to the filename
const autoDownloadCanvas = async () => {
  const canvas = document.getElementById('target')

  // Create a download link
  const element = document.createElement('a')
  const filename = 'forceId' in urlParams
    ? `${prefix}_${urlParams.forceId.toString().padStart(4, '0')}_${fxhash}`
    : `${prefix}_${fxhash}`
  element.setAttribute('download', filename)

  // Hide the link element
  element.style.display = 'none'
  document.body.appendChild(element)

  // Convert canvas to Blob and set it as the link's href
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob))

  // Trigger the download
  element.click()

  // Clean up by removing the link element
  document.body.removeChild(element)

  // Reload the page if dumpOutputs is true
  if (dumpOutputs) {
    window.location.reload()
  }
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // == Common controls ==
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    console.log('Highres mode is now', highRes)
    await layoutCanvas()
  }

  // Custom controls
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  Normally we would have a test
  // if (true === true) {
  if (!drawStarted) {
    clearInterval(preloadImagesTmr)
    init()
  }
}

console.table(window.$fxhashFeatures)
