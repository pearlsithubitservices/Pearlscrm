import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TaskActivity({tasks}) {

  // Existing notes list
  const [activities, setActivities] = useState([
    {
      title: "Budget confirmed verbally — $120K range",
      description:
        "Client confirmed budget in phone conversation. Wants implementation in 6 weeks post-signing.",
      date: "Jun 7",
      empName: " Rohan M",
      time:"4 min",
    },
    {
      title: "Competitor comparison requested",
      description:
        "Evaluating 2 other vendors. We're in the final 2. Need to highlight data security certifications.",
      date: "Jun 3",
      empName:" Priya S.",
      time:"14 min",
    },
    {
      title: "Budget confirmed verbally — $130K range",
      description:
        "Client confirmed budget in phone conversation. Wants implementation in 6 weeks post-signing.",
      date: "Jun 8",
      empName:"Priya S.",
      time:"5 min",
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time:"",
    empName:"",
  });

  // Handle input change
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Add note
  function handleActivity() {

    if (
      formData.title.trim() === "" ||
      formData.description.trim() === ""
    ) {
      alert("Fill all fields");
      return;
    }

    const newActivity = {
      title: formData.title,
      description: formData.description,
      date: new Date().toLocaleString(),
      time:formData.time,
      empName:formData.empName,
    };

    // add new note to top
    setActivities([newActivity, ...activities]);

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

          

          {/* NOTES TIMELINE */}

          <h2 className="font-bold text-gray-500 text-xl mt-10">
            ACTIVITY TIMELINE
          </h2>

          <div className="mt-10 relative">

            {/* Vertical line */}

            <div className="absolute top-0 left-[10px] h-full w-[2px] bg-gray-300"></div>

            {activities.map((item, index) => (

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
                    {item.title} - {item.time}
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
                    {item.date} - {item.empName}
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