import { NextResponse } from "next/server";

const CLOUDINARY_UPLOAD_URL =
  process.env.CLOUDINARY_UPLOAD_URL ||
  "https://api.cloudinary.com/v1_1/demo/image/upload";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET || "demo_preset";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { error: "No files were uploaded." },
        { status: 400 },
      );
    }

    const uploadPromises = files.map(async (file) => {
      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", file);
      cloudinaryForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: cloudinaryForm,
      });

      if (!cloudinaryResponse.ok) {
        const errorPayload = await cloudinaryResponse.text();
        throw new Error(
          `Cloudinary upload failed: ${cloudinaryResponse.status} ${errorPayload}`,
        );
      }

      const payload = await cloudinaryResponse.json();
      return payload.secure_url || payload.url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return NextResponse.json({ data: uploadedUrls }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload image to Cloudinary.",
      },
      { status: 500 },
    );
  }
}
