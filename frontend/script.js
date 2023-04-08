/* HAMBURGER MENU */
document.addEventListener("DOMContentLoaded", () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);

  // Add a click event on each of them
  $navbarBurgers.forEach((el) => {
    el.addEventListener("click", () => {
      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  });
});

/* FETCHES WITH AXIOS */

async function getItems(url) {
  let response = await axios.get(url);
  return response;
}

async function loadPage() {}

async function getUserLoginAuth(username, password) {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: "användare1",
    password: "pass1234",
  });
  sessionStorage.setItem("token", response.data.jwt);
  console.log(response);
}

async function getUserInfo() {
  if (sessionStorage.getItem("token")) {
    let response = await axios.get("http://localhost:1337/api/users/me?populate=deep,3", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    console.log(response.data);
  }
}

// getUserLoginAuth();
getUserInfo();
