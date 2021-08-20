
window.addEventListener('load',async() => {
  try{
    const response = await axios.get("/api/posts?followingOnly=true")
    const data = response.data;
    outputPosts(data, document.querySelector(".postsContainer"))
  } catch(err){
    console.log(err)
  } 
})


