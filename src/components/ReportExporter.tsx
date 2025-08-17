"use client";

import { useState } from "react";
import { log } from '@/lib/secureLogger'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReportExporterProps {
  reportsData: any;
  onExport?: () => void;
}

export default function ReportExporter({ reportsData, onExport }: ReportExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    if (!reportsData) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const { summary, periods, ordersByStatus, topProducts, totals } = reportsData;

      // Configuración del documento
      doc.setFont("helvetica");
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);

      // Título principal
      doc.text("Reporte de Tienda", 105, 20, { align: "center" });
      
      // Información del reporte
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${formatDate(new Date().toISOString())}`, 105, 30, { align: "center" });

      // Resumen ejecutivo
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Resumen Ejecutivo", 20, 45);

      // Tarjetas de resumen
      const summaryData = [
        ["Métrica", "Valor", "Detalle"],
        ["Ventas Hoy", formatCurrency(summary.salesToday.amount), `${summary.salesToday.count} pedidos`],
        ["Pedidos Hoy", summary.ordersToday.count.toString(), formatCurrency(summary.salesToday.amount)],
        ["Nuevos Clientes", summary.newClientsToday.count.toString(), `${totals.totalClients} total`],
        ["Productos Activos", summary.totalProducts.count.toString(), `${summary.totalProducts.lowStock} bajo stock`],
      ];

      autoTable(doc, {
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Estadísticas por períodos
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Estadísticas por Períodos", 20, 120);

      const periodsData = [
        ["Período", "Ventas", "Pedidos", "Clientes"],
        ["Hoy", formatCurrency(periods.today.sales), periods.today.orders.toString(), periods.today.clients.toString()],
        ["Ayer", formatCurrency(periods.yesterday.sales), periods.yesterday.orders.toString(), "-"],
        ["Última Semana", formatCurrency(periods.lastWeek.sales), periods.lastWeek.orders.toString(), periods.lastWeek.clients.toString()],
        ["Último Mes", formatCurrency(periods.lastMonth.sales), periods.lastMonth.orders.toString(), "-"],
      ];

      autoTable(doc, {
        startY: 125,
        head: [periodsData[0]],
        body: periodsData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Pedidos por estado
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Pedidos por Estado", 20, 200);

      const statusLabels: Record<string, string> = {
        PENDING: "Pendiente",
        CONFIRMED: "Confirmado",
        PROCESSING: "Procesando",
        SHIPPED: "Enviado",
        DELIVERED: "Entregado",
        CANCELLED: "Cancelado",
        REFUNDED: "Reembolsado",
      };

      const ordersData = [
        ["Estado", "Cantidad", "Total"],
        ...ordersByStatus.map((order: any) => [
          statusLabels[order.status] || order.status,
          order.count.toString(),
          formatCurrency(order.total)
        ])
      ];

      autoTable(doc, {
        startY: 205,
        head: [ordersData[0]],
        body: ordersData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Productos más vendidos
      if (topProducts.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text("Productos Más Vendidos", 20, 280);

        const productsData = [
          ["Producto", "Unidades", "Pedidos", "Valor Total"],
          ...topProducts.map((product: any) => [
            product.name,
            product.totalQuantity.toString(),
            product.totalOrders.toString(),
            formatCurrency(product.price * product.totalQuantity)
          ])
        ];

        autoTable(doc, {
          startY: 285,
          head: [productsData[0]],
          body: productsData.slice(1),
          theme: 'grid',
          headStyles: {
            fillColor: [52, 73, 94],
            textColor: 255,
            fontSize: 12,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
      }

      // Totales generales
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Totales Generales", 20, 360);

      const totalsData = [
        ["Métrica", "Valor"],
        ["Total de Clientes", totals.totalClients.toString()],
        ["Total de Productos", totals.totalProducts.toString()],
        ["Ventas Totales", formatCurrency(totals.totalSales)],
        ["Pedidos Totales", totals.totalOrders.toString()],
      ];

      autoTable(doc, {
        startY: 365,
        head: [totalsData[0]],
        body: totalsData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
      }

      // Generar nombre del archivo
      const fileName = `reporte-tienda-${new Date().toISOString().split('T')[0]}.pdf`;

      // Descargar el PDF
      doc.save(fileName);
      
      toast.success('Reporte exportado exitosamente');
      
      if (onExport) {
        onExport();
      }

    } catch (error) {
      log.error('Error generando PDF:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isExporting || !reportsData}
      className="btn-secondary flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Exportar Reporte
        </>
      )}
    </button>
  );
} 