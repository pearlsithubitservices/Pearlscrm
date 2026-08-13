import { useEffect, useState } from "react";

export default function useLead(id) {

    const [lead, setLead] = useState({});
    const [fulllead, setFullLead] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchLead();
        }
        fetchfullLead()

    }, [id]);

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
    const fetchfullLead =
        async () => {

            try {

                const response =
                    await fetch(
                        'https://pearlscrm.onrender.com/api/leads'
                    );

                const data =
                    await response.json();

                setFullLead(data);

            } catch (error) {

                console.log(error);

            }

            finally {
                setLoading(false);
            }

        };

    return {
        lead,
        loading,
        fetchLead,
        fetchfullLead,
        fulllead,
    };

}