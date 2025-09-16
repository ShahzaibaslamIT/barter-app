import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[] // 👈 multiple files
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(uploadDir, fileName)

      await fs.writeFile(filePath, buffer)
      urls.push(`/uploads/${fileName}`)
    }

    return NextResponse.json({ urls })
  } catch (e) {
    console.error("Upload error", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
