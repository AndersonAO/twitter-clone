window.addEventListener('load', main , false)

function main(){
  s('#postTextarea').addEventListener('input', toggleButtonSubmitState);
  s('#replyTextarea').addEventListener('input', toggleButtonSubmitState);
  s('#submitPostButton').addEventListener('click', submitPostForm);
  s('#replyModal').addEventListener('shown.bs.modal', (e)=> {handleModal(e)});
  document.addEventListener('click', (e)=>{
    const el = e.target;
    
    if(el.classList.contains('likeButton')) return handleLike(el)
    if(el.classList.contains('retweetButton')) return handleRetweet(el)
  });
}

async function handleModal(e){
  const button = e.relatedTarget
  const postId = getPostId(button)

  const response = await axios.get("/api/posts/"+postId)
  const data = response.data;

    outputPosts(data, s('#originalPostContainer'));
  if(!response)return;
  
}

function getParents(el, parentSelector) {
  if (parentSelector === undefined) {
      parentSelector = document;
  }
  var parents = [];
  var p = el.parentNode;
  while (p !== parentSelector) {
      var o = p;
      parents.push(o);
      p = o.parentNode;
  }
  parents.push(parentSelector);
  return parents;
}

function toggleButtonSubmitState(e){
  const value = e.target.value
  const isModal = e.target.getAttribute('data-function') === 'modal'
  const button = isModal ? s('#submitReplyButton') : s('#submitPostButton')


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

async function handleLike(button){
  const postId = getPostId(button);

  if(!postId) return;

  const response = await axios.put(`/api/posts/${postId}/like`)
  .catch(()=> false)
  if(!response)return;
  const data = response.data
  const span = button.closest('.post').querySelector('.insertLike')
  span.innerText = data.likes.length || ''

  if(data.likes.includes(userLoggedIn._id)){
    button.classList.add('active');
  } else {
    button.classList.remove('active')
  }

}

async function handleRetweet(button){
  const postId = getPostId(button);

  if(!postId) return;

  const response = await axios.post(`/api/posts/${postId}/retweet`)
  .catch(()=> false)
  if(!response)return;
  const data = response.data
  const span = button.closest('.post').querySelector('.insertRetweets')
  span.innerText = data.retweetUsers.length || ''

  if(data.retweetUsers.includes(userLoggedIn._id)){
    button.classList.add('active');
  } else {
    button.classList.remove('active')
  }

}

function getPostId(element) {
  const isRoot = element.classList.contains('post');
  const rootElement = isRoot ? element : element.closest(".post")
  const postId = rootElement.getAttribute('data-id')
  return postId;
}

function createPostHtml(postData){

  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null
  postData = isRetweet ? postData.retweetData : postData

  const postedBy = postData.postedBy;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))

  const likeButtonActiveCLass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
  const retweetButtonActiveCLass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : ""

  let retweetText = '';
  if(isRetweet){
    retweetText = `<span>
                      <i class="fas fa-retweet"></i>
                      Retuítado por <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                  </span>`
  }

  return (/*html*/`
  <div class="post" data-id="${postData._id}">
    <div class="postActionContainer">
      ${retweetText}
    </div>
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
            <button data-bs-toggle="modal" id='replyHandleButton' data-bs-target="#replyModal">
              <i class="far fa-comment"></i>
            </button>
          </div>
          <div class="postButtonContainer green">
            <button class="retweetButton ${retweetButtonActiveCLass}">
              <i class="fas fa-retweet"></i>
              <span class="insertRetweets">${postData.retweetUsers.length || ''}</span>
            </button>
          </div>
          <div class="postButtonContainer red">
            <button class="likeButton ${likeButtonActiveCLass}">
              <i class="far fa-heart"></i>
              <span class="insertLike">${postData.likes.length || ''}</span>
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

function outputPosts(posts, container){
  container.innerHTML = '';

  if(!Array.isArray(posts)){
    
    posts = [posts]
    console.log(posts)
  }

  posts.forEach(post => {
    let html = createPostHtml(post)
    console.log(post)
    container.insertAdjacentHTML('afterbegin', html)
  })

  if(posts.length == 0) {
    container.innerHTML = "<span class='noPosts'>Nada para mostrar.</span>"
  }
}




// Document querySelector
function s(identifier){
  return document.querySelector(identifier)
}