
window.addEventListener('load',async() => {
  try{
    const response = await axios.get("/api/posts")
    const data = response.data;
    outputPosts(data, document.querySelector(".postsContainer"))
  } catch(err){

  }
})


