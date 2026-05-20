import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';

const AnimateModals = ({ children }) => {
    return (
        <AnimatePresence>



            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}

                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 "
            >

                {/* Modal */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 100,
                        scale: 0.9
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1
                    }}
                    exit={{
                        opacity: 0,
                        y: 100,
                        scale: 0.9
                    }}
                    transition={{
                        duration: .4
                    }}

                    className="w-full max-w-3xl max-h-screen overflow-y-auto no-scrollbar "
                >


                    {children}

                </motion.div>

            </motion.div>



        </AnimatePresence>
    )
}

export default AnimateModals