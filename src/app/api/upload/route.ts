import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { uploadToR2 } from '@/utils/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'productos'; // Obtener carpeta personalizada
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 Subiendo archivo a carpeta: ${folder}`);

    // Subir a Cloudflare R2
    const result = await uploadToR2(file, {
      folder: folder,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.key,
    });

  } catch (error) {
    log.error('Error uploading to R2:', error);
    return NextResponse.json(
      { 
        error: 'Error uploading image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}