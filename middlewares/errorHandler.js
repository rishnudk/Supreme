// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        user: req.session.user ? req.session.user._id : 'Unauthenticated'
    });

    // Determine the status code (default to 500 if not set)
    const statusCode = err.statusCode || 500;

    // Handle 404 specifically
    if (statusCode === 404) {
        return res.status(404).render('user/404', {
            title: '404 - Page Not Found',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    }

    // Prepare the response for other errors
    const response = {
        success: false,
        status: statusCode,
        message: err.message || 'Something went wrong on the server'
    };

    // Include stack trace in development mode only
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    // Handle specific cases (e.g., blocked users)
    if (err.message === 'User blocked by admin') {
        req.flash('error_msg', 'You have been blocked by the admin');
        return res.redirect('/user/login');
    }

    // Send JSON for API routes or render a generic error page for HTML
    if (req.accepts('json') && !req.accepts('html')) {
        res.status(statusCode).json(response);
    } else {
        res.status(statusCode).render('user/error', {
            title: `Error ${statusCode}`,
            status: statusCode,
            message: response.message,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    }
};

module.exports = errorHandler;