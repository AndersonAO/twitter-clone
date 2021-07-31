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

  
  const response = await axios.post("/api/posts", data)
  alert(response.data)
}




// Document querySelector
function s(identifier){
  return document.querySelector(identifier)
}