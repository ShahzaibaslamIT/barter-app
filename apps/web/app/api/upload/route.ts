// import { NextRequest, NextResponse } from "next/server"
// import path from "path"
// import fs from "fs/promises"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const files = formData.getAll("files") as File[] // 👈 multiple files
//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
//     }

//     const uploadDir = path.join(process.cwd(), "public", "uploads")
//     await fs.mkdir(uploadDir, { recursive: true })

//     const urls: string[] = []

//     for (const file of files) {
//       const buffer = Buffer.from(await file.arrayBuffer())
//       const fileName = `${Date.now()}-${file.name}`
//       const filePath = path.join(uploadDir, fileName)

//       await fs.writeFile(filePath, buffer)
//       urls.push(`/uploads/${fileName}`)
//     }

//     return NextResponse.json({ urls })
//   } catch (e) {
//     console.error("Upload error", e)
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 })
//   }
// }


import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// ✅ Configure Cloudinary (reads from your environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload file to Cloudinary
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "barter-app", // Optional: keep uploads organized
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(buffer)
      })

      urls.push(result.secure_url) // ✅ save Cloudinary image URL
    }

    return NextResponse.json({ urls })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
