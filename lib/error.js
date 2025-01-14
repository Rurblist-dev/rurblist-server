const createError = (status, message, error) => {
    const customErr = new Error();

    customErr.status = status||500;
    customErr.message = message||"Something went wrong!";
    throw customErr;
}


module.exports = createError;