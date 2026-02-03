import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const pathSegments = Array.isArray(params?.path) ? params.path : [params?.path].filter(Boolean);
    const imagePath = pathSegments.map(segment => decodeURIComponent(String(segment))).join('/');
    if (!imagePath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'src', 'images', imagePath);

    // Security: Ensure the file is within the images directory
    const imagesDir = path.join(process.cwd(), 'src', 'images');
    const resolvedPath = path.resolve(filePath);
    const resolvedImagesDir = path.resolve(imagesDir);

    if (!resolvedPath.startsWith(resolvedImagesDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Determine content type
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

