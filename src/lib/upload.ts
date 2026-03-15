export async function uploadToCloudinary(
  file: File,
  folder: "avatars" | "debates"
): Promise<string> {
  // 1. Get signed upload params from our API
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) throw new Error("Failed to get upload signature");
  const { signature, timestamp, folder: uploadFolder, cloudName, apiKey } = await sigRes.json();

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", uploadFolder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Upload failed");
  const data = await uploadRes.json();
  return data.secure_url;
}
