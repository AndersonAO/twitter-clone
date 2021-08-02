window.addEventListener('load', main , false)

function main(){
  s('#postTextarea').addEventListener('input', toggleButtonSubmitState);
  s('#submitPostButton').addEventListener('click', submitPostForm);
}



function toggleButtonSubmitState(e){
  const value = e.target.value
  const button = document.querySelector('#submitPostButton');
  if(value && value.trim()){
    button.removeAttribute('disabled');
    return;
  }
  button.setAttribute('disabled', 'true');
}

async function submitPostForm(e){
  const button = e.target;
  const textbox = s("#postTextarea");
  const data = {
    content: textbox.value
  }

  try{
    const response = await axios.post("/api/posts", data)
    const html = createPostHtml(response.data)
    s(".postsContainer").insertAdjacentHTML('afterbegin',html);
    textbox.value = ''
    button.setAttribute('disabled', 'true')
  } catch(err){
    console.log(err)
  }
  
}

function createPostHtml(postData){

  const postedBy = postData.postedBy;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))

  return /*html*/(`
  <div class="post">
    <div class="mainContentContainer">
      <div class="userImageContainer">
        <img src="${postedBy.profilePic}">
      </div>
      <div class="postContentContainer">
        <div class="header">
          <a href="/profile/${postedBy.username}" class="displayName">${displayName}</a>
          <span class="username">@${postedBy.username}</span>
          <span class="date">${timestamp}</span>
        </div>
        <div class="postBody">
          <span>${postData.content}</span>
        </div>
        <div class="postFooter">
          <div class="postButtonContainer">
            <button>
              <i class="far fa-comment"></i>
            </button>
          </div>
          <div class="postButtonContainer">
            <button>
              <i class="fas fa-retweet"></i>
            </button>
          </div>
          <div class="postButtonContainer">
            <button>
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `)
  
}

function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if(elapsed/1000 < 30) return "Agora";

       return Math.round(elapsed/1000) + ' segundos atrás';   
  }

  else if (elapsed < msPerHour) {
       return Math.round(elapsed/msPerMinute) + ' minutos atrás';   
  }

  else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour ) + ' horas atrás';   
  }

  else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' dias atrás';   
  }

  else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' meses atrás';   
  }

  else {
      return Math.round(elapsed/msPerYear ) + ' anos atrás';   
  }
}




// Document querySelector
function s(identifier){
  return document.querySelector(identifier)
}