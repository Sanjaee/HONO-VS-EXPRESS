import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { cors } from 'hono/cors'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = new Hono()

app.use('*', cors())

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body.image as File
  const name = body.name as string

  if (!file) {
    return c.json({ error: 'Gambar tidak ditemukan' }, 400)
  }

  const allowedExtensions = ['.jpg', '.jpeg', '.png']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!allowedExtensions.includes(fileExtension)) {
    return c.json({ error: 'Only images are allowed' }, 400)
  }

  try {
    const buffer = await file.arrayBuffer()
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'hono_vs_express',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      stream.end(Buffer.from(buffer))
    })

    const image = await prisma.image.create({
      data: {
        name: name,
        imageUrl: result.secure_url,
        createdAt: new Date(),
      },
    })

    return c.json({ message: 'Gambar berhasil diupload', image }, 201)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Gagal menyimpan gambar' }, 500)
  }
})


app.post('/manual-upload', async (c) => {
    const { name, imageUrl } = await c.req.json()
  
    if (!name || !imageUrl) {
      return c.json({ error: 'Nama dan URL gambar harus disediakan' }, 400)
    }
  
    try {
      const image = await prisma.image.create({
        data: {
          name: name,
          imageUrl: imageUrl,
          createdAt: new Date(),
        },
      })
  
      return c.json({ message: 'Gambar berhasil disimpan di database', image }, 201)
    } catch (error) {
      console.error(error)
      return c.json({ error: 'Gagal menyimpan gambar di database' }, 500)
    }
  })
  

const port = parseInt(process.env.PORT || '3001', 10)
console.log(`Server berjalan di port http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}