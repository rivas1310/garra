import { NextResponse } from "next/server";
import { log } from '@/lib/secureLogger'
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    log.error("POST /api/productos recibido:", data);
    const {
      name,
      description,
      categoryId,
      subcategoria,
      price,
      originalPrice,
      images,
      stock,
      barcode, // Necesario para el código de barras
      isActive,
      isNew,
      isOnSale,
      isSecondHand,
      variants = [],
    } = data;

    // Generar slug base
    let baseSlug = name.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;
    let count = 1;
    // Buscar si el slug ya existe y generar uno único
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    // Crear el producto principal
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        images,
        categoryId,
        subcategoria,
        stock: parseInt(stock),
        // barcode: barcode || null, // Incluir código de barras - Temporalmente comentado hasta regenerar Prisma client
        isActive,
        isNew,
        isOnSale,
        isSecondHand: !!isSecondHand,
        variants: {
          create: variants.map((variant: any) => ({
            size: variant.size,
            color: variant.color,
            stock: parseInt(variant.stock),
            price: variant.price ? parseFloat(variant.price) : null,
          })),
        },
      },
      include: { variants: true },
    });

    // Si se proporcionó un código de barras, actualizarlo usando SQL directo
    if (barcode) {
      try {
        await prisma.$executeRaw`UPDATE "Product" SET barcode = ${barcode} WHERE id = ${product.id}`;
        log.error(
          `Código de barras ${barcode} agregado al producto ${product.id}`,
        );
      } catch (error) {
        log.error("Error al agregar código de barras:", error);
        // No fallar la creación del producto si el código de barras falla
      }
    }

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    log.error("Error al crear el producto:", error);
    let detalle =
      typeof error === "object"
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : String(error);
    return NextResponse.json(
      { error: "Error al crear el producto", detalle },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // Obtener la URL de la solicitud para verificar parámetros
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const isOnSale = searchParams.get("isOnSale") === "true";
    const isNew = searchParams.get("isNew") === "true";
    const isSecondHand = searchParams.get("isSecondHand") === "true";
    const admin = searchParams.get("admin") === "true";
    const timestamp = searchParams.get("t") || Date.now().toString();

    log.error(`Obteniendo productos con timestamp: ${timestamp}`);

    // Construir el objeto de filtro para Prisma
    const where: any = {};

    // Filtrar por categoría si se proporciona
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Filtrar por subcategoría si se proporciona
    if (subcategory) {
      where.subcategoria = subcategory;
    }

    // Filtrar por búsqueda si se proporciona
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filtrar por rango de precios
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Filtrar por ofertas
    if (isOnSale) {
      where.isOnSale = true;
    }

    // Filtrar por nuevos
    if (isNew) {
      where.isNew = true;
    }

    // Filtrar por segunda mano
    if (isSecondHand) {
      where.isSecondHand = true;
    }

    // Si no es admin, solo mostrar productos activos
    if (!admin) {
      where.isActive = true;
    }

    // Calcular el número de elementos a saltar para la paginación
    const skip = (page - 1) * limit;

    // Determinar el orden según el parámetro sort
    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { reviewCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Obtener los productos con paginación y filtros
    const productos = await prisma.product.findMany({
      where,
      orderBy,
      skip: limit && page ? skip : undefined,
      take: limit || undefined,
      include: {
        variants: true,
        category: true,
      },
    });

    // Obtener el total de productos para la paginación
    const total = await prisma.product.count({ where });

    // Calcular el totalStock para cada producto (sin actualizar la base de datos)
    const productosConTotalStock = productos.map((producto) => {
      let totalStock;
      if (producto.variants && producto.variants.length > 0) {
        // Si el producto tiene variantes, usar solo el stock de las variantes
        // sin sumar el stock principal para evitar duplicación
        totalStock = producto.variants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        // Si no tiene variantes, usar el stock principal
        totalStock = producto.stock;
      }

      // Retornar el producto con el totalStock calculado
      return {
        ...producto,
        totalStock,
      };
    });


    if (page && limit) {
      return NextResponse.json({
        productos: productosConTotalStock,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      return NextResponse.json(productosConTotalStock);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    // Verificar si el producto está asociado a alguna orden
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    });

    if (orderItems.length > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el producto",
          detalle:
            "El producto está asociado a una o más órdenes. Considere desactivarlo en lugar de eliminarlo.",
          orderCount: orderItems.length,
        },
        { status: 409 },
      ); // Conflict status code
    }

    // Primero eliminar las variantes asociadas al producto
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    // Luego eliminar el producto
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("Error al eliminar el producto:", error);
    let detalle =
      typeof error === "object"
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : String(error);
    return NextResponse.json(
      { error: "Error al eliminar el producto", detalle },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, isActive, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar el producto
    const updatePayload: Prisma.ProductUpdateInput = {};

    // Si se proporciona isActive, actualizarlo
    if (typeof isActive === "boolean") {
      updatePayload.isActive = isActive;
    }

    // Agregar otros campos de actualización si se proporcionan
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        // Usar una aserción de tipo para evitar el error de indexación
        (updatePayload as any)[key] = updateData[key];
      }
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: { variants: true, category: true },
    });

    return NextResponse.json({ ok: true, product: updatedProduct });
  } catch (error) {
    log.error("Error al actualizar el producto:", error);
    let detalle =
      typeof error === "object"
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : String(error);
    return NextResponse.json(
      { error: "Error al actualizar el producto", detalle },
      { status: 500 },
    );
  }
}
