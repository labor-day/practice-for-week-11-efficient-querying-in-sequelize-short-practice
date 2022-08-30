// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Author, Book, Review, Reviewer, sequelize } = require('./db/models');
const { Op } = require("sequelize");


// Express using json - DO NOT MODIFY
app.use(express.json());

// STEP #Ob: Test logging behavior - DO NOT MODIFY
app.get('/test-benchmark-logging', async (req, res) => {   // > 100 ms execution time
    const books = await Book.findAll({
        include: [
            { model: Author },
            { model: Review },
            { model: Reviewer }
        ],
        // Uncomment the lines below to see the data structure more clearly
        limit: 100,
        offset: 2000
    });
    res.json(books);
});


// STEP #1: Benchmark a Frequently-Used Query
app.get('/books', async (req, res) => {

    //this method takes 70-90 ms because we filter our books after querying
    // let books = await Book.findAll({
    //     include: Author,
    // });

    // // Filter by price if there is a maxPrice defined in the query params
    // if (req.query.maxPrice) {
    //     books = books.filter(book => book.price < parseInt(req.query.maxPrice));
    // };
    // res.json(books);

    //filter at the same time as querying = 25-30ms
    let books;
    if (req.query.maxPrice) {
        books = await Book.findAll({
            include: Author,
            where: {
                price: {
                    [Op.lt]: req.query.maxPrice
                }
            }
        });
    } else {
        books = await Book.findAll({
            include: Author
        });
    }


    res.json(books);
});

    // 1a. Analyze:

        // Record Executed Query and Baseline Benchmark Below:

        // - What is happening in the code of the query itself?


        // - What exactly is happening as SQL executes this query?




// 1b. Identify Opportunities to Make Query More Efficient

    // - What could make this query more efficient?


// 1c. Refactor the Query in GET /books



// 1d. Benchmark the Query after Refactoring

    // Record Executed Query and Baseline Benchmark Below:

    // Is the refactored query more efficient than the original? Why or Why Not?





// STEP #2: Benchmark and Refactor Another Query
// app.patch('/authors/:authorId/books', async (req, res) => {
//     const author = await Author.findOne({
//         include: { model: Book },
//         where: {
//             id: req.params.authorId
//         }
//     });

//     if (!author) {
//         res.status(404);
//         return res.json({
//             message: 'Unable to find an author with the specified authorId'
//         });
//     }

//     for (let book of author.Books) {
//         book.price = req.body.price;
//         await book.save();
//     }

//     const books = await Book.findAll({
//         where: {
//             authorId: author.id
//         }
//     });

//     res.json({
//         message: `Successfully updated all authors.`,
//         books
//     });

    //current method takes 12 * 4 = 48 ms
//});

app.patch('/authors/:authorId/books', async (req, res, next) => {

    try {
        await Book.update(
            {price: 19.99},
            {where: {
                authorId: {
                    [Op.eq]: req.params.authorId
                }
            }}
        );
        let books = await Book.findAll({
            where: {
                authorId: {
                    [Op.eq]: req.params.authorId
                }
            }
        })
        res.json({message: `Successfully updated all authors.`, books});
    } catch(err) {
        res.json({message: 'Unable to find an author with the specified authorId' });
    }

    //8 ms

});




// BONUS Step: Benchmark and Add Index
// Examples:
    // GET /reviews?firstName=Daisy&lastName=Herzog
    // GET /reviews?firstName=Daisy
    // GET /reviews?lastName=Herzog
    // initial implementation takes 6ms, 2ms, 1ms
app.get('/reviews', async (req, res) => {
    const { firstName, lastName } = req.query;

    // Check values in query parameters to define where conditions of the query
    const whereClause = {};
    if (firstName) whereClause.firstName = firstName;
    if (lastName) whereClause.lastName = lastName;

    const reviews = await Review.findAll({
        include: {
            model: Reviewer,
            where: whereClause,
            attributes: ['firstName', 'lastName']
        },
    });

    res.json(reviews);
});



// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// GET /authors/:authorId/books (test route) - DO NOT MODIFY
app.get('/authors/:authorId/books', async (req, res) => {
    const author = await Author.findOne({
        where: {
            id: req.params.authorId
        }
    });

    if (!author) {
        res.status(404);
        return res.json({ message: 'Unable to find an author with the specified authorId' });
    }

    const books = await Book.findAll({
        where: { authorId: author.id }
    });

    res.json(books);
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));
