import jsPDF from "jspdf";

export const exportLeaveHistoryPDF = (leaveData) => {
  const pdf = new jsPDF();

  pdf.setFontSize(12);
  pdf.text("Leave History Receipt", 20, 20);

  let y = 40;
  console.log(leaveData);
  if (leaveData.length === 0){
    alert("No leave history");
    return;
  } 
    leaveData.forEach((leave, index) => {
      pdf.text(`${index + 1}. ${leave.title}`, 20, y);
      y += 8;

      pdf.text(`Date : ${leave.date}`, 30, y);
      y += 8;


      pdf.text(`Days : ${leave.days}`, 30, y);
      y += 8;

      pdf.text(`Status : ${leave.status}`, 30, y);
      y += 15;
    });
  
  pdf.save("Leave-History-Receipt.pdf");
};