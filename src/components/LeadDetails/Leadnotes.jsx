import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useLead from "../../Hooks/useLead";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";

export default function LeadNotesPage() {
  const { addNote, fetchLead, lead, deleteNote } = useLead();
  const { id } = useParams();

  // Existing notes list
  const [notes, setNotes] = useState([]);
  console.log(notes);


  // useEffect(() => {
  //   const fetchlead = async () => {
  //     try {
  //      const note = await fetchLead();
  //      conosole.log(note);
  //      setNotes(note.leadnotes);
  //     }
  //     catch (error) {
  //       console.log(error.message);
  //     }
  //   }
  //   fetchlead();

  // }, []);
  useEffect(() => {
    fetchleads();
  }, []);

  const fetchleads =
    async () => {


      try {

        const response =
          await fetch(
            "https://pearlscrm.onrender.com/api/leads"
          );

        const data =
          await response.json();

        console.log(data);
        setNotes(data);

      } catch (error) {

        console.log(error);

      }


    };
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


  const currentNotes = notes.find((item) => (
    item._id == id
  ));
  console.log(currentNotes?.leadnotes);
  // Add note

  const handleaddNote = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Fill all fields");
      return;
    }

    try {
      const updatedLead = await addNote(id, {
        title: formData.title,
        description: formData.description,
      });
      await fetchleads(); // Refresh leads
      console.log(updatedLead.leadnotes);

      // setNotes(updatedLead.leadnotes);

      setFormData({
        title: "",
        description: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const updatedLead = await deleteNote(id, noteId);

      // Update the lead in state
      await fetchleads();

    } catch (error) {
      console.log(error);
    }
  };
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
                onClick={handleaddNote}
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

            {currentNotes?.leadnotes?.length > 0 > 0 ? currentNotes?.leadnotes?.map((item, index) => (

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

                <X className="absolute top-2 right-2 text-red-600" onClick={() => handleDeleteNote(item._id)} />
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

            ))
              :
              <p>
                No notes</p>}

          </div>

        </div>

      </motion.div>

    </div>
  );
}