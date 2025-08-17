import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger';
import { uploadToR2 } from '@/utils/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'productos';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    log.info(`Iniciando subida masiva de ${files.length} imágenes a R2`);

    const uploadResults = [];
    const errors = [];

    // Subir cada imagen individualmente
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        log.info(`Subiendo imagen ${i + 1}/${files.length}: ${file.name}`);
        
        const result = await uploadToR2(file, {
          folder,
          fileName: file.name
        });

        uploadResults.push({
          originalName: file.name,
          key: result.key,
          url: result.url,
          success: true
        });

        log.info(`Imagen ${file.name} subida exitosamente a R2`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error(`Error subiendo imagen ${file.name}:`, errorMessage);
        
        errors.push({
          originalName: file.name,
          error: errorMessage,
          success: false
        });
      }
    }

    const successCount = uploadResults.length;
    const errorCount = errors.length;

    log.info(`Subida masiva completada: ${successCount} exitosas, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      results: {
        total: files.length,
        successful: successCount,
        failed: errorCount,
        uploads: uploadResults,
        errors: errors
      }
    });

  } catch (error) {
    log.error('Error en subida masiva:', error);
    return NextResponse.json(
      {
        error: 'Error en subida masiva',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
