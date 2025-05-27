const LANGUAGE_LINK = app.lang;

const axios = axios.create({
        baseURL: `https://${LANGUAGE_LINK}`,
        withCredentials: false,
    });
