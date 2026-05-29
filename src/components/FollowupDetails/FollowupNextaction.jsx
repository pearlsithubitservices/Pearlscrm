import React from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  Repeat2,
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function NextActionPage() {

  const actions = [
    {
      label: "Call",
      icon: <Phone size={14} />,
      active: true,
    },
    {
      label: "Email",
      icon: <Mail size={14} />,
    },
    {
      label: "Whatsapp",
      icon: <MessageCircle size={14} />,
    },
    {
      label: "Note",
      icon: <StickyNote size={14} />,
    },
  ];

  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        w-full
       bg-[#f3f0eb] overflow-hidden
        "
      >
        {/* CONTENT */}

        <div className="p-6">

          <h1 className="text-xs font-bold tracking-wide text-[#999]">
            NEXT ACTION
          </h1>

          {/* FORM */}

          <div className="grid grid-cols-2 gap-8 mt-6">

            {/* FOLLOWUPS COUNT */}

            <div>

              <h1 className="text-[#0b2d59] font-bold mb-3">
                Follow-ups Count
              </h1>

              <div className="h-[55px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3">

                <Repeat2 size={18} className="text-[#b8b8b8]" />

                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-transparent outline-none text-[#999]"
                />

              </div>

            </div>

            {/* RESCHEDULE */}

            <div>

              <h1 className="text-[#0b2d59] font-bold mb-3">
                Reschedule Follow Up
              </h1>

              <div className="h-[55px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3">

                <CalendarDays
                  size={18}
                  className="text-[#b8b8b8]"
                />

                <input
                  type="text"
                  placeholder="e.g. Follow-up meeting on Friday"
                  className="w-full bg-transparent outline-none text-[#999]"
                />

              </div>

            </div>

            {/* TIME */}

            <div>

              <h1 className="text-[#0b2d59] font-bold mb-3">
                Reschedule Follow Up
              </h1>

              <div className="h-[55px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3">

                <Clock3 size={18} className="text-[#b8b8b8]" />

                <input
                  type="text"
                  placeholder="09:30:00 AM"
                  className="w-full bg-transparent outline-none text-[#999]"
                />

              </div>

            </div>

          </div>

          {/* NOTE BOX */}

          <textarea
            placeholder="Add a new note..."
            className="
            w-full
            h-[140px]
            mt-8
            bg-white
            border
            border-[#ebe7df]
            rounded-xl
            p-5
            outline-none
            resize-none
            text-[#777]
            "
          />

          {/* SAVE BUTTON */}

          <div className="flex justify-end mt-4">

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="
              px-5
              py-2
              rounded-full
              bg-[#3167dc]
              text-white
              text-sm
              font-medium
              "
            >
              Save
            </motion.button>

          </div>

          {/* TIMELINE */}

          <div className="mt-16 flex gap-4">

            {/* DOT */}

            <div className="w-4 h-4 rounded-full bg-[#3167dc] mt-2"></div>

            {/* CONTENT */}

            <div>

              <h1 className="text-[10px] md:text-[20px] font-bold text-[#0b2d59]">
                Rescheduled · Mar 21 · 09: 30 AM
              </h1>

              <p className="text-[#999] text-[16px] mt-2 leading-8">
                Product walkthrough completed. Key stakeholders attended.
                Very positive response from procurement team.
              </p>

              <p className="text-[#b2b2b2] mt-2 text-[17px]">
                Jun 3 · Priya S.
              </p>

            </div>

          </div>

        </div>

      </motion.div>

    </>
  );
}