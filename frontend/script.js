/* GENERAL VARIABLES */

let userData;

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

    let username = sessionStorage.getItem("username");
    username = username.charAt(0).toUpperCase() + username.slice(1);
    let logoutBtn = document.createElement("div");
    logoutBtn.innerHTML = `
    <a href="./log-in.html" class="button is-light" id="loginBtn">Log Out</a>
    `;
    let userText = document.createElement("div");
    userText.innerHTML = `
    <p style="margin-bottom: 0.5rem;" class="navbar-item is-size-6 title">${username}</p>
    `;

    document.querySelector(".buttons").append(userText, logoutBtn);
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userId");
    });
  }
}

/* SAVE BOOKS */

async function toggleSaved(bookId, save) {
  const userId = sessionStorage.getItem("userId");
  const authToken = sessionStorage.getItem("token");

  const userResponse = await axios.get(`http://localhost:1337/api/users/${userId}?populate=deep,2`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  const userData2 = userResponse.data;

  let newBooks;
  if (save) {
    newBooks = [...userData2.books, { id: bookId }];
  } else {
    newBooks = userData2.books.filter((book) => book.id !== bookId);
  }
  console.log(newBooks);

  const updateUserResponse = await axios.put(
    `http://localhost:1337/api/users/${userId}`,
    {
      books: newBooks,
    },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  updateSaveBtn(bookId, save);
  // console.log(updateUserResponse.data);
}

function updateSaveBtn(bookId, save) {
  let btn = document.querySelector(`#saveBtn_${bookId}`);
  if (save) {
    btn.innerText = "Saved";
    btn.classList.add("is-active");
    btn.innerHTML = `
    <span class="icon is-small">
      <i class="fas fa-check"></i>
    </span>
    <span>Saved</span>
    `;
    btn.removeAttribute("onclick");
    btn.setAttribute("onclick", `toggleSaved(${bookId}, false)`);
  } else {
    btn.innerText = "Save";
    btn.classList.remove("is-active");
    btn.innerHTML = `
    <span class="icon is-small">
      <i class="fas fa-bookmark"></i>
    </span>
    <span>Save</span>
    `;
    btn.removeAttribute("onclick");
    btn.setAttribute("onclick", `toggleSaved(${bookId}, true)`);
  }
}

async function saveBtn() {
  let userData = await getUserInfo();
  const userBooks = userData.books;
  let userBooksIds = userBooks.map((book) => book.id);
  // console.log(userBooksIds);
  userBooksIds.forEach((bookId) => {
    updateSaveBtn(bookId, true);
  });
}

/* LOAD BOOKS */

async function ratings(el, bookId) {
  changeStarColor(el);
  const ratingValue = el.value;

  const userId = sessionStorage.getItem("userId");
  const authToken = sessionStorage.getItem("token");

  const userResponse = await axios.get(`http://localhost:1337/api/users/${userId}?populate=deep,3`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const userReviews = userResponse.data.reviews || []; // get the user's existing reviews, or an empty array if they don't have any

  const existingReview = userReviews.find((review) => review.book.id === bookId);
  // console.log(existingReview);

  if (existingReview) {
    // user has already left a review for this book, update the existing review
    const updatedReview = {
      id: existingReview.id,
      data: {
        rating: parseInt(ratingValue),
      },
    };
    const updateReviewResponse = await axios.put(`http://localhost:1337/api/reviews/${existingReview.id}`, updatedReview, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log(updateReviewResponse.data);
  } else {
    // user has not left a review for this book, create a new review
    const newReview = {
      data: {
        book: parseInt(bookId),
        rating: parseInt(ratingValue),
        user: parseInt(userId),
      },
    };
    const createReviewResponse = await axios.post(`http://localhost:1337/api/reviews`, newReview, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log(createReviewResponse);
  }
}

function changeStarColor(el) {
  // Get all the radio inputs in the group
  var inputs = el.parentNode.parentNode.querySelectorAll("input[type='radio']");

  // Get the index of the clicked radio input
  var index = Array.from(inputs).indexOf(el);

  // Change the color of the spans before and including the clicked span
  for (var i = 0; i <= index; i++) {
    inputs[i].nextElementSibling.querySelector("i").style.color = "orange";
  }

  // Change the color of the spans after the clicked span
  for (var i = index + 1; i < inputs.length; i++) {
    inputs[i].nextElementSibling.querySelector("i").style.color = "";
  }
}

async function ratingBtns() {
  let userData = await getUserInfo();

  let userId = parseInt(sessionStorage.getItem("userId"));
  if (document.querySelector("#book-cards")) {
    const userReviews = userData.reviews;
    userReviews.forEach((review) => {
      const reviewRating = review.rating;
      const bookId = review.book.id;
      let parentNode = document.querySelector(`#book_${bookId}_ratings`);
      let input = parentNode.querySelector(`input[value='${reviewRating}']`);
      changeStarColor(input);
    });
  } else if (document.querySelector("#profile-card")) {
    const userReviews = userData.books;
    userReviews.forEach((user) => {
      user.reviews.forEach((review) => {
        if (review.user.id === userId) {
          const reviewRating = review.rating;
          const bookId = review.book.id;
          let parentNode = document.querySelector(`#book_${bookId}_ratings`);
          let input = parentNode.querySelector(`input[value='${reviewRating}']`);
          changeStarColor(input);
        }
      });
    });
  }
}

function bookDivStructure(image, title, author, pages, releaseDate, bookId) {
  let div = document.createElement("div");
  div.classList.add("column");
  if (sessionStorage.getItem("token")) {
    div.innerHTML = ` 
    <div class="card">
      <div class="center">
        <figure class="card-image is-2b3">
          <img src="http://localhost:1337${image}" alt="1984 Book Cover Image" />
        </figure>
        <div class="card-header-title">
          <h2 class="is-size-5 title">${title}</h2>
        </div>
      </div>
        <div class="card-content box">
          <p>Author: ${author}</p>
          <p>Pages: ${pages}</p>
          <p>Release Date: ${releaseDate}</p>
          <button class="button is-primary" onclick="toggleSaved(${bookId}, true)" id="saveBtn_${bookId}">
            <span class="icon is-small">
              <i class="fas fa-bookmark"></i>
            </span>
            <span>
              Save
            </span>
          </button>
          <div class="field">
            <div class="control has-text-centered" id="book_${bookId}_ratings">
              <label class="radio">
                <input type="radio" name="rating" value="1" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="2" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="3" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="4" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="5" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  } else {
    div.innerHTML = ` 
    <div class="card">
      <div class="center">
        <figure class="card-image is-2b3">
          <img src="http://localhost:1337${image}" alt="1984 Book Cover Image" />
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

async function loadBooks() {
  let books = await getItems("http://localhost:1337/api/books?populate=deep,3");
  let bookArray = books.data.data;
  // console.log(books.data.data);
  // console.log(bookArray);
  for (let i = 0; i < bookArray.length; i += 2) {
    const {
      attributes: { title: title1, pages: pages1, author: author1, releaseDate: releaseDate1, coverImage: coverImage1 },
    } = bookArray[i];
    let id1 = bookArray[i].id;
    // console.log(bookArray[i + 1].id);
    const image1 = coverImage1.data.attributes.url;
    const card1 = bookDivStructure(image1, title1, author1, pages1, releaseDate1, id1);

    const { attributes: { title: title2, pages: pages2, author: author2, releaseDate: releaseDate2, coverImage: coverImage2 } = {} } =
      bookArray[i + 1] || {};
    let id2 = bookArray[i + 1].id;
    const image2 = coverImage2?.data?.attributes?.url;
    const card2 = bookDivStructure(image2, title2, author2, pages2, releaseDate2, id2);

    const columns = document.createElement("div");
    columns.classList.add("columns", "is-centered");
    columns.appendChild(card1);
    if (card2) columns.appendChild(card2);

    const container = document.querySelector(".book-cards");

    container.appendChild(columns);
  }
  saveBtn();
  ratingBtns();
}

/* PROFILE PAGE */

async function renderProfile() {
  let user = await getUserInfo();

  let username = document.querySelector("#username");
  username.innerText = user.username.charAt(0).toUpperCase() + user.username.slice(1);

  let saveBooksList = document.querySelector("#savedBooks-list");

  let books = user.books;
  books.forEach((book) => {
    let { title, pages, author, releaseDate, coverImage, id } = book;
    let bookId = id;
    const image = coverImage.url;
    let div = document.createElement("div");
    div.classList.add("box");
    div.innerHTML = `
    <div class="list-item">
      <div class="columns">
        <div class="column is-one-third">
          <figure class="image is-2b3">
            <img src="http://localhost:1337${image}" alt="1984 Book Cover Image"/>
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
        <button class="button is-primary" onclick="toggleSaved(${bookId}, true)" id="saveBtn_${bookId}">
            <span class="icon is-small">
              <i class="fas fa-bookmark"></i>
            </span>
            <span>
              Save
            </span>
          </button>
          <div class="field">
            <div class="control has-text-centered" id="book_${bookId}_ratings">
              <label class="radio">
                <input type="radio" name="rating" value="1" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="2" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="3" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="4" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
              <label class="radio">
                <input type="radio" name="rating" value="5" onclick="ratings(this, ${bookId})">
                <span class="icon is-small">
                  <i class="fas fa-star fa-s"></i>
                </span>
              </label>
            </div>
          </div>
      </div>
    </div>
    `;

    saveBooksList.append(div);
  });
  saveBtn();
  ratingBtns();
}

/* FETCHES WITH AXIOS */

async function getItems(url) {
  let response = await axios.get(url);
  return response;
}

async function loadPage() {
  // Testa att flytta in getUserInfo in i getUserLoginAuth och se om du kan permanent-
  // spara datan där.
  // await getUserInfo();
  removeLoginBtns();
  if (document.querySelector("#profile-card")) {
    renderProfile();
  }
  if (document.querySelector("#book-cards")) {
    loadBooks();
  }
}

async function getUserLoginAuth() {
  let username = document.querySelector("#username");
  let password = document.querySelector("#password");
  try {
    let response = await axios.post("http://localhost:1337/api/auth/local", {
      identifier: username.value,
      password: password.value,
    });
    sessionStorage.setItem("token", response.data.jwt);
    sessionStorage.setItem("username", response.data.user.username);
    sessionStorage.setItem("userId", response.data.user.id);
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
    let response = await axios.get("http://localhost:1337/api/users/me?populate=deep,4", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    userData = response.data;
    return response.data;
  }
}

loadPage();
