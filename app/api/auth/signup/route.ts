import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Allowed user types
const allowedUserTypes = ["both", "service_provider", "item_owner"] as const;
type UserType = (typeof allowedUserTypes)[number];

// ✅ Get all posts (listings)
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // Include user info if needed
      },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// ✅ User signup
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, user_type } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Ensure user_type is valid
    const finalUserType: UserType = allowedUserTypes.includes(user_type as UserType)
      ? (user_type as UserType)
      : "both";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        user_type: finalUserType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      user_type: allowedUserTypes.includes(user.user_type as UserType)
        ? (user.user_type as UserType)
        : "both",
    });

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        user_type: allowedUserTypes.includes(user.user_type as UserType)
          ? (user.user_type as UserType)
          : "both",
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
