import { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import { ShieldCheck, CalendarDays } from 'lucide-react';
import { getProfile } from '../../../services/profileApi';

const Verification = () => {
  const [verification, setVerification] = useState({});
  useEffect(() => { getProfile().then(({ data }) => setVerification(data.user?.profile?.verification || {})).catch(() => undefined); }, []);
  const verifiedDate = verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleDateString() : 'Not available';
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl border shadow-sm p-6"
       >
        <h2 className="text-2xl font-bold text-[#0b2b57]">
          Verification & Security
        </h2>

        <p className="text-gray-500 mt-1">
          Bank account verification status and security settings
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div className="border rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-[#0b2b57] text-xl uppercase">
              Account Status
            </h4>

            <div className="flex items-center gap-2 mt-4 text-green-600 font-semibold">
              <ShieldCheck size={18} />
              {verification.status || 'Not verified'}
            </div>

            <p className="text-gray-500 text-sm mt-2">
              Verified on {verifiedDate}
            </p>
          </div>

          <div className="border rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-[#0b2b57] text-xl uppercase">
              Last Updated
            </h4>

            <div className="flex items-center gap-2 mt-4 text-[#0b2b57] font-semibold">
              <CalendarDays size={18} />
              {verifiedDate}
            </div>

            <p className="text-gray-500 text-sm mt-2">
              Verified on {verifiedDate}
            </p>
          </div>

        </div>
      </motion.div>
  )
}

export default Verification