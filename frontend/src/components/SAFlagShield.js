import React from 'react';

const SAFlagShield = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative ${className} rounded-lg overflow-hidden shadow-md`}>
      <img 
        src="https://customer-assets.emergentagent.com/job_roaddocs/artifacts/slve1ri1_image.png"
        alt="South African Flag"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default SAFlagShield;
