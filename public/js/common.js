window.addEventListener("load", main, false);

// Globals
let cropper;


function main() {
  s("#postTextarea")?.addEventListener("input", toggleButtonSubmitState);
  s("#replyTextarea")?.addEventListener("input", toggleButtonSubmitState);
  s("#submitPostButton")?.addEventListener("click", submitPostForm);
  s("#submitReplyButton")?.addEventListener("click", submitPostForm);
  s("#deletePostButton")?.addEventListener("click", deletePost);
  s("#filePhoto")?.addEventListener("change", handleImageProfile);
  s("#imageUploadButton")?.addEventListener("click", handleImageProfileUpload);
  s("#replyModal")?.addEventListener("shown.bs.modal", (e) => {
    handleModal(e);
  });
  s("#replyModal")?.addEventListener(
    "hidden.bs.modal",
    (e) => (s("#originalPostContainer").innerHTML = "")
  );
  s("#deletePostModal")?.addEventListener("shown.bs.modal", (e) => {
    handleModalDelete(e);
  });

  document.addEventListener("click", (e) => {
    const el = e.target;

    if (el.classList.contains("likeButton")) return handleLike(el);
    if (el.classList.contains("retweetButton")) return handleRetweet(el);
    if (el.classList.contains("followButton")) return handleFollow(el);
  });
}

async function handleFollow(el) {
  const button = el;
  const userId = button.dataset.user;

  const res = await axios.put(`/api/users/${userId}/follow`, {});
  if(res.status == 404){
    return;
  }
  const data = res.data;

  let difference = 1;
  if(data.following?.includes(userId)){
    button.classList.add('following')
    button.innerText = "Seguindo"
  } else {
    button.classList.remove('following')
    button.innerText = "Seguir"
    difference = -1
  }

  const followersLabel = s('#followersValue')
  if(followersLabel){
    let count = Number(followersLabel.innerText);
    followersLabel.innerText = count + difference;

  }

}

async function deletePost(e) {
  const postId = e.target.dataset.id;

  const response = await axios
    .delete(`/api/posts/${postId}`)
    .catch(() => false);
  if (!response) return;
  location.reload();
}

async function handlePost(e) {
  const el = e.target;
  const postId = getPostId(el);
  console.log(postId);
  console.log(el.tagName);
  if (postId && el.tagName.toLowerCase() !== "button") {
    window.location.href = "/post/" + postId;
  }
}

async function handleModal(e) {
  const button = e.relatedTarget;
  const postId = getPostId(button);
  s("#submitReplyButton").setAttribute("data-id", postId);

  const response = await axios.get("/api/posts/" + postId);
  const data = response.data;

  outputPosts(data.post, s("#originalPostContainer"));
  if (!response) return;
}

async function handleModalDelete(e) {
  const button = e.relatedTarget;
  const postId = getPostId(button);
  s("#deletePostButton").setAttribute("data-id", postId);

  const response = await axios.get("/api/posts/" + postId);
  const data = response.data;
  if (!response) return;
}

async function handleImageProfile(e) {
  const input = e.target;

  if(input.files && input.files[0]){
    const reader = new FileReader();
    reader.onload = (e) => {
      const image  = s("#imagePreview")
      image.src = e.target.result
      if(cropper){
        cropper.destroy();
      }

      cropper = new Cropper(image,{
        aspectRatio: 1 / 1,
        background: false
      });

    }
    reader.readAsDataURL(input.files[0])
  }
}

async function handleImageProfileUpload(e) {
  const canvas = cropper.getCroppedCanvas();

  if(!canvas){
    alert("Não foi possível adicionar a foto de perfil")
    return;
  }

  canvas.toBlob(async (blob)=>{
    const formData = new FormData();
    formData.append("croppedImage", blob);

    const res = await axios({
      url: "/api/users/profilePicture",
      method: "POST",
      data: formData,
      headers: {
        'Content-Type' : false,
        'processData': false,
    },
    })
    location.reload()
  })

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

function toggleButtonSubmitState(e) {
  const value = e.target.value;
  const isModal = e.target.getAttribute("data-function") === "modal";
  const button = isModal ? s("#submitReplyButton") : s("#submitPostButton");

  if (value && value.trim()) {
    button.removeAttribute("disabled");
    return;
  }
  button.setAttribute("disabled", "true");
}

async function submitPostForm(e) {
  const button = e.target;

  const isModal = e.target.getAttribute("id") === "submitReplyButton";
  const textbox = isModal ? s("#replyTextarea") : s("#postTextarea");

  const data = {
    content: textbox.value,
  };

  if (isModal) {
    const id = button.getAttribute("data-id");
    if (!id) return;
    data.replyTo = id;
  }

  try {
    const response = await axios.post("/api/posts", data);
    if (data.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(response.data);
      s(".postsContainer").insertAdjacentHTML("afterbegin", html);
      textbox.value = "";
      button.setAttribute("disabled", "true");
    }
  } catch (err) {
    console.log(err);
  }
}

async function handleLike(button) {
  const postId = getPostId(button);

  if (!postId) return;

  const response = await axios
    .put(`/api/posts/${postId}/like`)
    .catch(() => false);
  if (!response) return;
  const data = response.data;
  const span = button.closest(".post").querySelector(".insertLike");
  span.innerText = data.likes.length || "";

  if (data.likes.includes(userLoggedIn._id)) {
    button.classList.add("active");
  } else {
    button.classList.remove("active");
  }
}

async function handleRetweet(button) {
  const postId = getPostId(button);

  if (!postId) return;

  const response = await axios
    .post(`/api/posts/${postId}/retweet`)
    .catch(() => false);
  if (!response) return;
  const data = response.data;
  const span = button.closest(".post").querySelector(".insertRetweets");
  span.innerText = data.retweetUsers.length || "";

  if (data.retweetUsers.includes(userLoggedIn._id)) {
    button.classList.add("active");
  } else {
    button.classList.remove("active");
  }
}

function getPostId(element) {
  const isRoot = element.classList.contains("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.getAttribute("data-id");
  return postId;
}

function createPostHtml(postData, largeFont = false) {
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveCLass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";
  const retweetButtonActiveCLass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";
  const largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                      <i class="fas fa-retweet"></i>
                      Retuítado por <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                  </span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
                    Respondendo <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                  </div>`;
  }

  let buttons = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `<button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
  }

  return /*html*/ `
  <div class="post ${largeFontClass}" data-id="${postData._id}">
    <div class="postActionContainer">
      ${retweetText}
    </div>
    <div class="mainContentContainer">
      <div class="userImageContainer">
        <img src="${postedBy.profilePic}">
      </div>
      <div class="postContentContainer">
        <div class="header">
          <a href="/profile/${
            postedBy.username
          }" class="displayName">${displayName}</a>
          <span class="username">@${postedBy.username}</span>
          <span class="date">${timestamp}</span>
          ${buttons}
        </div>
        ${replyFlag}
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
              <span class="insertRetweets">${
                postData.retweetUsers.length || ""
              }</span>
            </button>
          </div>
          <div class="postButtonContainer red">
            <button class="likeButton ${likeButtonActiveCLass}">
              <i class="far fa-heart"></i>
              <span class="insertLike">${postData.likes.length || ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Agora";

    return Math.round(elapsed / 1000) + " segundos atrás";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutos atrás";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " horas atrás";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " dias atrás";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " meses atrás";
  } else {
    return Math.round(elapsed / msPerYear) + " anos atrás";
  }
}

function outputPosts(posts, container) {
  container.innerHTML = "";
  if (!Array.isArray(posts)) {
    posts = [posts];
    console.log(posts);
  }
  console.log(posts);

  posts.forEach((post) => {
    let html = createPostHtml(post);
    container.insertAdjacentHTML("afterbegin", html);
    const posts = document.querySelectorAll(".post");
    posts[0].addEventListener("click", handlePost);
  });

  if (posts.length == 0) {
    container.innerHTML = "<span class='noPosts'>Nada para mostrar.</span>";
  }
}

function outputPostsWithReplies(results, container) {
  container.innerHTML = "";

  if (results.replyTo && results.replyTo._id) {
    let html = createPostHtml(results.replyTo);
    container.insertAdjacentHTML("beforebegin", html);
  }

  let mainPostHtml = createPostHtml(results.post, true);
  container.insertAdjacentHTML("afterbegin", mainPostHtml);

  results.replies.forEach((post, i) => {
    let html = createPostHtml(post);
    container.insertAdjacentHTML("beforeend", html);
  });
  const posts = document.querySelectorAll(".post");
  for (let i in posts) {
    posts[i].addEventListener("click", handlePost);
  }
}

// Document querySelector
function s(identifier) {
  return document.querySelector(identifier);
}

function sall(identifier) {
  return document.querySelectorAll(identifier);
}
