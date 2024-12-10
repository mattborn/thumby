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

function generateImage(seed) {
  const hash = hashString(seed)
  const noise2D = createNoise2D(() => hash / Number.MAX_SAFE_INTEGER)
  const imageData = ctx.createImageData(canvas.width, canvas.height)

  // Use hash to vary the noise scale
  const scale = 20 + (Math.abs(hash) % 80) // Scale will be between 20 and 100

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Add some offset based on hash to create more variation
      const value = (noise2D(x / scale, y / scale) + 1) / 2
      const i = (y * canvas.width + x) * 4

      imageData.data[i] = value * 255 // R
      imageData.data[i + 1] = value * 255 // G
      imageData.data[i + 2] = value * 255 // B
      imageData.data[i + 3] = 255 // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

input.addEventListener('input', e => generateImage(e.target.value))
generateImage('') // Generate initial image
