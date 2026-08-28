import React from 'react'

export default function StatCard({
  title,
  value,
  muted,
  icon,
  color,
  trend,
  trendType
}) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <div className="stat-content">
        <div className="stat-title">{title}</div>

        <div className="stat-value">{value}</div>

        {muted && (
          <div className={`stat-muted ${trendType || ''}`}>
            {trend && <span>{trend}</span>} {muted}
          </div>
        )}
      </div>
    </div>
  )
}