window.addEventListener('load', ()=>{

  if(selectedTab === "replies"){
    loadReplies()
  } else {
    loadPosts();

  }

})


async function loadPosts() {

  const res = await axios.get("/api/posts?postedBy="+ profileUserId + "&pinned=true")
  const dat = res.data;
  outputPinnedPosts(dat, document.querySelector(".pinnedPostContainer"))

  const response = await axios.get("/api/posts?postedBy="+ profileUserId + "&pinned=false")
  const data = response.data;
  outputPosts(data, document.querySelector(".postsContainer"))


}

async function loadReplies() {
  const response = await axios.get("/api/posts?postedBy="+ profileUserId + "&isReply=true")
  const data = response.data;
  outputPosts(data, document.querySelector(".postsContainer"))
}

function outputPinnedPosts(posts, container) {

  if(posts.length == 0){
    container.style.display = 'none';
    return
  }

  container.innerHTML = "";

  posts.forEach((post) => {
    let html = createPostHtml(post);
    container.insertAdjacentHTML("afterbegin", html);
    const posts = document.querySelectorAll(".post");
    posts[0].addEventListener("click", handlePost);
  });
}