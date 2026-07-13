import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { FileText } from 'lucide-react';
import type { Report } from '../data/types';
import { formatVND } from '../data/types';
import Invoice from './Invoice';

interface Props {
  report: Report;
  variants: any;
}

export default function ReportCard({ report, variants }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: report.invoiceLabel?.replace('.pdf', '') || `Hoa_don_sao_ke_${report.id}`,
  });

  return (
    <motion.article variants={variants} className="report card">
      <header className="report__head">
        <div>
          <span className="chip chip--green">{report.period}</span>
          <h3>{report.title}</h3>
          <p className="muted">{report.summary}</p>
        </div>
        <div className="report__total">
          <span className="muted">Tổng dòng tiền</span>
          <strong>{formatVND(report.totalRaised)}</strong>
        </div>
      </header>

      <div className="report__bar" role="img" aria-label="Phân bổ dòng tiền">
        {report.allocations.map((a) => (
          <motion.span
            initial={{ flex: 0 }}
            whileInView={{ flex: a.amount }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            key={a.label}
            className="report__seg"
            style={{ background: a.color }}
            title={`${a.label}: ${formatVND(a.amount)}`}
          />
        ))}
      </div>

      <ul className="report__legend">
        {report.allocations.map((a) => (
          <li key={a.label}>
            <span className="dot" style={{ background: a.color }} />
            <span>{a.label}</span>
            <strong>{formatVND(a.amount)}</strong>
            <span className="muted">
              {report.totalRaised > 0 ? Math.round((a.amount / report.totalRaised) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>

      <footer className="report__foot">
        <button className="btn btn--ghost interactive" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} /> 
          In / Lưu PDF ({report.invoiceLabel || 'Hoá đơn & Sao kê'})
        </button>
      </footer>

      {/* Hidden printable invoice */}
      <Invoice ref={componentRef} report={report} />
    </motion.article>
  );
}
