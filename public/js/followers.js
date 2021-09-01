window.addEventListener('load', ()=>{

  if(selectedTab === "followers"){
    loadFollowers()
  } else {
  loadFollowing();

  }

})


async function loadFollowing() {
  const response = await axios.get(`/api/users/${profileUserId}/following`)
  const data = response.data;

  outputUsers(data, document.querySelector(".resultsContainer"))
}

async function loadFollowers() {
  const response = await axios.get(`/api/users/${profileUserId}/followers`)
  const data = response.data;

  outputUsers(data, document.querySelector(".resultsContainer"))
}

