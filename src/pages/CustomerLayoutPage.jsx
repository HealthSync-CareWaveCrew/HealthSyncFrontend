import { useState } from 'react';
import { Outlet } from 'react-router-dom';

function CustomerLayoutPage() {
  return (
    <div className="space-y-6">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <Outlet />
      </div>
    </div>
  );
}

export default CustomerLayoutPage;
