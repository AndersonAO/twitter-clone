
window.addEventListener('load',async() => {
  try{
    const response = await axios.get("/api/posts")
    const data = response.data;
    console.log('exec')
    outputPosts(data, document.querySelector(".postsContainer"))
  } catch(err){

  }
})


function outputPosts(posts, container){
  container.innerHTML = '';
  posts.forEach(post => {
    let html = createPostHtml(post)
    console.log(post)
    container.insertAdjacentHTML('afterbegin', html)
  })

  if(posts.length == 0) {
    container.innerHTML = "<span class='noPosts'>Nada para mostrar.</span>"
  }
}