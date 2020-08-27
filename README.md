# Project: **_Kid Booktivist_**

Kid Booktivist is an application that assists parents in their search to find books for their children that deal with issues of equality, diversity, equity and social justice.

## User Story: \*\*\*

A user goes onto the site and find books that relate to their search criteria about diversity and social justice topics. The user can register and create a profile page, add books to the site through the use of an ISBN number, find books by categories and save books onto their library.

## Functional Specification:

- There is a navbar with links to various pages that is consistent through the site.
- There is a footer that provides additional links as well as additional resources and information for parents
- On the landing page, there is an ability to search for books by categories as well as the ability to open each book and see further details about the book such as title, author, illustrator, description, parental insights and YouTube Links
- The user begins by registering for the sight in order to be able to fully utilize the add book functionalities to their libraries and the database
- In the book modal, the user is able to add books to their library.
- In the add book page, the user is able to add favorite books to the website to be approved by the administrator.
- In the categories page, users are able to search for books by categories, author or book title.

## App Structure

When building the app, we had to take a data-driven approach. Our first consideration was, what were the different data elements we needed to store, and of those data elements, what was the most efficient way to store the data. The answers to these questions would determine the overall build.

### Book Data

We needed a table to store most book data. That data included standard information, such as author, title, subtitle, and book description. It also needed to store a boolean value for a column we titled "added." Because books are crowd-sourced. It was important that we used at least one validation method to prevent users from directly uploading to the site.

We used the data from the book table to populate almost every page of our app. The front end used a call for basic book info to create cards (as seen on the homepage). When clicked, these cards would opena modal with more extensive book information. When clicked, the button that activated the modal, would pass the book id to the function creating the modal so it could use that book id to make a specific get request.
Here's the backend call for getting a book by id:

```
router.get('/api/book/:id', (req, res) => {
  db.Book.findOne({
    where: { id: req.params.id },
  }).then((dbBook) => {
    res.json(dbBook);
  });
});
```

### Book Category Data

One tricky element of the book data was sorting books by category. Because a book can have multiple categories, we needed to create a specific model to join the books and categories table. The resulting table holds books by id ordered by category id. With this table, we can search for books by category, which allows us to use multiple category search dropdowns.

```
router.get('/api/books/category/:id', (req, res) => {
  db.Category.findAll({
    raw: true,
    where: { id: req.params.id },
    include: [
      {
        model: db.Book,
        where: { added: true },
        as: 'books',
        attributes: ['id', 'title', 'author', 'image_link', 'description'],
      },
    ],
  }).then((dbBooks) => {
    res.json(dbBooks);
  });
});
```

### Handling book searches on the front end

The trickiest search on the front end was when a user executed a search by category from the category dropdown on the homepage. It needed to store the category data, execute a new HTML route to the categories page, an on load, execute a get request with the category data from the previous page. The solution was to build a URL containing all the search criteria, then parse that url and pass that information into the get request.

In addition to allowing the user to search by category, there is also a search by keyword feature. This block of code determines what kind of search the user is attempting to execute, parses the relevant search data, and executes the corresponding get request.

```
$(document).ready(() => {
  // on document load - pull url provided and splice
  const catUrl = window.location.href;
  console.log(catUrl.length);
  if (catUrl.length > 40) {
    const key = catUrl.slice(catUrl.indexOf('?') + 1, catUrl.indexOf('='));
    let urlPath = '';
    let keyValue = catUrl.slice(catUrl.indexOf('=') + 1, catUrl.indexOf('+'));
    const urlCategory = catUrl
      .slice(catUrl.indexOf('+') + 1, catUrl.length)
      .replace(/&/g, ' ')
      .replace(/_/g, '/');

    // if the key = search, this means it's a search request from the homepage
    // this calls a search specific get request
    if (key === 'search') {
      keyValue = catUrl.slice(catUrl.indexOf('=') + 1, catUrl.length);
      urlPath = key;
      const searchCriteria = keyValue.toUpperCase().replace(/&/g, ' ');
      // eslint-disable-next-line no-use-before-define
      $.when(getBooksbyCat(urlPath, keyValue, searchCriteria, false)).then(
        () => {
          // eslint-disable-next-line no-use-before-define
          getModal();
        }
      );
    } else {
      // if not a search request, then it is a category request
      urlPath = `books/${key}`;
      // eslint-disable-next-line no-use-before-define
      $.when(getBooksbyCat(urlPath, keyValue, urlCategory, true)).then(() => {
        // eslint-disable-next-line no-use-before-define
        getModal();
      });
    }
  }
});
```

### User Data

In addition the challenges we faced with book data, we had equally as many challenges with user data. Users needed to be able to create accounts and login. However we also needed to be able to denote specific users as admins, and then allow only the admins to log into a specific admin portal. In addition to this we also needed to create user-specific libraries so users could login and save books to their own library.

For this, we needed to create a table that joined users and books, storing book ids and user ids.

```
module.exports = (sequelize, DataTypes) => {
  const UserBooks = sequelize.define('UserBooks', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


  });
  return UserBooks;
};
```

We then tied a usertable specific get request to the modal pop-up. Everytime a book modal is opened, we check first if the user is logged in or not. If they are logged in, we then check if the user has this book in their library or not. Based on the results returned, the modal would either present a plus-sign to add the book or a minus-sign to remove the book from the user library.

```
const getModal = () => {
  $('.titleModal').click(function() {
    const index = this.value;
    $.ajax('api/user_data', { type: 'GET' }).then((userData) => {
      if (userData.message === false) {
        notLoggedIn();
      } else {
        $.ajax(`api/mylibrary/${index}`, { type: 'GET' }).then((isAdded) => {
          if (isAdded === null) {
            addBookToLibrary(index);
          } else {
            removeBookFromLibrary(index);
          }
        });
      }
    });
    fillModal(index);
  });
};
```

## Tech Spechs

- We designed this app with Bootstrap for our frontend CSS
- We used sequelize and mysql to help with data storage and creation
- Passport JS was used to help with user validation, login, and storage of information by user ID
- The front end is powered primarily by jquery
- We also use a number of fontawesome features throught

## Next Steps

The scope of our app was definitely larger than the two week time-frame allowed for. There is some additional functionality that we would love to build out for a future iteration of this app. Primarily, there are some features that we would like to add to improve user experience. For example, adding more purpose driven resources for users to utilize. We'd also like to add a search by age feature.

## Deployed App link
https://ancient-escarpment-64438.herokuapp.com/
