import { useEffect, useState } from "react";

export default function useTaxDocument() {

    const API = "https://pearlscrm.onrender.com/api/taxdocuments";

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    // =========================
    // GET ALL
    // =========================

    const fetchDocuments = async () => {

        try {

            setLoading(true);

            const res = await fetch(API);

            const data = await res.json();

            setDocuments(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDocuments();

    }, []);

    // =========================
    // CREATE
    // =========================

    const addDocument = async (documentData) => {

        const formData = new FormData();

        Object.keys(documentData).forEach((key) => {

            if (
                documentData[key] !== null &&
                documentData[key] !== undefined
            ) {

                formData.append(key, documentData[key]);

            }

        });

        const res = await fetch(API, {

            method: "POST",

            body: formData,

        });

        const data = await res.json();

        setDocuments((prev) => [data, ...prev]);

        return data;

    };

    // =========================
    // UPDATE
    // =========================

    const updateDocument = async (id, updatedData) => {

        const formData = new FormData();

        Object.keys(updatedData).forEach((key) => {

            if (
                updatedData[key] !== null &&
                updatedData[key] !== undefined
            ) {

                formData.append(key, updatedData[key]);

            }

        });

        const res = await fetch(`${API}/${id}`, {

            method: "PUT",

            body: formData,

        });

        const data = await res.json();

        setDocuments((prev) =>
            prev.map((doc) =>
                doc._id === id ? data : doc
            )
        );

        return data;

    };

    // =========================
    // DELETE
    // =========================

    const deleteDocument = async (id) => {

        await fetch(`${API}/${id}`, {

            method: "DELETE",

        });

        setDocuments((prev) =>
            prev.filter((doc) => doc._id !== id)
        );

    };

    // =========================
    // GET SINGLE
    // =========================

    const getDocument = async (id) => {

        const res = await fetch(`${API}/${id}`);

        return await res.json();

    };

    return {

        documents,

        loading,

        fetchDocuments,

        addDocument,

        updateDocument,

        deleteDocument,

        getDocument,

    };

}