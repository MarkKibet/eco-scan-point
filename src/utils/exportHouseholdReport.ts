import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  ShadingType,
  BorderStyle,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';

interface HouseholdBagData {
  household_code: string;
  name: string;
  location: string;
  total_points: number;
  bags: {
    qr_code: string;
    bag_type: string;
    status: string;
    points_awarded: number | null;
    weight_kg: number | null;
    review_status: string | null;
  }[];
}

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const headerShading = { fill: '1B7A3D', type: ShadingType.CLEAR };
const altRowShading = { fill: 'F0FFF4', type: ShadingType.CLEAR };
const cellPadding = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: headerShading,
    margins: cellPadding,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: 'Arial', size: 18 })],
    })],
  });
}

function dataCell(text: string, width: number, isAlt = false, align = AlignmentType.LEFT): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: isAlt ? altRowShading : undefined,
    margins: cellPadding,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, font: 'Arial', size: 18 })],
    })],
  });
}

function statusCell(status: string, width: number, isAlt = false): TableCell {
  const isApproved = status === 'approved';
  const isDisapproved = status === 'disapproved';
  const color = isApproved ? '16A34A' : isDisapproved ? 'DC2626' : '6B7280';
  const label = isApproved ? '✓ Approved' : isDisapproved ? '✗ Disapproved' : status || 'Pending';
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: isAlt ? altRowShading : undefined,
    margins: cellPadding,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: label, font: 'Arial', size: 18, bold: true, color })],
    })],
  });
}

// Create a simple bar chart as a table-based visualization
function createBarChart(title: string, data: { label: string; value: number; color: string }[]): Paragraph[] {
  const max = Math.max(...data.map(d => d.value), 1);
  const elements: Paragraph[] = [
    new Paragraph({
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: title, bold: true, font: 'Arial', size: 22, color: '1B7A3D' })],
    }),
  ];
  
  data.forEach(item => {
    const barLength = Math.round((item.value / max) * 40);
    const bar = '█'.repeat(barLength);
    elements.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${item.label}: `, font: 'Arial', size: 18, bold: true }),
        new TextRun({ text: bar, font: 'Arial', size: 18, color: item.color.replace('#', '') }),
        new TextRun({ text: ` ${item.value}`, font: 'Arial', size: 18 }),
      ],
    }));
  });
  
  return elements;
}

export async function exportHouseholdReport() {
  // Fetch all data
  const { data: rawData } = await supabase
    .from('profiles')
    .select('id, name, household_code, total_points, location')
    .not('household_code', 'is', null)
    .order('household_code');

  if (!rawData || rawData.length === 0) return;

  const { data: bagsData } = await supabase.from('bags').select('*');
  const { data: reviewsData } = await supabase.from('bag_reviews').select('*');

  // Build household data
  const households: HouseholdBagData[] = rawData.map(profile => {
    const householdBags = (bagsData || []).filter(b => b.household_id === profile.id);
    return {
      household_code: profile.household_code!,
      name: profile.name,
      location: profile.location || 'N/A',
      total_points: profile.total_points || 0,
      bags: householdBags.map(bag => {
        const review = (reviewsData || []).find(r => r.bag_id === bag.id);
        let bagTypeLabel = 'Recyclable (Blue)';
        if (bag.qr_code?.startsWith('TTO') || bag.bag_type === 'biodegradable' || bag.bag_type === 'organic') {
          bagTypeLabel = 'Biodegradable (Green)';
        } else if (bag.qr_code?.startsWith('TTS') || bag.bag_type === 'residual') {
          bagTypeLabel = 'Residual (Black)';
        }
        return {
          qr_code: bag.qr_code,
          bag_type: bagTypeLabel,
          status: bag.status || 'activated',
          points_awarded: review?.points_awarded ?? null,
          weight_kg: review?.weight_kg ? Number(review.weight_kg) : null,
          review_status: review?.status ?? null,
        };
      }),
    };
  });

  // Analytics
  const totalHouseholds = households.length;
  const compliantHouseholds = households.filter(h => h.bags.some(b => b.review_status != null)).length;
  const nonCompliantHouseholds = totalHouseholds - compliantHouseholds;
  
  const allBags = households.flatMap(h => h.bags);
  const approvedBags = allBags.filter(b => b.review_status === 'approved').length;
  const disapprovedBags = allBags.filter(b => b.review_status === 'disapproved').length;
  const pendingBags = allBags.filter(b => b.review_status == null).length;
  
  const totalWeight = allBags.reduce((s, b) => s + (b.weight_kg || 0), 0);
  const totalPoints = households.reduce((s, h) => s + h.total_points, 0);

  const recyclableBags = allBags.filter(b => b.bag_type.includes('Recyclable'));
  const biodegradableBags = allBags.filter(b => b.bag_type.includes('Biodegradable'));
  const residualBags = allBags.filter(b => b.bag_type.includes('Residual'));

  const recyclableWeight = recyclableBags.reduce((s, b) => s + (b.weight_kg || 0), 0);
  const biodegradableWeight = biodegradableBags.reduce((s, b) => s + (b.weight_kg || 0), 0);
  const residualWeight = residualBags.reduce((s, b) => s + (b.weight_kg || 0), 0);

  // Column widths (total = 10800 for landscape minus margins)
  const colWidths = [900, 1200, 1400, 1800, 1100, 900, 1100, 1100, 1300];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // Build detail rows
  const detailRows: TableRow[] = [];
  let rowIdx = 0;
  households.forEach(h => {
    if (h.bags.length === 0) {
      const isAlt = rowIdx % 2 === 1;
      detailRows.push(new TableRow({
        children: [
          dataCell(h.household_code, colWidths[0], isAlt, AlignmentType.CENTER),
          dataCell(h.name, colWidths[1], isAlt),
          dataCell(h.location, colWidths[2], isAlt),
          dataCell('No bags', colWidths[3], isAlt),
          dataCell('-', colWidths[4], isAlt, AlignmentType.CENTER),
          dataCell('-', colWidths[5], isAlt, AlignmentType.CENTER),
          dataCell('-', colWidths[6], isAlt, AlignmentType.CENTER),
          statusCell('No bags', colWidths[7], isAlt),
          dataCell('0', colWidths[8], isAlt, AlignmentType.CENTER),
        ],
      }));
      rowIdx++;
    } else {
      h.bags.forEach((bag, i) => {
        const isAlt = rowIdx % 2 === 1;
        detailRows.push(new TableRow({
          children: [
            dataCell(i === 0 ? h.household_code : '', colWidths[0], isAlt, AlignmentType.CENTER),
            dataCell(i === 0 ? h.name : '', colWidths[1], isAlt),
            dataCell(i === 0 ? h.location : '', colWidths[2], isAlt),
            dataCell(bag.bag_type, colWidths[3], isAlt),
            dataCell(bag.qr_code, colWidths[4], isAlt, AlignmentType.CENTER),
            dataCell(bag.weight_kg != null ? `${bag.weight_kg} kg` : '-', colWidths[5], isAlt, AlignmentType.CENTER),
            dataCell(bag.points_awarded != null ? `${bag.points_awarded}` : '-', colWidths[6], isAlt, AlignmentType.CENTER),
            statusCell(bag.review_status || bag.status, colWidths[7], isAlt),
            dataCell(i === 0 ? `${h.total_points}` : '', colWidths[8], isAlt, AlignmentType.CENTER),
          ],
        }));
        rowIdx++;
      });
    }
  });

  // Totals row
  detailRows.push(new TableRow({
    children: [
      new TableCell({
        borders: cellBorders, width: { size: colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], type: WidthType.DXA },
        columnSpan: 5,
        shading: { fill: '1B7A3D', type: ShadingType.CLEAR },
        margins: cellPadding,
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'TOTALS', bold: true, color: 'FFFFFF', font: 'Arial', size: 20 })],
        })],
      }),
      dataCell(`${totalWeight.toFixed(2)} kg`, colWidths[5], false, AlignmentType.CENTER),
      dataCell(`${totalPoints}`, colWidths[6], false, AlignmentType.CENTER),
      dataCell(`${approvedBags}/${allBags.length}`, colWidths[7], false, AlignmentType.CENTER),
      dataCell(`${totalPoints}`, colWidths[8], false, AlignmentType.CENTER),
    ],
  }));

  const today = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, font: 'Arial', color: '1B7A3D' },
          paragraph: { spacing: { before: 240, after: 120 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: 'Arial', color: '1B7A3D' },
          paragraph: { spacing: { before: 200, after: 100 } } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 15840, height: 12240, orientation: undefined },
          margin: { top: 1000, right: 720, bottom: 1000, left: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: 'TakaTrace', bold: true, font: 'Arial', size: 20, color: '1B7A3D' }),
              new TextRun({ text: '  |  Household Waste Management Report', font: 'Arial', size: 18, color: '666666' }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'TakaTrace © 2026  |  Page ', font: 'Arial', size: 16, color: '999999' }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: '999999' }),
            ],
          })],
        }),
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: 'TAKATRACE', bold: true, font: 'Arial', size: 40, color: '1B7A3D' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: 'Household Waste Distribution Report', font: 'Arial', size: 28, color: '333333' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: `Generated: ${today}`, font: 'Arial', size: 20, color: '888888', italics: true })],
        }),

        // Summary cards as a mini table
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun('Summary Overview')],
        }),
        new Table({
          width: { size: tableWidth, type: WidthType.DXA },
          columnWidths: [2400, 2400, 2400, 2400],
          rows: [
            new TableRow({
              children: [
                summaryCard('Total Households', `${totalHouseholds}`, '1B7A3D'),
                summaryCard('Compliant', `${compliantHouseholds}`, '16A34A'),
                summaryCard('Non-Compliant', `${nonCompliantHouseholds}`, 'DC2626'),
                summaryCard('Total Points', `${totalPoints}`, '2563EB'),
              ],
            }),
            new TableRow({
              children: [
                summaryCard('Total Weight', `${totalWeight.toFixed(2)} kg`, '7C3AED'),
                summaryCard('Approved Bags', `${approvedBags}`, '16A34A'),
                summaryCard('Disapproved', `${disapprovedBags}`, 'DC2626'),
                summaryCard('Pending', `${pendingBags}`, 'F59E0B'),
              ],
            }),
          ],
        }),

        new Paragraph({ spacing: { before: 400 } }),

        // Detail table
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun('Detailed Household Data')],
        }),
        new Table({
          width: { size: tableWidth, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [
            new TableRow({
              children: [
                headerCell('ID', colWidths[0]),
                headerCell('Name', colWidths[1]),
                headerCell('Location', colWidths[2]),
                headerCell('Bag Type', colWidths[3]),
                headerCell('QR Code', colWidths[4]),
                headerCell('Weight', colWidths[5]),
                headerCell('Points', colWidths[6]),
                headerCell('Status', colWidths[7]),
                headerCell('Total Pts', colWidths[8]),
              ],
            }),
            ...detailRows,
          ],
        }),

        new Paragraph({ spacing: { before: 400 } }),

        // Analytics section
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun('Analytics & Insights')],
        }),

        // Compliance breakdown
        ...createBarChart('Compliance Status', [
          { label: 'Compliant Households', value: compliantHouseholds, color: '#16A34A' },
          { label: 'Non-Compliant Households', value: nonCompliantHouseholds, color: '#DC2626' },
        ]),

        // Bag status breakdown
        ...createBarChart('Bag Review Status', [
          { label: 'Approved', value: approvedBags, color: '#16A34A' },
          { label: 'Disapproved', value: disapprovedBags, color: '#DC2626' },
          { label: 'Pending/Unscanned', value: pendingBags, color: '#F59E0B' },
        ]),

        // Weight by category
        ...createBarChart('Weight by Waste Category (kg)', [
          { label: `Recyclable (Blue) - ${recyclableBags.length} bags`, value: Math.round(recyclableWeight * 100) / 100, color: '#2563EB' },
          { label: `Biodegradable (Green) - ${biodegradableBags.length} bags`, value: Math.round(biodegradableWeight * 100) / 100, color: '#16A34A' },
          { label: `Residual (Black) - ${residualBags.length} bags`, value: Math.round(residualWeight * 100) / 100, color: '#1F2937' },
        ]),

        // Points distribution
        ...createBarChart('Points per Household', 
          households
            .sort((a, b) => b.total_points - a.total_points)
            .map(h => ({
              label: `${h.household_code} - ${h.name}`,
              value: h.total_points,
              color: '#1B7A3D',
            }))
        ),

        new Paragraph({ spacing: { before: 300 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({
            text: '— End of Report —',
            font: 'Arial', size: 20, color: '999999', italics: true,
          })],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `TakaTrace-Household-Report-${new Date().toISOString().split('T')[0]}.docx`);
}

function summaryCard(label: string, value: string, color: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: 2400, type: WidthType.DXA },
    shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 150, right: 150 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: value, bold: true, font: 'Arial', size: 32, color })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: label, font: 'Arial', size: 16, color: '666666' })],
      }),
    ],
  });
}
