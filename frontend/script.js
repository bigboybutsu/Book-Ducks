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

/* LOGIN PAGE */

let loginContainer = document.querySelector("#login-container");
let signupCard = document.querySelector("#signup-card");
let signupBtn = document.querySelector("#signup-btn");

const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    await getUserLoginAuth();
  });
}

function validateLoginForm() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    alert("Please fill in both fields.");
    return false;
  } else {
    return true;
  }
}

function printSignup() {
  if (loginContainer) {
    loginContainer.classList.toggle("hidden");
  }

  let main = document.querySelector("main");
  let div = document.createElement("div");
  div.classList.add("center");
  div.innerHTML = `
  <div class="card" id="signup-card">
        <div class="card-content">
          <div class="content">
            <h2>Signup</h2>
            <form>
              <div class="field">
                <label class="label">Username</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Username" />
                </div>
              </div>
              <div class="field">
                <label class="label">Email</label>
                <div class="control">
                  <input class="input" type="email" placeholder="Email" />
                </div>
              </div>
              <div class="field">
                <label class="label">Password</label>
                <div class="control">
                  <input class="input" type="password" placeholder="Password" />
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <button class="button is-link" id="signup-btn">Signup</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  `;
  main.append(div);
}

function removeLoginBtns() {
  if (sessionStorage.getItem("token")) {
    let loginBtn = document.querySelector("#loginBtn");
    let signupBtn = document.querySelector("#signupBtn");

    if (loginBtn) {
      loginBtn.classList.toggle("hidden");
    }
    if (signupBtn) {
      signupBtn.classList.toggle("hidden");
    }

    let logoutBtn = document.createElement("div");
    logoutBtn.innerHTML = `<a href="./log-in.html" class="button is-light" id="loginBtn">Log Out</a>`;

    document.querySelector(".buttons").append(logoutBtn);
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("token");
    });
  }
}

/* LOAD BOOKS */

function bookDivStructure(image, title, author, pages, releaseDate) {
  let div = document.createElement("div");
  div.classList.add("column");
  if (sessionStorage.getItem("token")) {
    div.innerHTML = ` 
    <div class="card">
      <div class="center">
        <figure class="card-image is-2b3">
          <img src="http://localhost:1338${image}" alt="1984 Book Cover Image" />
        </figure>
        <div class="card-header-title">
          <h2 class="is-size-5 title">${title}</h2>
        </div>
      </div>
        <div class="card-content box">
          <p>Author: ${author}</p>
          <p>Pages: ${pages}</p>
          <p>Release Date: ${releaseDate}</p>
          <button class="button is-primary">Save</button>
        </div>
      </div>
    </div>`;
  } else {
    div.innerHTML = ` 
    <div class="card">
      <div class="center">
        <figure class="card-image is-2b3">
          <img src="http://localhost:1338${image}" alt="1984 Book Cover Image" />
        </figure>
        <div class="card-header-title">
          <h2 class="is-size-5 title">${title}</h2>
        </div>
      </div>
        <div class="card-content box">
          <p>Author: ${author}</p>
          <p>Pages: ${pages}</p>
          <p>Release Date: ${releaseDate}</p>
        </div>
      </div>
    </div>`;
  }
  return div;
}

async function OldloadBooks() {
  let books = await getItems("http://localhost:1338/api/books?populate=deep,3");
  let bookArray = books.data.data;
  bookArray.forEach((book) => {
    let { title, pages, author, releaseDate, coverImage } = book.attributes;
    const image = coverImage.data.attributes.url;
    // console.log(coverImage.data.attributes.url);
    // console.log(title, pages, author, releaseDate, image);
    let div = document.createElement("div");
    div.classList.add("column");
    div.innerHTML = ` 
    <div class="card">
      <div class="center">
        <figure class="card-image is-2b3">
          <img src="http://localhost:1338${image}" alt="1984 Book Cover Image" />
        </figure>
        <div class="card-header-title truncate">
          <h2 class="is-size-3 title">${title}</h2>
        </div>
      </div>
        <div class="card-content box">
          <p>Author: ${author}</p>
          <p>Pages: ${pages}</p>
          <p>Release Date: ${releaseDate}</p>
          <button class="button is-primary">Save</button>
        </div>
      </div>
    </div>`;

    let bookCards = document.querySelector("#book-cards");
    // bookCards.append(div);
  });
}

async function loadBooks() {
  let books = await getItems("http://localhost:1338/api/books?populate=deep,3");
  let bookArray = books.data.data;
  for (let i = 0; i < bookArray.length; i += 2) {
    const {
      attributes: { title: title1, pages: pages1, author: author1, releaseDate: releaseDate1, coverImage: coverImage1 },
    } = bookArray[i];
    const image1 = coverImage1.data.attributes.url;
    const card1 = bookDivStructure(image1, title1, author1, pages1, releaseDate1);

    const {
      attributes: {
        title: title2,
        pages: pages2,
        author: author2,
        releaseDate: releaseDate2,
        coverImage: coverImage2,
      } = {},
    } = bookArray[i + 1] || {};
    const image2 = coverImage2?.data?.attributes?.url;
    const card2 = bookDivStructure(image2, title2, author2, pages2, releaseDate2);

    const columns = document.createElement("div");
    columns.classList.add("columns", "is-centered");
    columns.appendChild(card1);
    if (card2) columns.appendChild(card2);

    const container = document.querySelector(".book-cards");

    container.appendChild(columns);
  }
}

/* PROFILE PAGE */

async function renderProfile() {
  let user = await getUserInfo();

  let username = document.querySelector("#username");
  username.innerText = user.username.charAt(0).toUpperCase() + user.username.slice(1);

  let saveBooksList = document.querySelector("#savedBooks-list");

  let books = user.books;
  books.forEach((book) => {
    let { title, pages, author, releaseDate, coverImage } = book;
    const image = coverImage.url;
    console.log(title);
    let div = document.createElement("div");
    div.classList.add("box");
    div.innerHTML = `
    <div class="list-item">
      <div class="columns">
        <div class="column is-one-third">
          <figure class="image is-2b3">
            <img src="http://localhost:1338${image}" alt="1984 Book Cover Image"/>
          </figure>
        </div>
        <div class="column">
          <div class="card-header-title">
            <h2 class="is-size-5 title">${title}</h2>
          </div>
        </div>
      </div>
      <div class="media-content">
        <p>Author: ${author}</p>
        <p>Pages: ${pages}</p>
        <p>Release Date: ${releaseDate}</p>
      </div>
    </div>
    `;

    saveBooksList.append(div);
  });
}

/* FETCHES WITH AXIOS */

async function getItems(url) {
  let response = await axios.get(url);
  return response;
}

async function loadPage() {
  if (document.querySelector("#profile-card")) {
    renderProfile();
  }
  removeLoginBtns();
  if (document.querySelector("#book-cards")) {
    loadBooks();
  }
}

async function getUserLoginAuth() {
  let username = document.querySelector("#username");
  let password = document.querySelector("#password");
  try {
    let response = await axios.post("http://localhost:1338/api/auth/local", {
      identifier: username.value,
      password: password.value,
    });
    sessionStorage.setItem("token", response.data.jwt);
    alert("Logged in!");
    window.location.href = "index.html";
  } catch (error) {
    if (error.response) {
      alert("Wrong password or username.");
    } else {
      console.error(error);
    }
  }
}

async function getUserInfo() {
  if (sessionStorage.getItem("token")) {
    let response = await axios.get("http://localhost:1338/api/users/me?populate=deep,3", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return response.data;
  }
}

loadPage();
