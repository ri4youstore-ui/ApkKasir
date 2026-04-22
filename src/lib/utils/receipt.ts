import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function generateReceiptPDF(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const width = 58; // 58mm thermal printer
  const height = (canvas.height * width) / canvas.width;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [width, height],
  });

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save(filename);
}

export async function printReceipt(element: HTMLElement) {
  const printWindow = window.open("", "", "height=600,width=400");
  if (printWindow) {
    const canvas = await html2canvas(element);
    const img = canvas.toDataURL("image/png");
    printWindow.document.write(`<img src="${img}" />`);
    printWindow.document.close();
    printWindow.print();
  }
}
