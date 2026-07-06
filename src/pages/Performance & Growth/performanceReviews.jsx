import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    SquarePen,
    Bell,
    Star,
} from "lucide-react";
import useReview from "../../Hooks/useReview";
import { useParams } from "react-router-dom";

export default function PerformanceReviews() {
    // Sample Data
    // const reviews = [
    //     {
    //         id: 1,
    //         employee: "Sandra Blake",
    //         role: "HR Manager",
    //         category: "Annual Review",
    //         title: "Meets Expectations",
    //         rating: 4.2,
    //         reviewDate: "Dec 15, 2025",
    //         avatar:
    //             "https://randomuser.me/api/portraits/women/44.jpg",
    //         description:
    //             "Ravi has shown outstanding growth this year. His technical depth, communication, and initiative on the mobile app project were commendable. Encourage him to take on more cross-team leadership.",
    //     },
    //     {
    //         id: 2,
    //         employee: "Rahul Nair",
    //         role: "Sales Manager",
    //         category: "Mid-Year Review",
    //         title: "Meets Expectations",
    //         rating: 3.2,
    //         reviewDate: "Dec 15, 2025",
    //         avatar:
    //             "https://randomuser.me/api/portraits/men/32.jpg",
    //         description:
    //             "Ravi has shown outstanding growth this year. His technical depth, communication, and initiative on the mobile app project were commendable. Encourage him to take on more cross-team leadership.",
    //     },
    //     {
    //         id: 3,
    //         employee: "Sandra Blake",
    //         role: "Product Manager",
    //         category: "Annual Review",
    //         rating: 4.2,
    //         title: "Meets Expectations",
    //         reviewDate: "Dec 15, 2025",
    //         avatar:
    //             "https://randomuser.me/api/portraits/women/44.jpg",
    //         description:
    //             "Ravi has shown outstanding growth this year. His technical depth, communication, and initiative on the mobile app project were commendable. Encourage him to take on more cross-team leadership.",
    //     },
    // ];

    const { id } = useParams();


    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const { review, getReviews } = useReview();
    console.log(review);

    const currentReviews = review.filter((review) => {
        return (
            review.id === id ||
            review.employee_uid === id
        );
    });

    console.log(currentReviews);
    const filteredReviews = useMemo(() => {
        return review.filter((review) => {
            const matchesSearch =
                review?.employee?.toLowerCase()?.includes(search.toLowerCase()) ||
                review?.title?.toLowerCase()?.includes(search.toLowerCase());

            const matchesCategory =
                category === "All Categories" ||
                review?.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [review, search, category]);

    return (
        <div className="min-h-screen bg-[#F8F5EF] p-4">

            {/* Header */}

            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl shadow-sm px-6 py-5 mb-6">

                <h1 className="text-[22px] font-bold text-black">
                    All performance reviews
                </h1>

                <div className="flex flex-wrap items-center gap-4">

                    {/* Search */}

                    <div className="relative">

                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search Goals..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="
                w-64
                h-11
                rounded-xl
                bg-[#F5F5F5]
                pl-12
                pr-4
                outline-none
                border
                border-transparent
                focus:border-blue-500
              "
                        />

                    </div>

                    {/* Category */}

                    <div className="relative">

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            className="
                appearance-none
                h-11
                w-44
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                pr-10
                outline-none
              "
                        >
                            <option>All Categories</option>
                            <option>Annual Review</option>
                            <option>Mid-Year Review</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                    {/* Add Review */}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="
              h-11
              px-5
              rounded-xl
              bg-[#EDF3FF]
              flex
              items-center
              gap-2
              text-[#314A67]
              font-medium
            "
                    >
                        <SquarePen size={18} />
                        Add Review
                    </motion.button>

                </div>

            </header>


            <div className="space-y-5">

                {filteredReviews.map((review, index) => (

                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                        }}
                        whileHover={{
                            y: -3,
                            scale: 1.01,
                        }}
                        className="
        bg-white
        rounded-2xl
        border
        border-[#D7D7D7]
        shadow-sm
        p-5
      "
                    >

                        {/* Top Section */}

                        <div className="flex justify-between items-start">

                            {/* Left */}

                            <div className="flex gap-4">

                                <img
                                    src={review.avatar}
                                    alt={review.employee}
                                    className="
              w-16
              h-16
              rounded-full
              object-cover
              border
              border-gray-200
            "
                                />

                                <div>

                                    <h2 className="text-[24px] font-bold text-[#163C67]">
                                        {review.employee}
                                    </h2>

                                    <p className="text-[17px] text-gray-600">
                                        {review.role}
                                    </p>

                                </div>

                            </div>

                            {/* Right */}

                            <div className="flex flex-col items-end">

                                {/* Stars */}

                                <div className="flex items-center gap-1">

                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.div
                                            key={star}
                                            whileHover={{ scale: 1.2 }}
                                        >
                                            <Star
                                                size={30}
                                                strokeWidth={2}
                                                className={
                                                    star <= Math.floor(review.rating)
                                                        ? "text-[#4F8CF8] fill-[#4F8CF8]"
                                                        : "text-[#4F8CF8]"
                                                }
                                            />
                                        </motion.div>
                                    ))}

                                    <span className="ml-3 text-[34px] font-semibold text-[#4F8CF8]">
                                        {review.rating}
                                    </span>

                                </div>

                                <p className="mt-8 text-[17px] text-gray-400">
                                    {review.reviewDate}
                                </p>

                            </div>

                        </div>

                        {/* Review Title */}

                        <h3 className="mt-6 text-[20px] font-semibold text-black">

                            {review.title}

                            <span className="font-normal">
                                {" "}
                                — {review.category}
                            </span>

                        </h3>

                        {/* Description */}

                        <p className="mt-3 text-[18px] leading-7 text-gray-500">

                            {review.description}

                        </p>

                    </motion.div>

                ))}

            </div>

        </div>
    );
}