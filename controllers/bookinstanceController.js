const BookInstance = require("../models/bookinstance");
const Book=require("../models/book"); 
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const unsortedBookInstances = await BookInstance.find().populate("book").exec();
    sortedBookInstances=_.orderBy(unsortedBookInstances,['status','book.title'],['asc','asc']);
    // sortedBookInstances=_.orderBy(unsortedBookInstances,'book.title','desc');
    // sortedBookInstances=_.sortBy(unsortedBookInstances,[function(i){ return i.book.title;}]);
    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: sortedBookInstances,
    //   bookinstance_list: allBookInstances,
    });
  });
  

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});


// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];


// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  bookinstance= await BookInstance.findById(req.params.id).exec();
  if ( bookinstance === null )
    return this.bookinstance_list();
  res.render("bookinstance_delete",bookinstance);
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.params.id);
  this.bookinstance_list(req,res,next);
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("Bookinstance update_get à faire");
});
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("Bookinstance update_post à faire");
});

