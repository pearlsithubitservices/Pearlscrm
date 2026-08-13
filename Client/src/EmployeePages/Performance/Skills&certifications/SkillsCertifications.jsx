import React from "react";
import { motion } from "framer-motion";
import { SquarePen } from "lucide-react";
import Skills from "./Skills";
import Certifications from "./Certifications";





export default function SkillsCertifications() {
  return (
    <div className="p-6 bg-stone-100 min-h-screen">
      {/* Header */}
      <Skills/>

      {/* Certifications */}
      <Certifications/>
    </div>
  );
}