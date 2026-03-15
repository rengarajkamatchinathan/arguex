import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getOrCreateUser } from "@/lib/get-or-create-user";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { folder } = body; // "avatars" or "debates"

  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = `arguex/${folder || "general"}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: uploadFolder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder: uploadFolder,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
