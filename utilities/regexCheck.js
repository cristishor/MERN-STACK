const checkEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(email)
    return emailRegex.test(email);
};
  
const checkPasswordFormat = (password) => {
    // Customize the password regex based on your requirements
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    return passwordRegex.test(password);
};

module.exports = { checkEmailFormat, checkPasswordFormat }