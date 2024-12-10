import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const input = document.getElementById('seed')
const grainToggle = document.getElementById('grain-toggle')

canvas.width = 400
canvas.height = 300

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

function generateColors(hash) {
  return {
    color1: {
      r: (hash & 0xff) % 256,
      g: ((hash >> 8) & 0xff) % 256,
      b: ((hash >> 16) & 0xff) % 256,
    },
    color2: {
      r: ((hash >> 4) & 0xff) % 256,
      g: ((hash >> 12) & 0xff) % 256,
      b: ((hash >> 20) & 0xff) % 256,
    },
  }
}

//github.com/jwagner/analog-film-emulator/blob/master/src/image-processing.js
function addGrain(out, image, slice, scale, intensity) {
  let noise2D = createNoise2D()
  // console.time('addGrain')
  let od = out.data,
    id = image.data,
    w = image.width,
    h = image.height,
    ox = slice.x,
    oy = slice.y,
    d = Math.min(slice.width, slice.height)

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      // reduce noise in shadows and highlights, 4 = no noise in pure black and white
      let i = (y * w + x) * 4,
        l = (id[i] + id[i + 1] + id[i + 2]) / 768 - 0.5,
        rx = x + ox,
        ry = y + oy,
        noise =
          (noise2D((rx / d) * scale, (ry / d) * scale) +
            noise2D(((rx / d) * scale) / 2, ((ry / d) * scale) / 2) * 0.25 +
            noise2D(((rx / d) * scale) / 4, ((ry / d) * scale) / 4)) *
          0.5
      // reduce noise in shadows and highlights, 4 = no noise in pure black and white
      noise *= 1 - l * l * 2
      noise *= intensity * 255
      od[i] = id[i] + noise
      od[i + 1] = id[i + 1] + noise
      od[i + 2] = id[i + 2] + noise
    }
  }
  // console.timeEnd('addGrain')
}

function generateImage(seed) {
  const hash = hashString(seed)
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const { color1, color2 } = generateColors(hash)

  // Create base gradient
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const gradientPos = (x + y) / (canvas.width + canvas.height)
      const i = (y * canvas.width + x) * 4

      imageData.data[i] = color1.r + (color2.r - color1.r) * gradientPos
      imageData.data[i + 1] = color1.g + (color2.g - color1.g) * gradientPos
      imageData.data[i + 2] = color1.b + (color2.b - color1.b) * gradientPos
      imageData.data[i + 3] = 255
    }
  }

  // Add grain if enabled
  if (grainToggle.checked) {
    // Call original addGrain with correct parameters
    addGrain(
      imageData, // out
      imageData, // image (same as out in our case)
      {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      }, // slice
      1600, // scale
      0.1, // intensity
    )
  }

  ctx.putImageData(imageData, 0, 0)
}

input.addEventListener('input', e => generateImage(e.target.value))
grainToggle.addEventListener('change', () => generateImage(input.value))
generateImage('') // Generate initial image
