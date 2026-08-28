import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MessageSquare, Users, Settings, Zap, FileText, Cpu, UserCheck, Link } from 'lucide-react'

const items = [
  {to:'/', label:'Dashboard', icon:Home},
  {to:'/conversations', label:'Conversations', icon:MessageSquare},
  {to:'/contacts', label:'Contacts', icon:Users},
  {to:'/ai-assistant', label:'AI Assistant', icon:Cpu},
  {to:'/automation', label:'Automation Rules', icon:Zap},
  {to:'/templates', label:'Message Templates', icon:FileText},
  {to:'/ai', label:'AI Configuration', icon:Cpu},
  {to:'/reports', label:'Reports & Analytics', icon:FileText},
  {to:'/handoff', label:'Human Handoff', icon:UserCheck},
  {to:'/integrations', label:'Integrations', icon:Link},
  {to:'/settings', label:'Settings', icon:Settings},
]

export default function Sidebar(){
  return (
    <nav style={{display:'flex',flexDirection:'column',gap:10}}>
      {items.map(i=>{
        const Icon = i.icon
        return (
          <NavLink key={i.to} to={i.to} style={({isActive})=>({display:'flex',gap:10,alignItems:'center',padding:'8px 12px',borderRadius:8,color:isActive? '#fff':'#bcd3f7',background:isActive? 'rgba(255,255,255,0.03)':'transparent',textDecoration:'none'})}>
            <Icon size={16} />
            <span>{i.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
