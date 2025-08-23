// utils/pdf.js
import jsPDF from "jspdf";

export async function exportSessionPDF(session, user) {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text("Interview Session Report", 10, y); y += 8;
  doc.setFontSize(11);
  doc.text(`User: ${user.name} (${user.email})`, 10, y); y += 6;
  doc.text(`Date: ${new Date(session.createdAt).toLocaleString()}`, 10, y); y += 6;
  doc.text(`Role: ${session.role} | Category: ${session.category}`, 10, y); y += 10;

  session.responses.forEach((resp, idx) => {
    doc.text(`Q${idx + 1}: ${resp.answerText}`, 10, y); y += 6;
    doc.text(`Rating: ${resp.feedback.rating}/5`, 10, y); y += 6;
    resp.feedback.strengths.forEach(s => { doc.text(`+ ${s}`, 14, y); y += 5; });
    resp.feedback.weaknesses.forEach(w => { doc.text(`- ${w}`, 14, y); y += 5; });
    doc.addPage();
    y = 10;
  });

  return doc.output("arraybuffer"); // return buffer
}
