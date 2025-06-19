import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    try {
        const imageResponse = await fetch(url);
        const buffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get("Content-Type") || "image/jpeg";

        return new NextResponse(Buffer.from(buffer), {
            headers: { "Content-Type": contentType },
        });
    } catch (err) {
        return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
    }
}