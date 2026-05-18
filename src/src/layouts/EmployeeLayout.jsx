import React, { useState } from 'react';

import EmployeeSidebar from
'../pages/employee/EmployeeSidebar';

export default function EmployeeLayout({
  children
}) {

  const [activeTab, setActiveTab] =
    useState('tasks');

  return (

    <div className="flex min-h-screen bg-[#070b14] text-white">


      <div className="flex-1 overflow-auto">

        {
          React.cloneElement(children, {
            activeTab,
            setActiveTab
          })
        }

      </div>

    </div>

  );

}