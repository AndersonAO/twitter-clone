window.addEventListener("load", main, false);

// Globals
let cropper;
let timer;
let selectedUsers = [];

function main() {
  s("#postTextarea")?.addEventListener("input", toggleButtonSubmitState);
  s("#replyTextarea")?.addEventListener("input", toggleButtonSubmitState);
  s("#submitPostButton")?.addEventListener("click", submitPostForm);
  s("#submitReplyButton")?.addEventListener("click", submitPostForm);
  s("#deletePostButton")?.addEventListener("click", deletePost);
  s("#pinPostButton")?.addEventListener("click", pinPost);
  s("#unpinPostButton")?.addEventListener("click", unpinPost);
  s("#filePhoto")?.addEventListener("change", handleImageProfile);
  s("#coverPhoto")?.addEventListener("change", handleCoverProfile);
  s("#imageUploadButton")?.addEventListener("click", handleImageProfileUpload);
  s("#coverPhotoButton")?.addEventListener("click", handleCoverProfileUpload);
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
  s("#confirmPinModal")?.addEventListener("shown.bs.modal", (e) => {
    handleModalPin(e);
  });
  s("#unpinModal")?.addEventListener("shown.bs.modal", (e) => {
    handleModalUnpin(e);
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
  if (res.status == 404) {
    return;
  }
  const data = res.data;

  let difference = 1;
  if (data.following?.includes(userId)) {
    button.classList.add("following");
    button.innerText = "Seguindo";
  } else {
    button.classList.remove("following");
    button.innerText = "Seguir";
    difference = -1;
  }

  const followersLabel = s("#followersValue");
  if (followersLabel) {
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
}

async function handleModalPin(e) {
  const button = e.relatedTarget;
  const postId = getPostId(button);
  s("#pinPostButton").setAttribute("data-id", postId);
}

async function handleModalUnpin(e) {
  const button = e.relatedTarget;
  const postId = getPostId(button);
  s("#unpinPostButton").setAttribute("data-id", postId);
}

async function pinPost(e) {
  const postId = e.target.dataset.id;

  const response = await axios
    .put(`/api/posts/${postId}`, {
      pinned: true,
    })
    .catch(() => false);
  if (!response) return;
  location.reload();
}

async function unpinPost(e) {
  const postId = e.target.dataset.id;

  const response = await axios
    .put(`/api/posts/${postId}`, {
      pinned: false,
    })
    .catch(() => false);
  if (!response) return;
  location.reload();
}

async function handleImageProfile(e) {
  const input = e.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = s("#imagePreview");
      image.src = e.target.result;
      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleCoverProfile(e) {
  const input = e.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = s("#coverPreview");
      image.src = e.target.result;
      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleImageProfileUpload(e) {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    alert("N??o foi poss??vel adicionar a foto de perfil");
    return;
  }

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    const res = await axios({
      url: "/api/users/profilePicture",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": false,
        processData: false,
      },
    });
    location.reload();
  });
}

async function handleCoverProfileUpload(e) {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    alert("N??o foi poss??vel adicionar uma foto de capa");
    return;
  }

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    const res = await axios({
      url: "/api/users/coverPhoto",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": false,
        processData: false,
      },
    });
    location.reload();
  });
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
                      Retu??tado por <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
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
  let pinnedPostText = "";
  let pinTarget = "#confirmPinModal";
  if (postData.postedBy._id == userLoggedIn._id) {
    let pinnedClass = "";
    if (postData.pinned == true) {
      pinnedClass = "active";
      pinTarget = "#unpinModal";
      pinnedPostText = "<i class='fas fa-thumbtack'></i><span> Fixado</span>";
    }

    buttons = `
    <button class="pinButton ${pinnedClass}" data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="${pinTarget}"><i class="fas fa-thumbtack"></i></button>
    <button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
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
      <div class="pinnedPostText">${pinnedPostText}</div>
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

    return Math.round(elapsed / 1000) + " segundos atr??s";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutos atr??s";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " horas atr??s";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " dias atr??s";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " meses atr??s";
  } else {
    return Math.round(elapsed / msPerYear) + " anos atr??s";
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

function outputUsers(results, container) {
  container.innerHTML = "";

  results.forEach((result) => {
    const html = createUserHtml(result, true);
    container.insertAdjacentHTML("afterbegin", html);
  });
  if (results.length == 0) {
    container.innerHTML =
      '<span class="noResults">Nenhum resultado foi encontrado!</span>';
  }
}

function createUserHtml(userData, showFollowButton) {
  const name = userData.firstName + " " + userData.lastName;
  const isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? "Seguindo" : "Seguir";
  const buttonClass = isFollowing ? "followButton following" : "followButton";

  let followButton = "";
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class="followButtonContainer">
                      <button class="${buttonClass}" data-user="${userData._id}">${text}<button>
                    <div>`;
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
          <div>`;
}

s("#userSearchTextbox")?.addEventListener("keydown", (e) => {
  clearTimeout(timer);
  const textBox = e.target;
  let value = textBox.value;
  const searchType = textBox.dataset.search;

  if (!value && e.key == "Backspace") {
    // remove user from selection
    console.log("cai aqui");
    return;
  }

  timer = setTimeout(() => {
    value = textBox.value.trim();
    if (!value) {
      s(".resultsContainer").innerHTML = "";
      return;
    }
    searchUsers(value);
  }, 500);
});

async function searchUsers(searchTerm) {
  const url = "/api/users";

  const response = await axios.get(url + "?search=" + searchTerm);
  outputSelectableUsers(response.data, s(".resultsContainer"));
}

function outputSelectableUsers(results, container) {
  container.innerHTML = "";

  results.forEach((result) => {
    if (
      result._id == userLoggedIn._id ||
      selectedUsers.some((u) => u._id == result._id)
    )
      return;

    const html = createUserHtml(result, true);
    container.insertAdjacentHTML("afterbegin", html);
    const followButton = s(`.followButton[data-user="${result._id}"]`);
    const userDiv = followButton.closest(".user");
    userDiv.addEventListener("click", (e) => userSelected(result, e));
  });
  if (results.length == 0) {
    container.innerHTML =
      '<span class="noResults">Nenhum Usu??rio foi encontrado!</span>';
  }
}

function userSelected(user) {
  selectedUsers.push(user);
  const textBox = s("#userSearchTextbox");
  textBox.value = "";
  textBox.focus();
  s(".resultsContainer").innerHTML = "";
  s("#createChatButton").disabled = false;
}
