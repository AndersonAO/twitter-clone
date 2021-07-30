window.addEventListener('load', main , false)

function main(){
  const textarea = document.querySelector('#postTextarea');
  textarea.addEventListener('input', handleButtonSubmitState);
}



function handleButtonSubmitState(e){
  const value = e.target.value
  const button = document.querySelector('#submitPostButton');
  if(value && value.trim()){
    button.removeAttribute('disabled');
    return;
  }
  button.setAttribute('disabled', 'true');
}