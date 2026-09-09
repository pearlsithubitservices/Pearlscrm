import React from 'react'

export default function StatusBadge({status}){
  const cls = status==='Completed' ? 'status-completed' : 'status-inprogress'
  return <span className={`badge ${cls}`}>{status}</span>
}
