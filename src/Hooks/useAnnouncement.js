import { useEffect, useState } from "react";
import apiUrl from "../config/api";

const API_URL = apiUrl("/announcement");

const useAnnouncement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 📥 GET ALL ANNOUNCEMENTS
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);

            const res = await fetch(API_URL);
            if (!res.ok) {
                throw new Error("Failed to fetch announcements");
            }

            const data = await res.json();
            setAnnouncements(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ➕ CREATE ANNOUNCEMENT
    const createAnnouncement = async (payload) => {
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to create announcement");
            }

            const newAnnouncement = await res.json();

            // update UI instantly
            setAnnouncements((prev) => [newAnnouncement, ...prev]);

            return newAnnouncement;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    //UPDATE ISREAD 
    const updateRead = async (id) => {
        try {
            const result = await fetch(`${API_URL}/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isRead: true, })
            });
            const date = await result.json();
            if (result.ok) {
                console.log("Mark as Read")
            }
            else {
                console.log("Dont Mark")
            }
        }
        catch (error) {
            console.error(error.message);
        }
    }

    //Delete announcement
    const deleteAnnouncement = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                setAnnouncements((prev) =>
                    prev.filter((item) => item._id !== id)
                );

                console.log(data.message);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    //PIN FUNCTION
    const togglePin = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}/pin`, {
                method: "PATCH",
            });

            const updated = await res.json();

            if (res.ok) {
                setAnnouncements((prev) =>
                    prev.map((item) =>
                        item._id === id ? updated : item
                    )
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return {
        announcements,
        loading,
        error,
        fetchAnnouncements,
        createAnnouncement,
        updateRead,
        togglePin,
        deleteAnnouncement,
    };
};



export default useAnnouncement;