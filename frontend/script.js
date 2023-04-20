/* GENERAL VARIABLES */

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
let signupBtn = document.querySelector("#signupBtn");

const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    console.log(password);
    if (password.length >= 6) {
      await getUserLoginAuth(username, password);
    }
  });
}

function validateLoginForm() {
  //Checks if the login is empty and warns the user if thats the case
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    alert("Please fill in both fields.");
    return false;
  } else if (password.length < 6) {
    alert("Password must be longer than 6 characters");
    return false;
  } else {
    return true;
  }
}

function validateRegisterForm() {
  //Checks if the register is empty and warns the user if thats the case

  const username = document.querySelector("#regUsername").value;
  const email = document.querySelector("#regEmail").value;
  const password = document.querySelector("#regPassword").value;

  if (username === "" || password === "" || email === "") {
    alert("Please fill all both fields.");
    return false;
  } else if (password.length < 6) {
    alert("Password must be longer than 6 characters");
    return false;
  } else {
    return true;
  }
}

if (signupBtn) {
  signupBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "./log-in.html?signup=true"; // redirect to log-in.html with a query parameter
  });
}

function printSignup() {
  // Takes the queryparameter from if(signupBtn)
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get("signup") === "true") {
    if (loginContainer) {
      loginContainer.classList.toggle("hidden");
    }
    //Adds the signup box
    let main = document.querySelector("main");
    let div = document.createElement("div");
    div.classList.add("center");
    div.innerHTML = `
    <div class="card" id="signup-card">
          <div class="card-content">
            <div class="content">
              <h2>Register your account</h2>
              <form id="register-form" onsubmit="return validateRegisterForm()">
                <div class="field">
                  <label class="label">Username</label>
                  <div class="control">
                    <input class="input" type="text" placeholder="Username" id="regUsername"/>
                  </div>
                </div>
                <div class="field">
                  <label class="label">Email</label>
                  <div class="control">
                    <input class="input" type="email" placeholder="Email" id="regEmail"/>
                  </div>
                </div>
                <div class="field">
                  <label class="label">Password</label>
                  <div class="control">
                    <input class="input" type="password" placeholder="Password" id="regPassword"/>
                  </div>
                </div>
                <div class="field">
                  <div class="control">
                    <button type="submit" class="button is-link" id="signup-btn">Signup</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
    `;
    main.append(div);
    const registerForm = document.querySelector("#register-form");
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      let password = document.querySelector("#regPassword").value;
      // Only does a post to the API if the password is longer than 6 letters
      if (password.length >= 6) {
        await signUpUser();
      }
    });
  }
}
//Loads printSignup if the queryparameter is met
window.addEventListener("load", printSignup);

function removeLoginBtns() {
  //If the user is logged in it removes the login and signup buttons
  // and replaces it with a sign out button and the username
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
    <a href="./log-in.html" class="button is-accent" id="loginBtn">Log Out</a>
    `;
    let userText = document.createElement("div");
    userText.innerHTML = `
    <a href="./profile.html" style="margin-bottom: 0.5rem;" class="navbar-item is-size-6 title">${username}</a>
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
  // Saves/Removes the book from/to the API depending on if the button that has been clicked was in the save or saved state
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
}

function updateSaveBtn(bookId, save) {
  // Changes the save button from saved to save depending on if it has been click
  // and calls the toggleSaved function to send it to the backend.
  // Also checks if ratedBtn exists which only exists on the profile page
  let ratedBtn = document.querySelector(`#rated_saveBtn_${bookId}`);
  let saveBtn = document.querySelector(`#saveBtn_${bookId}`);

  if (ratedBtn) {
    ratedBtn.classList.toggle("is-active", save);
    ratedBtn.innerHTML = `
      <span class="icon is-small">
        <i class="fas ${save ? "fa-check" : "fa-bookmark"}"></i>
      </span>
      <span>${save ? "Saved" : "Save"}</span>
    `;
    ratedBtn.onclick = () => toggleSaved(bookId, !save);
  }

  if (saveBtn) {
    saveBtn.classList.toggle("is-active", save);
    saveBtn.innerHTML = `
      <span class="icon is-small">
        <i class="fas ${save ? "fa-check" : "fa-bookmark"}"></i>
      </span>
      <span>${save ? "Saved" : "Save"}</span>
    `;
    saveBtn.onclick = () => toggleSaved(bookId, !save);
  }
}

async function saveBtn() {
  // Starts the chain of saveBtns
  let userData = await getUserInfo();
  if (userData != undefined) {
    const userBooks = userData.books;
    let userBooksIds = userBooks.map((book) => book.id);
    userBooksIds.forEach((bookId) => {
      updateSaveBtn(bookId, true);
    });
  }
}

/* LOAD BOOKS */

async function ratings(el, bookId) {
  // Changes the review or adds it to the user
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
  }
}

function changeStarColor(el) {
  // Changes the color of the clicked star and all stars before it in the same div.
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

function averageRating(bookArray) {
  // Checks the average rating for each book.
  let totalAvg = [];
  bookArray.forEach((book, i) => {
    const { reviews: review } = book;
    let reviews = review;
    let ratingSum = 0;

    reviews.forEach((rating) => {
      rating.rating;
      ratingSum += rating.rating;
    });

    let ratingAvg = ratingSum / reviews.length;
    ratingAvg = Math.round(ratingAvg * 10) / 10; // limit to one decimal place
    totalAvg.push(ratingAvg);
  });
  return totalAvg;
}

async function ratingBtns() {
  let userData = await getUserInfo();
  // Fills the stars to what the user has rated them if they have given a rating. Otherwise leaves it blank.
  const userReviews = userData.reviews;
  if (userData != undefined) {
    if (document.querySelector("#book-cards")) {
      userReviews.forEach((review) => {
        const reviewRating = review.rating;
        const bookId = review.book.id;
        let parentNode = document.querySelector(`#book_${bookId}_ratings`);
        let input = parentNode.querySelector(`input[value='${reviewRating}']`);
        changeStarColor(input);
      });
    } else if (document.querySelector("#profile-card")) {
      userReviews.forEach((review) => {
        const reviewRating = review.rating;
        const bookId = review.book.id;
        let parentNodeSaved = document.querySelector(`#book_${bookId}_ratings`);
        let parentNodeRated = document.querySelector(`#rated_book_${bookId}_ratings`);
        if (parentNodeSaved) {
          let input = parentNodeSaved.querySelector(`input[value='${reviewRating}']`);
          changeStarColor(input);
        }
        if (parentNodeRated) {
          let input = parentNodeRated.querySelector(`input[value='${reviewRating}']`);
          changeStarColor(input);
        }
      });
    }
  }
}

function bookDivStructure(image, title, author, pages, releaseDate, bookId, ratingAvg) {
  // Creates the book card on the home page
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
              <div><span><b>Average rating: ${ratingAvg}</b></span></div>
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

function bookRender(books, auth) {
  // Gets all info for the books via an API call and calculates rating or not depending on if the user is logged in
  if (auth) {
    const {
      attributes: { title: title, pages: pages, author: author, releaseDate: releaseDate, coverImage: coverImage, reviews: review },
    } = books;
    let id = books.id;
    const avgRating = review.data;

    let ratingSum = 0;
    avgRating.forEach((rating) => {
      rating.attributes.rating;
      ratingSum += rating.attributes.rating;
    });
    let ratingAvg = ratingSum / avgRating.length;
    ratingAvg = Math.round(ratingAvg * 10) / 10;
    // console.log(i, ratingAvg1);

    const image = coverImage.data.attributes.url;
    const card = bookDivStructure(image, title, author, pages, releaseDate, id, ratingAvg);
    return card;
  } else {
    const {
      attributes: { title: title, pages: pages, author: author, releaseDate: releaseDate, coverImage: coverImage, reviews: review },
    } = books;
    let id = books.id;
    // console.log(books);
    const image = coverImage.data.attributes.url;

    let card = bookDivStructure(image, title, author, pages, releaseDate, id);
    // console.log("card: ", card);
    return card;
  }
}

function renderColumns(card, index) {
  //Appends each card to 2 for each row
  if (index % 2 === 0) {
    // create new row for every even-numbered index
    const row = document.createElement("div");
    row.classList.add("columns", "is-centered");
    const container = document.querySelector(".book-cards");
    container.appendChild(row);
  }

  // append card to the last row in the container
  const rows = document.querySelectorAll(".columns");
  const lastRow = rows[rows.length - 1];
  lastRow.appendChild(card);
}

async function loadBooks() {
  // Loads all books via an API call and sends that info with a boolean to bookRender and renderColumns
  let authBooksArr;
  let publicBooksArr;
  if (sessionStorage.getItem("token")) {
    let auth = true;
    let authBooks = await axios.get("http://localhost:1337/api/books?populate=deep,3", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    authBooksArr = authBooks.data.data;
    authBooksArr.forEach((book, index) => {
      let card = bookRender(book, auth);
      renderColumns(card, index);
    });
  } else {
    let auth = false;
    let publicBooks = await getItems("http://localhost:1337/api/books?populate=deep,3");
    publicBooksArr = publicBooks.data.data;
    publicBooksArr.forEach((book, index) => {
      let card = bookRender(book, auth);
      renderColumns(card, index);
    });
  }

  saveBtn();
  ratingBtns();
}

/* PROFILE PAGE */

function savedBooksCard(image, title, author, pages, releaseDate, bookId, ratingAvg, i) {
  // Generates a savedBook
  let div = `
  <div class="list-item">
    <div class="columns">
      <div class="column is-one-third">
        <figure class="image is-2b3 img-no-margin">
          <img src="http://localhost:1337${image}" alt="1984 Book Cover Image"/>
        </figure>
      </div>
      <div class="column">
        <div class="card-header-title">
          <h2 class="is-size-5 title">${title}</h2>
        </div>
      <div class="media-content">
        <div class="pl-4">
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
        </div>
          <div class="field pt-3">
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
              <div><span><b>Average rating: ${ratingAvg[i]}</b></span></div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </div>
  `;
  return div;
}
function ratedBooksCard(image, title, author, pages, releaseDate, bookId, ratingAvg, i) {
  // Generates a ratedBook
  let div = `
  <div class="list-item">
    <div class="columns">
      <div class="column is-one-third">
        <figure class="image is-2b3 img-no-margin">
          <img src="http://localhost:1337${image}" alt="1984 Book Cover Image"/>
        </figure>
      </div>
      <div class="column">
        <div class="card-header-title">
          <h2 class="is-size-5 title">${title}</h2>
        </div>
      <div class="media-content">
        <div class="pl-4">
          <p>Author: ${author}</p>
          <p>Pages: ${pages}</p>
          <p>Release Date: ${releaseDate}</p>  
          <button class="button is-primary" onclick="toggleSaved(${bookId}, true)" id="rated_saveBtn_${bookId}">
            <span class="icon is-small">
              <i class="fas fa-bookmark"></i>
            </span>
            <span>
              Save
            </span>
          </button>
        </div>
          <div class="field pt-3">
            <div class="control has-text-centered" id="rated_book_${bookId}_ratings">
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
              <div><span><b>Average rating: ${ratingAvg[i]}</b></span></div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </div>
  `;
  return div;
}

function dropDownActive(user) {
  // Get all the dropdown items
  var dropdownItems = document.querySelectorAll(".dropdown-item");
  let selectedValue;
  // Loop through each dropdown item
  dropdownItems.forEach(function (item) {
    // Add a click event listener to the item
    item.addEventListener("click", function () {
      // Remove the "is-active" class from all dropdown items
      dropdownItems.forEach(function (item) {
        item.classList.remove("is-active");
      });
      // Add the "is-active" class to the clicked dropdown item
      this.classList.add("is-active");
      selectedValue = this.getAttribute("data-value");
      let ratedBooksList = document.querySelector("#ratedBooks-list");
      let saveBooksList = document.querySelector("#savedBooks-list");
      saveBooksList.innerHTML = "";
      ratedBooksList.innerHTML = "";
      printProfile(user, selectedValue);
    });
  });
}

function printProfile(user, dropdownValue) {
  // Prints the entire profile and sorts the ratedArray depending on the dropdown value
  let saveBooksList = document.querySelector("#savedBooks-list");
  let ratedBooksList = document.querySelector("#ratedBooks-list");
  if (sessionStorage.getItem("token")) {
    let username = document.querySelector("#username");
    username.innerText = "Welcome! " + user.username.charAt(0).toUpperCase() + user.username.slice(1);

    let savedBooks = user.books;
    let reviews = user.reviews;
    let ratedBooks = reviews.map((review) => review.book);
    let savedRatingAvg = averageRating(savedBooks);
    let ratedRatingAvg = averageRating(ratedBooks);

    savedBooks.forEach((book, i) => {
      let { title, pages, author, releaseDate, coverImage, id } = book;
      let bookId = id;
      const image = coverImage.url;
      let div = document.createElement("div");
      div.classList.add("box");
      div.innerHTML = savedBooksCard(image, title, author, pages, releaseDate, bookId, savedRatingAvg, i);
      saveBooksList.append(div);
    });

    // Get the selected value from the dropdown menu
    if (dropdownValue === "0") {
      ratedBooks = reviews.map((review) => review.book);
    } else if (dropdownValue === "1") {
      ratedBooks = ratedBooks.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else if (dropdownValue === "2") {
      ratedBooks = reviews
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .map((review) => review.book);
    } else if (dropdownValue === "3") {
      ratedBooks = ratedBooks.slice().sort((a, b) => b.title.localeCompare(a.title));
    } else if (dropdownValue === "4") {
      ratedBooks = reviews
        .slice()
        .sort((a, b) => a.rating - b.rating)
        .map((review) => review.book);
    }

    ratedBooks.forEach((book, i) => {
      let { title, pages, author, releaseDate, coverImage, id } = book;
      let bookId = id;
      const image = coverImage.url;
      let div = document.createElement("div");
      div.classList.add("box");
      div.innerHTML = ratedBooksCard(image, title, author, pages, releaseDate, bookId, ratedRatingAvg, i);
      ratedBooksList.append(div);
    });

    if (saveBooksList.innerHTML === "") {
      let p = document.createElement("p");
      p.innerText = "Looks a little empty here! Add some books by clicking the save button on the book page!";
      saveBooksList.append(p);
    }

    saveBtn();
    ratingBtns();
  } else if (!sessionStorage.getItem("token")) {
    if (saveBooksList.innerHTML === "") {
      let p = document.createElement("p");
      p.innerText = "Looks a little empty here! Log in to save some books!";
      saveBooksList.append(p);
    }
  }
}

async function getProfile() {
  // Gets profile info and sends it to relevant functions
  let user = await getUserInfo();
  printProfile(user);
  dropDownActive(user);
}

/* FETCHES WITH AXIOS */

async function getItems(url) {
  // Gets whatever item from the api the url is
  // Should have used this more but didn't for some reason
  let response = await axios.get(url);
  return response;
}

async function loadPage() {
  // Starts a chain of functions depending on if the user is on the profile page or home page
  removeLoginBtns();
  if (document.querySelector("#profile-card")) {
    getProfile();
  }
  if (document.querySelector("#book-cards")) {
    loadBooks();
  }
}

async function signUpUser() {
  // Registers a new user to the API
  const username = document.querySelector("#regUsername").value;
  const email = document.querySelector("#regEmail").value;
  const password = document.querySelector("#regPassword").value;

  const registerUser = {
    username: username,
    email: email,
    password: password,
  };
  console.log(registerUser);
  try {
    const response = await axios.post("http://localhost:1337/api/auth/local/register", registerUser);
    console.log(response.data); // logs the created user object
    try {
      await getUserLoginAuth(username, password);
    } catch (error) {
      console.error(error);
    }
    return response.data; // returns the created user object
  } catch (error) {
    console.error(error);
    return null; // or handle the error appropriately
  }
}

async function getUserLoginAuth(username, password) {
  // Logs in a user
  try {
    let response = await axios.post("http://localhost:1337/api/auth/local", {
      identifier: username,
      password: password,
    });
    sessionStorage.setItem("token", response.data.jwt);
    sessionStorage.setItem("username", response.data.user.username);
    sessionStorage.setItem("userId", response.data.user.id);
    window.location.href = "profile.html";
  } catch (error) {
    if (error.response) {
      alert("Wrong password or username.");
    } else {
      console.error(error);
    }
  }
}

async function getUserInfo() {
  // Gets user info, used in some specific functions to read the user data
  if (sessionStorage.getItem("token")) {
    let response = await axios.get("http://localhost:1337/api/users/me?populate=deep,4", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return response.data;
  }
}

/* CHANGE THEME */

async function getTheme() {
  // Gets theme boolean
  let theme = await getItems("http://localhost:1337/api/change-theme");
  let themeBool = theme.data.data.attributes.toggleTheme;
  toggleColor(themeBool);
}

function toggleColor(changeTheme) {
  // Changes css file depending on the boolean state
  const themeStyle = document.getElementById("theme-style");
  if (!changeTheme) {
    themeStyle.href = "style_main_theme.css";
  } else {
    themeStyle.href = "style_dark_theme.css";
  }
}

/* LOAD PAGE */
getTheme();
loadPage();
