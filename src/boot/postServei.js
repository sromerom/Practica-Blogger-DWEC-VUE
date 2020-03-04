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

export async function getPost(blogId) {
  const url = 'https://www.googleapis.com/blogger/v3/blogs/' + blogId + '/posts';

  let response = await axios({
    method: "GET",
    url: url,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("tokenAccess")
    }
  });

  let fetchToObject = response.data.items.map(post => {
    return new Post(post.id, post.blog.id, post.author, post.published, post.updated, post.url, post.title, post.content, post.labels);
  })

  return fetchToObject;

}


export async function createPost(post) {

  const idBlog = await getBlogId();
  const url = `https://www.googleapis.com/blogger/v3/blogs/${idBlog}/posts/`;
  const toJSON = JSON.stringify({
    "kind": "blogger#post",
    "blog": {
      "id": idBlog
    },
    "title": post.title,
    "content": post.content,
    "labels": post.labels
  });

  await axios({
    method: "POST",
    url: url,
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem("tokenAccess"),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: toJSON
  });
}

export async function deletePost(idBlog, idPost) {

  const url = `https://www.googleapis.com/blogger/v3/blogs/${idBlog}/posts/${idPost}`;

  await axios({
    method: "DELETE",
    url: url,
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem("tokenAccess"),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

export async function updatePost(post) {

  const url = `https://www.googleapis.com/blogger/v3/blogs/${post.idBlog}/posts/${post.idPost}`;

  const toJSON = JSON.stringify({
    "id": post.idPost,
    "kind": "blogger#post",
    "blog": {
      "id": post.idBlog
    },
    "author": post.author,
    "published": post.published,
    "url": post.url,
    "selfLink": url,
    "title": post.title,
    "content": post.content,
    "labels": post.labels
  });


  await axios({
    method: "PUT",
    url: url,
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem("tokenAccess"),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: toJSON
  });
}

//Language API

export async function getLanguages() {
  let response = await axios({
    method: "POST",
    url: "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    data: JSON.stringify({
      MethodName: 'languages',
      params: ''
    }),
  });

  return response;
}

export async function translate(source, target, text) {
  let response = await axios({
    method: 'POST',
    url: "http://server247.cfgs.esliceu.net/bloggeri18n/blogger.php",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    data: JSON.stringify({
      MethodName: 'translate',
      params: {
        source: source,
        target: target,
        text: text
      }
    }),
  });

  return response;
}