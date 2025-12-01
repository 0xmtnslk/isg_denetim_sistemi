import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { AnswerType } from '@prisma/client';

@Injectable()
export class PdfService {
  async generateAuditReport(audit: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    const html = this.generateHtmlReport(audit);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();
    return Buffer.from(pdf);
  }

  private generateHtmlReport(audit: any): string {
    // Bölüm bazında skorları hesapla
    const sectionScores = this.calculateSectionScores(audit);

    // Cevap dağılımını hesapla
    const answerDistribution = this.calculateAnswerDistribution(audit);

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>İSG Denetim Raporu - ${audit.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .header h1 {
      font-size: 24pt;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 12pt;
      opacity: 0.9;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #2a5298;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .score-summary {
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: center;
    }
    .score-value {
      font-size: 48pt;
      font-weight: bold;
      color: ${this.getScoreColor(audit.totalScore)};
      margin: 10px 0;
    }
    .score-label {
      font-size: 14pt;
      color: #666;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-header {
      background: #2a5298;
      color: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
    }
    .section-score {
      font-size: 16pt;
      font-weight: bold;
    }
    .question-block {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .question-text {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      font-size: 11pt;
    }
    .answer-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 9pt;
      margin-bottom: 10px;
    }
    .badge-karsilyor {
      background: #d4edda;
      color: #155724;
    }
    .badge-kismen {
      background: #fff3cd;
      color: #856404;
    }
    .badge-karsilamiyor {
      background: #f8d7da;
      color: #721c24;
    }
    .badge-kapsam-disi {
      background: #e2e3e5;
      color: #383d41;
    }
    .explanation {
      background: #f8f9fa;
      padding: 10px;
      border-left: 3px solid #ffc107;
      margin-top: 10px;
      font-size: 9pt;
    }
    .photos {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .photo-item {
      font-size: 9pt;
      color: #666;
      background: #f1f3f5;
      padding: 5px 10px;
      border-radius: 4px;
    }
    .chart-container {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .chart-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 15px;
      color: #2a5298;
    }
    .bar-chart {
      margin: 20px 0;
    }
    .bar-item {
      margin-bottom: 15px;
    }
    .bar-label {
      font-size: 10pt;
      margin-bottom: 5px;
      color: #555;
    }
    .bar-container {
      background: #e9ecef;
      border-radius: 4px;
      height: 30px;
      position: relative;
      overflow: hidden;
    }
    .bar-fill {
      background: linear-gradient(90deg, #2a5298, #1e3c72);
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-weight: bold;
      font-size: 9pt;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }
    th {
      background: #f8f9fa;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>İSG Saha Denetimi Raporu</h1>
    <p>Denetim No: ${audit.id}</p>
  </div>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Grup:</span>
      <span>${audit.facility.group.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Tesis:</span>
      <span>${audit.facility.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Adres:</span>
      <span>${audit.facility.address || '-'} ${audit.facility.city || ''}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Denetim Tarihi:</span>
      <span>${new Date(audit.auditDate).toLocaleDateString('tr-TR')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Denetçi:</span>
      <span>${audit.auditor.fullName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Şablon:</span>
      <span>${audit.template.name}</span>
    </div>
  </div>

  <div class="score-summary">
    <div class="score-label">Genel Denetim Skoru</div>
    <div class="score-value">${audit.totalScore?.toFixed(2) || '0.00'}%</div>
  </div>

  <div class="chart-container">
    <div class="chart-title">Bölüm Bazında Skorlar</div>
    <div class="bar-chart">
      ${Object.entries(sectionScores)
        .map(
          ([sectionName, score]: [string, any]) => `
        <div class="bar-item">
          <div class="bar-label">${sectionName}</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${score.percentage}%">
              ${score.percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>

  <div class="chart-container">
    <div class="chart-title">Cevap Dağılımı</div>
    <table>
      <thead>
        <tr>
          <th>Cevap Tipi</th>
          <th>Adet</th>
          <th>Oran</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(answerDistribution)
          .map(
            ([type, data]: [string, any]) => `
          <tr>
            <td>${this.getAnswerTypeLabel(type)}</td>
            <td>${data.count}</td>
            <td>${data.percentage.toFixed(1)}%</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  ${this.generateDetailedQuestions(audit)}

  <div class="footer">
    <p>Bu rapor İSG Denetim Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    <p>Oluşturma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
  </div>
</body>
</html>
    `;
  }

  private calculateSectionScores(audit: any): { [sectionName: string]: { earned: number; max: number; percentage: number } } {
    const sectionScores: { [sectionName: string]: { earned: number; max: number; percentage: number } } = {};

    for (const answer of audit.answers) {
      const sectionName = answer.question.category.section.name;

      if (!sectionScores[sectionName]) {
        sectionScores[sectionName] = { earned: 0, max: 0, percentage: 0 };
      }

      // Kapsam dışı sorular hesaplamaya dahil edilmez
      if (answer.answerType === AnswerType.KAPSAM_DISI) {
        continue;
      }

      const twScore = answer.question.twScore;
      sectionScores[sectionName].max += twScore * 3;

      let multiplier = 0;
      if (answer.answerType === AnswerType.KARSILYOR) {
        multiplier = 3;
      } else if (answer.answerType === AnswerType.KISMEN_KARSILYOR) {
        multiplier = 1;
      }

      sectionScores[sectionName].earned += twScore * multiplier;
    }

    // Yüzdeleri hesapla
    for (const sectionName in sectionScores) {
      const section = sectionScores[sectionName];
      section.percentage = section.max > 0 ? (section.earned / section.max) * 100 : 0;
    }

    return sectionScores;
  }

  private calculateAnswerDistribution(audit: any): { [type: string]: { count: number; percentage: number } } {
    const distribution = {
      KARSILYOR: { count: 0, percentage: 0 },
      KISMEN_KARSILYOR: { count: 0, percentage: 0 },
      KARSILAMIYOR: { count: 0, percentage: 0 },
      KAPSAM_DISI: { count: 0, percentage: 0 },
    };

    const total = audit.answers.length;

    for (const answer of audit.answers) {
      distribution[answer.answerType].count++;
    }

    for (const type in distribution) {
      distribution[type].percentage = total > 0 ? (distribution[type].count / total) * 100 : 0;
    }

    return distribution;
  }

  private generateDetailedQuestions(audit: any): string {
    // Bölüm bazında grupla
    const sections: { [sectionName: string]: any[] } = {};

    for (const answer of audit.answers) {
      const sectionName = answer.question.category.section.name;
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(answer);
    }

    let html = '';

    for (const [sectionName, answers] of Object.entries(sections)) {
      const sectionScore = this.calculateSectionScores(audit)[sectionName];
      
      html += `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${sectionName}</div>
            <div class="section-score">${sectionScore.percentage.toFixed(1)}%</div>
          </div>
      `;

      for (const answer of answers) {
        html += `
          <div class="question-block">
            <div class="question-text">
              ${answer.question.text}
              <span style="color: #6c757d; font-weight: normal; font-size: 9pt;">
                (TW Skoru: ${answer.question.twScore})
              </span>
            </div>
            <div class="answer-badge badge-${this.getAnswerBadgeClass(answer.answerType)}">
              ${this.getAnswerTypeLabel(answer.answerType)}
            </div>
            ${
              answer.explanation
                ? `<div class="explanation"><strong>Açıklama:</strong> ${answer.explanation}</div>`
                : ''
            }
            ${
              answer.photos && answer.photos.length > 0
                ? `
              <div class="photos">
                ${answer.photos.map((photo: any) => `<div class="photo-item">📷 ${photo.originalName}</div>`).join('')}
              </div>
            `
                : ''
            }
          </div>
        `;
      }

      html += `</div>`;
    }

    return html;
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  }

  private getAnswerTypeLabel(type: string): string {
    const labels = {
      KARSILYOR: 'Karşılıyor',
      KISMEN_KARSILYOR: 'Kısmen Karşılıyor',
      KARSILAMIYOR: 'Karşılamıyor',
      KAPSAM_DISI: 'Kapsam Dışı',
    };
    return labels[type] || type;
  }

  private getAnswerBadgeClass(type: string): string {
    const classes = {
      KARSILYOR: 'karsilyor',
      KISMEN_KARSILYOR: 'kismen',
      KARSILAMIYOR: 'karsilamiyor',
      KAPSAM_DISI: 'kapsam-disi',
    };
    return classes[type] || '';
  }
}
