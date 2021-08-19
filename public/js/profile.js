window.addEventListener('load', ()=>{

  if(selectedTab === "replies"){
    loadReplies()
  } else {
  loadPosts();

  }

})


async function loadPosts() {
  const response = await axios.get("/api/posts?postedBy="+ profileUserId + "&isReply=false")
  const data = response.data;
  console.log(data)
  outputPosts(data, document.querySelector(".postsContainer"))
}

async function loadReplies() {
  const response = await axios.get("/api/posts?postedBy="+ profileUserId + "&isReply=true")
  const data = response.data;
  console.log(data)
  outputPosts(data, document.querySelector(".postsContainer"))
}