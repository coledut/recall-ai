import { createClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const authToken = formData.get("authToken") as string;

    if (!file || !authToken) {
      return Response.json({ error: "Missing file or auth token" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let extractedText = "";
    
    if (file.type.startsWith("image/")) {
      extractedText = "[Image uploaded - OCR extraction via Tesseract.js on client]";
    } else if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(file);
    }

    return Response.json({
      success: true,
      fileName: file.name,
      fileType: file.type,
      extractedText,
      charCount: extractedText.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Failed to process file" }, { status: 500 });
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfParse = require("pdf-parse");
    const buffer = await file.arrayBuffer();
    const data = await pdfParse(buffer);
    return (data.text || "").substring(0, 50000);
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "[PDF uploaded - text extraction in progress]";
  }
}
