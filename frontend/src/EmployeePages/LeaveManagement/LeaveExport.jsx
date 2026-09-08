import jsPDF from "jspdf";

export const exportLeaveHistoryPDF = (leaveData = []) => {
  if (!leaveData || leaveData.length === 0) {
    alert("No leave history records found to export.");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");

  // Title Header
  pdf.setFontSize(18);
  pdf.setTextColor(11, 43, 87); // #0B2B57
  pdf.text("Pearls CRM - Leave History Report", 14, 20);

  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated on: ${new Date().toLocaleDateString("en-IN")} at ${new Date().toLocaleTimeString()}`, 14, 26);
  pdf.text(`Total Records: ${leaveData.length}`, 14, 31);

  // Divider Line
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.5);
  pdf.line(14, 35, 196, 35);

  let y = 44;

  leaveData.forEach((leave, index) => {
    // Check if new page needed
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(11);
    pdf.setTextColor(11, 43, 87);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${index + 1}. ${leave.title || "Leave Application"}`, 14, y);

    // Status Pill
    const status = (leave.status || "PENDING").toUpperCase();
    if (status === "APPROVED") {
      pdf.setTextColor(22, 101, 52); // green
    } else if (status === "REJECTED") {
      pdf.setTextColor(185, 28, 28); // red
    } else {
      pdf.setTextColor(180, 83, 9); // amber
    }
    pdf.text(`[${status}]`, 170, y);

    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);

    pdf.text(`Type: ${leave.type || "General"}   |   Duration: ${leave.days}`, 18, y);
    y += 5;
    pdf.text(`Dates: ${leave.date}`, 18, y);

    if (leave.reason) {
      y += 5;
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Reason: "${leave.reason.slice(0, 80)}${leave.reason.length > 80 ? "..." : ""}"`, 18, y);
    }

    y += 7;
    pdf.setDrawColor(241, 245, 249);
    pdf.line(14, y, 196, y);
    y += 6;
  });

  pdf.save(`Leave-History-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
};