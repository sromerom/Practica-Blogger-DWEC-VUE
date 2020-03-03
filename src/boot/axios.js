import Vue from "vue";
import axios from "axios";

Vue.prototype.$axios = axios;

export default async ({ Vue, router }) => {
    // Add a request interceptor
    axios.interceptors.request.use(
        function (config) {
            // Do something before request is sent
            //axios.defaults.withCredentials = true;
            axios.defaults.headers.common["Authorization"] = 'Bearer' + localStorage.getItem('tokenAccess');

            console.log("Entra interceptor request");
            return config;
        },
        function (error) {
            // Do something with request error
            console.log("Entra interceptor request error");
            return Promise.reject(error);
        }
    );

    // Add a response interceptor
    axios.interceptors.response.use(
        function (response) {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            console.log("Entra interceptor response");
            return response;
        },
        function (error) {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            console.log("Entra interceptor response error");

            //beforeeach en index.js router
            router.push("/");
            return Promise.reject(error);
        }
    );
};
