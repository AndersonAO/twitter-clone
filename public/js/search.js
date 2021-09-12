document.querySelector("#searchBox").addEventListener('keydown',(e)=>{
  clearTimeout(timer);
  const textBox = e.target;
  let value = textBox.value;
  const searchType = textBox.dataset.search;

  timer = setTimeout(()=>{
    value = textBox.value.trim();
    if(!value){
      document.querySelector(".resultsContainer").innerHTML = "";
      return;
    }
    search(value, searchType)
  },1000)
})

async function search(searchTerm, searchType){
  const url = searchType === "users" ? "/api/users" : "/api/posts";

  const response = await axios.get(url + '?search=' + searchTerm);
  console.log(url + '?search=' + searchTerm)
  if(searchType == "users"){
    outputUsers(response.data, document.querySelector(".resultsContainer"))
  } else {
    outputPosts(response.data, document.querySelector(".resultsContainer"))
  }
}