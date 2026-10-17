import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.documentId) {
      return new Response(
        "Please upload a PDF document first using the attachment button (📎) below. Once uploaded, I will analyze it and answer all your questions with page citations!",
        {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    const sources = response.headers.get("x-sources");
    if (sources) {
      headers.set("x-sources", sources);
    }

    if (!response.ok) {
      const errText = await response.text();
      return new Response(errText, {
        status: response.status,
        headers,
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error: any) {
    console.error("Error connecting to chat backend:", error);
    return NextResponse.json(
      { error: "Failed to connect to the backend server. Please make sure the backend service is running." },
      { status: 502 }
    );
  }
}
