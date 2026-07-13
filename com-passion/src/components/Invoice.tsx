import React, { forwardRef } from 'react';
import { formatVND } from '../data/types';
import type { Report } from '../data/types';
import './Invoice.css';

interface InvoiceProps {
  report: Report;
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ report }, ref) => {
  const date = new Date();
  const printDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <div className="invoice-wrapper" ref={ref}>
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-logo">
            <span className="logo-icon">🌿</span>
            <div className="logo-text">
              <h1>com-passion</h1>
              <p>Lan tỏa yêu thương, gìn giữ văn hoá</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2>BÁO CÁO MINH BẠCH & SAO KÊ</h2>
            <p><strong>Mã báo cáo:</strong> {report.id.toUpperCase()}</p>
            <p><strong>Ngày xuất:</strong> {printDate}</p>
            <p><strong>Kỳ báo cáo:</strong> {report.period}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="invoice-divider" />

        {/* Summary */}
        <div className="invoice-summary">
          <h3>1. TỔNG QUAN HOẠT ĐỘNG</h3>
          <p>{report.summary}</p>
          <div className="total-box">
            <span>Tổng Dòng Tiền (Tổng Thu)</span>
            <strong>{formatVND(report.totalRaised)}</strong>
          </div>
        </div>

        {/* Allocations Table */}
        <div className="invoice-details">
          <h3>2. CHI TIẾT PHÂN BỔ DÒNG TIỀN</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Khoản Mục</th>
                <th className="text-right">Tỷ lệ</th>
                <th className="text-right">Số Tiền (VND)</th>
              </tr>
            </thead>
            <tbody>
              {report.allocations.map((a, index) => {
                const percentage = report.totalRaised > 0 
                  ? Math.round((a.amount / report.totalRaised) * 100) 
                  : 0;
                return (
                  <tr key={a.label}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="color-dot" style={{ backgroundColor: a.color }}></span>
                      {a.label}
                    </td>
                    <td className="text-right">{percentage}%</td>
                    <td className="text-right">{formatVND(a.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-right"><strong>TỔNG CỘNG</strong></td>
                <td className="text-right"><strong>100%</strong></td>
                <td className="text-right"><strong>{formatVND(report.totalRaised)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer / Signature */}
        <div className="invoice-footer">
          <p className="thank-you">
            Chân thành cảm ơn bạn đã đồng hành cùng <strong>com-passion</strong> mang lại những giá trị tích cực cho cộng đồng.
          </p>
          <div className="signature-area">
            <p className="location-date">Đắk Lắk, ngày {date.getDate()} tháng {date.getMonth() + 1} năm {date.getFullYear()}</p>
            <p className="role">Đại diện dự án</p>
            <div className="signature-space">
              <span className="stamp">com-passion<br/>Verified</span>
            </div>
            <p className="name"><strong>Dự án com-passion</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
