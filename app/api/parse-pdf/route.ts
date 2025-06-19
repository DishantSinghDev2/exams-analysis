import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const tempFilePath = path.join('/tmp', file.name);
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Save the file temporarily
        await fsPromises.writeFile(tempFilePath, fileBuffer);

        // Read and parse the PDF
        const dataBuffer = fs.readFileSync(tempFilePath);
        const data = await pdf(dataBuffer);

        // Clean up the temporary file
        await fsPromises.unlink(tempFilePath);

        return NextResponse.json({
            numpages: data.numpages,
            numrender: data.numrender,
            info: data.info,
            metadata: data.metadata,
            version: data.version,
            text: data.text,
        });
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
    }
}