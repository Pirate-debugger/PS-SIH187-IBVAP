// Generates print-ready tactical SSB Incident Dossier HTML window for PDF / Print export

export function exportIncidentDossier(incident) {
  if (!incident) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to export the incident dossier.");
    return;
  }

  const objectsListHtml = incident.objects_involved.map(obj => `<li><strong>${obj}</strong></li>`).join('');
  const sopStepsHtml = incident.sop_steps.map((step, idx) => `
    <li style="margin-bottom: 6px;">
      <span style="color: #007799; font-weight: bold;">[Step ${idx + 1}]</span> ${step}
    </li>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>IBVAP-DOSSIER-${incident.incident_id}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          margin: 30px;
          line-height: 1.5;
        }
        .header {
          border-bottom: 3px solid #002b49;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          color: #002b49;
          text-transform: uppercase;
        }
        .subtitle {
          font-size: 13px;
          color: #555;
          margin-top: 4px;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          color: #fff;
          background: ${incident.severity === 'CRITICAL' ? '#d32f2f' : incident.severity === 'HIGH' ? '#e65100' : '#f57c00'};
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f4f6f9;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
        }
        .meta-item {
          font-size: 14px;
        }
        .meta-label {
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
        }
        .evidence-section {
          margin-bottom: 24px;
        }
        .evidence-img {
          width: 100%;
          max-width: 600px;
          border: 2px solid #ccc;
          border-radius: 4px;
          display: block;
          margin-top: 8px;
        }
        .sop-section {
          background: #eef7fa;
          border-left: 4px solid #0288d1;
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 24px;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #ccc;
          padding-top: 12px;
          font-size: 11px;
          color: #777;
          text-align: center;
        }
        @media print {
          body { margin: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #002b49; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <div>
          <div class="title">MINISTRY OF HOME AFFAIRS — SASHASTRA SEEMA BAL (SSB)</div>
          <div class="subtitle">IBVAP 2.0 AI Video Analytics Incident Investigation Dossier</div>
        </div>
        <div>
          <span class="badge">${incident.severity} SEVERITY</span>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Incident ID</div>
          <div style="font-size: 16px; font-weight: bold;">${incident.incident_id}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Timestamp (IST)</div>
          <div>${incident.timestamp}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Border Outpost & Camera</div>
          <div><strong>${incident.camera_id}</strong> (${incident.camera_name})</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Location / Grid Reference</div>
          <div>${incident.location_str}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Event Classification</div>
          <div><strong style="color: #c62828;">${incident.event_type.replace(/_/g, ' ')}</strong></div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Movement Vector & Speed</div>
          <div>${incident.movement_vector} (Dwell: ${incident.duration_sec}s)</div>
        </div>
      </div>

      <div class="evidence-section">
        <h3 style="margin-top: 0; color: #002b49;">📸 Automated Keyframe Surveillance Evidence</h3>
        <img src="${incident.snapshot_url}" alt="Keyframe Evidence" class="evidence-img" onerror="this.style.display='none'" />
      </div>

      <div class="sop-section">
        <h3 style="margin-top: 0; color: #0288d1;">📋 ${incident.sop_title}</h3>
        <ol style="padding-left: 20px; margin-bottom: 0;">
          ${sopStepsHtml}
        </ol>
      </div>

      <div>
        <h3 style="color: #002b49;">🎯 Identified Target Entities</h3>
        <ul>
          ${objectsListHtml}
        </ul>
      </div>

      <div class="footer">
        CONFIDENTIAL — FOR SSB COMMAND & OPERATIONAL USE ONLY | GENERATED BY IBVAP 2.0 AI SURVEILLANCE MATRIX
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
