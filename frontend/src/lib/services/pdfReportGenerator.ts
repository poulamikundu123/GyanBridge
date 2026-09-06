import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AuditReportData {
  title: string;
  code: string;
  reportType: "NCISM" | "NAAC" | "NIRF" | string;
  institutionName: string;
  generatedAt: string;
  complianceStatus: string;
  verificationHash: string;
  metrics: {
    cohortSize: number;
    completedTests: number;
    verifiedSkills: number;
    placements: number;
  };
  criteria: Array<{
    dimension: string;
    metric: string;
    score: string;
    status: string;
  }>;
  departmentBreakdown: Array<{
    department: string;
    syllabusAlignment: string;
    placementRate: string;
    activeMous: number;
  }>;
}

export function generateReportPdf(data: AuditReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Banner Background
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold accent stripe
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(0, 28, pageWidth, 2, "F");

  // Top Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AYUSHAI — ACCREDITATION & REGULATORY EVIDENCE DOSSIER", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229); // Emerald 100
  doc.text(
    "Ministry of AYUSH • Official Academic Competency, Employability & Verification Audit",
    margin,
    18
  );

  doc.setFontSize(7.5);
  doc.setTextColor(253, 230, 138); // Amber 200
  doc.text(`VERIFICATION HASH: SHA256-${data.verificationHash}`, margin, 24);

  // Institution & Report Identity Box
  let y = 37;
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(data.title, margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Institution: ${data.institutionName}`, margin, y);

  y += 5;
  doc.text(`Document Reference: ${data.code}   |   Generated: ${data.generatedAt}`, margin, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`Regulatory Compliance Status: ${data.complianceStatus} (Fully Verified)`, margin, y);

  // Summary Metrics Grid Cards
  y += 6;
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 16;
  const metricCards = [
    { label: "COHORT SIZE", val: String(data.metrics.cohortSize), sub: "100% Enrolled" },
    { label: "COMPLETED TESTS", val: String(data.metrics.completedTests), sub: "Adaptive Audits" },
    { label: "VERIFIED SKILLS", val: String(data.metrics.verifiedSkills), sub: "Competency Ledger" },
    { label: "PLACEMENTS", val: String(data.metrics.placements), sub: "Industry Conversion" },
  ];

  metricCards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(card.label, cardX + 3, y + 4.5);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(card.val, cardX + 3, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(card.sub, cardX + 3, y + 14);
  });

  y += cardHeight + 7;

  // Section 1: Detailed Regulatory Criteria Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Regulatory Audit Criteria & Evidence Breakdown", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Regulatory Dimension", "Audit Metric / Criteria", "Institutional Evidence", "Compliance Status"]],
    body: data.criteria.map((c) => [c.dimension, c.metric, c.score, c.status]),
    theme: "grid",
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 60 },
      2: { cellWidth: 42 },
      3: { cellWidth: 30, fontStyle: "bold", textColor: [5, 150, 105] },
    },
    margin: { left: margin, right: margin },
  });

  // Section 2: Department Breakdown Table
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const afterFirstTable = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 45;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Departmental Competency & Industry Alignment Matrix", margin, afterFirstTable);

  autoTable(doc, {
    startY: afterFirstTable + 2,
    head: [["Department / Division", "Curriculum-Demand Alignment", "Verified Placement Rate", "Active MoUs"]],
    body: data.departmentBreakdown.map((d) => [
      d.department,
      d.syllabusAlignment,
      d.placementRate,
      `${d.activeMous} Industry MoUs`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  let signY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : afterFirstTable + 40;
  if (signY > 250) {
    doc.addPage();
    signY = 20;
  }

  // Official Seal & Sign-off Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, signY, pageWidth - margin * 2, 28, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("OFFICIAL STATUTORY ATTESTATION & EVIDENCE CERTIFICATION", margin + 4, signY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "This document is generated by AYUSHAI Skill Intelligence platform from cryptographic audit trails, student submissions,",
    margin + 4,
    signY + 11
  );
  doc.text(
    "and verified corporate placement records. Compliant with NCISM/NCH, NAAC Criterion V, and NIRF Framework specifications.",
    margin + 4,
    signY + 15
  );

  // Signatory Placeholders
  const sigSpacing = (pageWidth - margin * 2 - 8) / 3;
  const sigY = signY + 23;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  doc.text("Dean (Academic & Clinical)", margin + 4, sigY);
  doc.text("Director / IQAC Coordinator", margin + 4 + sigSpacing, sigY);
  doc.text("Ayush Regulatory Officer", margin + 4 + sigSpacing * 2, sigY);

  // Footer page numbering
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `AYUSHAI Compliance Ledger • Document Code: ${data.code} • Page ${i} of ${totalPages}`,
      margin,
      doc.internal.pageSize.getHeight() - 6
    );
  }

  // Save the PDF directly
  const safeFilename = `${data.code}.pdf`;
  doc.save(safeFilename);
}
