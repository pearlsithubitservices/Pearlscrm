import { useEffect, useState } from "react";

export default function useLead(id) {

    const [lead, setLead] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchLead = async () => {

            try {

                setLoading(true);

                const response = await fetch(
                    `http://localhost:5000/api/leads/${id}`
                );

                const data = await response.json();

                setLead(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        if (id) {
            fetchLead();
        }

    }, [id]);

    return {
        lead,
        loading
    };

}