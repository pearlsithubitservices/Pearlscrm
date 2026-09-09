import React from 'react'

export default function Modal({children,onClose}){
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}} onClick={onClose}>
      <div style={{background:'#072135',padding:20,borderRadius:8,minWidth:320}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
