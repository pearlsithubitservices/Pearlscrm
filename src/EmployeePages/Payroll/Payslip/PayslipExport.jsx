import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportPayslipPDF = (payslipData) => {
  const pdf = new jsPDF();

  // Header
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, 210, 30, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text("PEARLS IT HUB", 14, 18);

  pdf.setFontSize(10);
  pdf.text("Employee Payslip", 150, 18);

  // Reset color
  pdf.setTextColor(0, 0, 0);

  // Employee Info
  pdf.setFontSize(12);
  pdf.text(`Payslip Month: ${payslipData.month}`, 14, 45);
  pdf.text(`Status: ${payslipData.status}`, 150, 45);
  pdf.text(`Generated Date: ${payslipData.date}`, 14, 55);

  // Earnings Table
  autoTable(pdf, {
    startY: 70,
    head: [["Earnings", "Amount"]],
    body: [
      ["Gross Salary",  Number(payslipData.gross).toLocaleString('en-IN')],
      ["Net Salary", Number(payslipData.net).toLocaleString('en-IN')],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  // Deductions Table
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [["Deductions", "Amount"]],
    body: [
      ["Total Deductions", Number(payslipData.deductions).toLocaleString('en-IN')],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [239, 68, 68],
    },
  });

  // Summary Box
  const finalY = pdf.lastAutoTable.finalY + 20;

  pdf.setDrawColor(200);
  pdf.roundedRect(120, finalY, 70, 25, 3, 3);

  pdf.setFontSize(10);
  pdf.text("NET PAYABLE", 130, finalY + 10);

  pdf.setFontSize(16);
  pdf.setTextColor(22, 163, 74);
  pdf.text(payslipData.net, 130, finalY + 20);

  // Footer
  pdf.setTextColor(120);
  pdf.setFontSize(9);
  pdf.text(
    "This is a system generated payslip and does not require a signature.",
    14,
    285
  );

  pdf.save(`Payslip-${payslipData.month}.pdf`);
};