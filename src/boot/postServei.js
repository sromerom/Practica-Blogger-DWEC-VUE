import { Post } from "../boot/post.js";
const axios = require("axios").default;

export async function getBlogId() {
  let response = await axios({
    method: "GET",
    url: "https://www.googleapis.com/blogger/v3/users/self/blogs",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("tokenAccess")
    }
  });

  return response.data.items[0].id;
}

//------------------------------------------------------------------------------------------------
