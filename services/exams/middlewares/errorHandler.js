const errorHandler = (err, req, res, next) => {

    console.log(err, '<<<<<< ERROR')
    console.log(err.name, '<<<<<< ERROR NAME')

    let code = 500;
    let msg = 'Internal Server Error';

    //validasi sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        code = 400;
        msg = err.errors[0].message;
    }

    if (err.name === 'NotFound') {
        code = 404
        msg = 'Not Found'
    }

    if (err.name === 'AlreadySubscribe') {
        code = 400
        msg = 'You already subscribe'
    }

    if (err.name === 'Unauthorized') {
        code = 401
        msg = 'Invalid email / password'
    }

    if (err.name === 'EmailRequired') {
        code = 400
        msg = 'Email is required'
    }

    if (err.name === 'PasswordRequired') {
        code = 400
        msg = 'Password is required'
    }

    if (err.name === 'Forbidden' || err.name === 'JsonWebTokenError') {
        code = 403
        msg = 'Access denied'
    }

    if (err.name === 'OldPasswordRequired') {
        code = 400
        msg = "Old password is required"
    }

    if (err.name === 'InvalidOldPassword') {
        code = 400
        msg = "Invalid old password"
    }

    if (err.name === 'NothingUpdate') {
        msg = "Didn't change anything"
    }

    if (err.name === 'InvalidPin') {
        msg = 'Invalid PIN'
    }

    if (err.name === 'InvalidQuestions') {
        code = 400
        msg = 'Questions minimum 5 and maximum 100'
    }

    if (err.name === 'InvalidDuration') {
        code = 400
        msg = 'Duration minimum 5 and maximum 180 minutes'
    }

    if (err.name === 'ExamClose') {
        code = 403
        msg = 'Exam has been closed'
    }

    if (err.name === 'TimeOver') {
        code = 403
        msg = 'Time over'
    }

    if (err.name === 'ExamTaken') {
        code = 400
        msg = 'You have done this test'
    }

    if (err.name === 'PremiumExam') {
        code = 403
        msg = 'Only premium member can take this exam'
    }

    if (err.name === 'isNotComfirm') {
        code = 401
        msg = 'Pending Account. Please Verify Your Email!'
    }

    if (err.name === 'TokenRequired') {
        code = 400
        msg = 'Input token confirmation first'
    }

    if (err.name === 'InvalidToken') {
        code = 400
        msg = 'Invalid token'
    }

    if (err.name === 'InvalidVerificationInfo') {
        code = 401
        msg = 'Invalid email / token'
    }

    if (err.name === 'UploadFailed') {
        code = 500
        msg = 'Failed upload image'
    }

    if (err.name === 'FileRequired') {
        code = 400
        msg = 'Image file empty'
    }

    if (err.name === 'MidtransError') {
        code = 400
        msg = err.ApiResponse.error_messages[0]
    }

    res.status(code).json({
        message: msg
    });
};

module.exports = errorHandler