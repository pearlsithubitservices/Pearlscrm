import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ETasksNotes({tasks}) {

  // Existing notes list
  const [notes, setNotes] = useState([
    {
      title: "Budget confirmed verbally — $120K range",
      description:
        "Client confirmed budget in phone conversation. Wants implementation in 6 weeks post-signing.",
      date: "Jun 7 · Rohan M",
    },
    {
      title: "Competitor comparison requested",
      description:
        "Evaluating 2 other vendors. We're in the final 2. Need to highlight data security certifications.",
      date: "Jun 3 · Priya S.",
    },
    {
      title: "Budget confirmed verbally — $130K range",
      description:
        "Client confirmed budget in phone conversation. Wants implementation in 6 weeks post-signing.",
      date: "Jun 8 · Priya S.",
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Handle input change
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Add note
  function handleNote() {

    if (
      formData.title.trim() === "" ||
      formData.description.trim() === ""
    ) {
      alert("Fill all fields");
      return;
    }

    const newNote = {
      title: formData.title,
      description: formData.description,
      date: new Date().toLocaleString(),
    };

    // add new note to top
    setNotes([newNote, ...notes]);

    // clear inputs
    setFormData({
      title: "",
      description: "",
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f2ec] p-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto rounded-[30px]"
      >

        <div className="px-5 mt-5">

          {/* INPUT SECTION */}

          <div className="flex flex-col gap-4">

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title..."
              className="
              w-full
              bg-white
              rounded-2xl
              p-5
              outline-none
              "
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a new note..."
              className="
              w-full
              h-[120px]
              bg-white
              rounded-2xl
              p-5
              outline-none
              resize-none
              "
            />

            <div className="flex justify-end">

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: .95 }}
                onClick={handleNote}
                className="
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-full
                "
              >
                Add Note
              </motion.button>

            </div>

          </div>

          {/* NOTES TIMELINE */}

          <h2 className="font-bold text-gray-500 text-xl mt-10">
            PREVIOUS NOTES
          </h2>

          <div className="mt-10 relative">

            {/* Vertical line */}

            <div className="absolute top-0 left-[10px] h-full w-[2px] bg-gray-300"></div>

            {notes.map((item, index) => (

              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: -30
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: index * .1
                }}
                className="
                relative
                flex
                gap-6
                mb-10
                "
              >

                {/* Dot */}

                <div className="w-5 h-5 rounded-full bg-blue-600 mt-2 z-10"></div>

                {/* Content */}

                <div className="
                bg-white
                p-5
                rounded-xl
                shadow-sm
                w-full
                ">

                  <h1 className="
                  text-lg
                  font-bold
                  text-[#082f57]
                  ">
                    {item.title}
                  </h1>

                  <p className="
                  text-gray-500
                  mt-2
                  leading-7
                  ">
                    {item.description}
                  </p>

                  <p className="
                  text-sm
                  text-gray-400
                  mt-3
                  ">
                    {item.date}
                  </p>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </motion.div>

    </div>
  );
}