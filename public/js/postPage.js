
window.addEventListener('load',async() => {
  try{
    const response = await axios.get("/api/posts/" + postId);
    const data = response.data;
    outputPostsWithReplies(data, document.querySelector(".postsContainer"))
  } catch(err){

  }
})


