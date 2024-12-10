import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const input = document.getElementById('seed')

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
  // Generate two colors based on the hash
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

function generateImage(seed) {
  const hash = hashString(seed)
  const noise2D = createNoise2D(() => hash / Number.MAX_SAFE_INTEGER)
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const { color1, color2 } = generateColors(hash)

  // Use hash to vary the noise scale and intensity
  const noiseScale = 100 + (Math.abs(hash) % 100) // Larger scale for softer variation
  const noiseIntensity = 0.15 // Reduce noise intensity for subtlety

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Create gradient based on position
      const gradientPos = (x + y) / (canvas.width + canvas.height)

      // Add subtle noise
      const noiseValue = noise2D(x / noiseScale, y / noiseScale) * noiseIntensity

      // Blend colors with gradient and noise
      const blend = gradientPos + noiseValue
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
generateImage('') // Generate initial image
