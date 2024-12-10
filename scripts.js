import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const input = document.getElementById('seed')
const grainToggle = document.getElementById('grain-toggle')

// Set 4:3 aspect ratio
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

// Add subtle random dither to prevent banding
function dither(value) {
  const floorValue = Math.floor(value)
  const remainder = value - floorValue
  return Math.random() > remainder ? floorValue : Math.ceil(value)
}

function generateImage(seed) {
  const hash = hashString(seed)
  const noise2D = createNoise2D(() => hash / Number.MAX_SAFE_INTEGER)
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const { color1, color2 } = generateColors(hash)

  // Film grain parameters
  const grainIntensity = grainToggle.checked ? 0.1 : 0
  const d = Math.min(canvas.width, canvas.height)
  const baseScale = 8
  const timeOffset = hash % 1000

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Create diagonal gradient
      const gradientPos = (x + y) / (canvas.width + canvas.height)

      // Create film grain effect with finer detail
      const grain =
        (noise2D(((x + timeOffset) / d) * baseScale, ((y + timeOffset) / d) * baseScale) + // Base grain
          noise2D(((x - timeOffset) / d) * baseScale * 2, ((y - timeOffset) / d) * baseScale * 2) * 0.5 + // Medium detail
          noise2D((x / d) * baseScale * 4, (y / d) * baseScale * 4) * 0.25) * // Fine detail
        grainIntensity *
        0.75 // Reduce overall intensity slightly

      // Blend colors with gradient and add grain
      const blend = Math.max(0, Math.min(1, gradientPos + grain))
      const i = (y * canvas.width + x) * 4

      imageData.data[i] = color1.r + (color2.r - color1.r) * blend // R
      imageData.data[i + 1] = color1.g + (color2.g - color1.g) * blend // G
      imageData.data[i + 2] = color1.b + (color2.b - color1.b) * blend // B
      imageData.data[i + 3] = 255 // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

input.addEventListener('input', e => generateImage(e.target.value))
grainToggle.addEventListener('change', () => generateImage(input.value))
generateImage('') // Generate initial image
