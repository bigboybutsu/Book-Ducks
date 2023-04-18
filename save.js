async function averageRating(bookArray) {
  let response = await axios.get("http://localhost:1337/api/books?populate=deep,3", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  let bookArray = response.data.data;

  bookArray.forEach((book, i) => {
    const {
      attributes: { reviews: review },
    } = book;
    let reviews = review.data;
    let ratingSum = 0;

    reviews.forEach((rating) => {
      rating.attributes.rating;
      ratingSum += rating.attributes.rating;
    });

    let ratingAvg = ratingSum / reviews.length;
    ratingAvg = Math.round(ratingAvg * 10) / 10; // limit to one decimal place

    console.log(i, ratingAvg);
    // console.log(i, reviews);
    return ratingAvg;
  });
}

async function loadBooks() {
  let bookArray;
  if (sessionStorage.getItem("token")) {
    let authBooks = await axios.get("http://localhost:1337/api/books?populate=deep,3", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    bookArray = authBooks.data.data;
  } else {
    let publicBooks = await getItems("http://localhost:1337/api/books?populate=deep,3");
    bookArray = publicBooks.data.data;
    console.log(bookArray);
  }
  for (let i = 0; i < bookArray.length; i += 2) {
    const {
      attributes: { title: title1, pages: pages1, author: author1, releaseDate: releaseDate1, coverImage: coverImage1, reviews: review1 },
    } = bookArray[i];
    let id1 = bookArray[i].id;
    // console.log(bookArray[i + 1].id);
    const avgRating1 = review1.data;

    let ratingSum1 = 0;
    avgRating1.forEach((rating) => {
      rating.attributes.rating;
      ratingSum1 += rating.attributes.rating;
    });
    let ratingAvg1 = ratingSum1 / avgRating1.length;
    ratingAvg1 = Math.round(ratingAvg1 * 10) / 10;
    // console.log(i, ratingAvg1);

    const image1 = coverImage1.data.attributes.url;
    const card1 = bookDivStructure(image1, title1, author1, pages1, releaseDate1, id1, ratingAvg1);

    const {
      attributes: { title: title2, pages: pages2, author: author2, releaseDate: releaseDate2, coverImage: coverImage2, reviews: review2 } = {},
    } = bookArray[i + 1] || {};
    let id2 = bookArray[i + 1].id;
    const avgRating2 = review2?.data;

    let ratingSum2 = 0;
    avgRating2.forEach((rating) => {
      rating.attributes.rating;
      ratingSum2 += rating.attributes.rating;
    });
    let ratingAvg2 = ratingSum2 / avgRating2.length;
    ratingAvg2 = Math.round(ratingAvg2 * 10) / 10;
    // console.log([i + 1], ratingAvg2);

    const image2 = coverImage2?.data?.attributes?.url;
    const card2 = bookDivStructure(image2, title2, author2, pages2, releaseDate2, id2, ratingAvg2);

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
