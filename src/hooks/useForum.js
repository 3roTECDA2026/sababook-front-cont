// src/hooks/useForums.js
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../environments/api";

export const useForums = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        fetch(`${API_BASE_URL}/api/v1/foro`, { signal })
            .then((res) => {
                if (!res.ok) throw new Error("Error al cargar los foros");
                return res.json();
            })
            .then((data) => {
                setForums(data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                console.error(err);
                setError(err.message);
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    return { forums, loading, error };
};
