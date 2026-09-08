import React from 'react'

export default function SearchBar({value,onChange,placeholder}){
  return (
    <div className="search">
      <input value={value} onChange={e=>onChange && onChange(e.target.value)} placeholder={placeholder||'Search'} style={{flex:1,padding:8,borderRadius:8,border:'none',background:'rgba(255,255,255,0.03)',color:'#e6eef8'}} />
    </div>
  )
}
