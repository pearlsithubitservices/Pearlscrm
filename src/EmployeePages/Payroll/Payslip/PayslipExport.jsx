import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const safe = (val) => String(val ?? "");

const formatINR = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN")}`;

export const exportPayslipPDF = (payslipData) => {
  const pdf = new jsPDF();

  // HEADER BACKGROUND
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, 210, 30, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text("PEARLS IT HUB", 14, 18);

  pdf.setFontSize(10);
  pdf.text("Employee Payslip", 150, 18);

  // RESET COLOR
  pdf.setTextColor(0, 0, 0);

  // BASIC INFO
  pdf.setFontSize(12);
  pdf.text(`Payslip Month: ${safe(payslipData.month)}`, 14, 45);

  pdf.text(`Status: ${safe(payslipData.status)}`, 150, 45);

  pdf.text(`Generated Date: ${safe(payslipData.date)}`, 14, 55);

  // EARNINGS TABLE
  autoTable(pdf, {
    startY: 70,
    head: [["Earnings", "Amount"]],
    body: [
      ["Gross Salary", Number(payslipData.gross).toLocaleString('en-IN')],
      ["Net Salary", Number(payslipData.net).toLocaleString('en-IN')],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  // DEDUCTIONS TABLE
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [["Deductions", "Amount"]],
    body: [
      [
        "Total Deductions",
        (Number(payslipData.totalDeductions).toLocaleString('en-IN') ?? Number(payslipData.deductions).toLocaleString('en-IN') ?? 0),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [239, 68, 68],
    },
  });

  // SUMMARY BOX
  const finalY = pdf.lastAutoTable.finalY + 20;

  pdf.setDrawColor(200);
  pdf.roundedRect(120, finalY, 70, 25, 3, 3);

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text("NET PAYABLE", 130, finalY + 10);

  pdf.setFontSize(16);
  pdf.setTextColor(22, 163, 74);

  // ⚠ FIX: must be string
  pdf.text(Number(payslipData.net).toLocaleString('en-IN'), 130, finalY + 20);

  // FOOTER
  pdf.setTextColor(120);
  pdf.setFontSize(9);
  pdf.text(
    "This is a system generated payslip and does not require a signature.",
    14,
    285
  );

  pdf.save(`Payslip-${safe(payslipData.month)}.pdf`);
};