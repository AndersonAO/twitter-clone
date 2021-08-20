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

function outputUsers(results, container){
  container.innerHTML = '';

  results.forEach(result => {
    const html = createUserHtml(result, true)
    container.insertAdjacentHTML('afterbegin',html)
  })
  if(results.length == 0){
    container.innerHTML = '<span class="noResults">Nenhum resultado foi encontrado!</span>'
  }
}

function createUserHtml(userData, showFollowButton){
  
  const name = userData.firstName + ' ' + userData.lastName;
  const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
  const text = isFollowing ? "Seguindo" : "Seguir"
  const buttonClass = isFollowing ? "followButton following" : "followButton"

  let followButton = '';
  if(showFollowButton && userLoggedIn._id != userData._id){
    followButton = `<div class="followButtonContainer">
                      <button class="${buttonClass}" data-user="${userData._id}">${text}<button>
                    <div>`
  }

  return `<div class='user'>
            <div class='userImageContainer'>
              <img src="${userData.profilePic}">
            </div>
            <div class="userDetailsContainer">
              <div class="header">
                <a href="/profile/${userData.username}">${name}</a>
                <span class="username">${userData.username}</span>
              </div>
            </div>
            ${followButton}
          <div>`
}