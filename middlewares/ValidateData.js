export const validateData = async (ctx, next) => {
  try {
    // console.log("ctx.request.body : ", ctx.request.body);

    for (const [key, value] of Object.entries(ctx.request.body)) {
      if (value == "") {
        ctx.status = 400;
        ctx.body = "Please fill in all fields";
        return;
      } else {
        if (key == "email") {
          const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
          const validateEmail = emailPattern.test(ctx.request.body.email);

          if (!validateEmail) {
            ctx.status = 400;
            ctx.body = "Invalid e-mail";
            return;
          }
        } else if (key == "password") {
          // i uppercase, 1 lowercase, 8-12 character in length, special characters - @, $, #, !, %, *, _, ?, &
          const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*_?&])[A-Za-z\d@$#!%*_?&]{8,12}$/;

          const validatePassword = passwordPattern.test(
            ctx.request.body.password
          );

          if (!validatePassword) {
            ctx.status = 400;
            ctx.body =
              "Password must contain minimum eight and maximum 12 characters, at least one uppercase letter, one lowercase letter, one number, one special character and should not contain spaces";
            return;
          }
        } else if (key == "otp") {
          // number only of length 4
          const otpPattern = /^[0-9]{4}$/g;
          const validateOtp = otpPattern.test(ctx.request.body.otp);

          if (!validateOtp) {
            ctx.status = 400;
            ctx.body = "Invalid OTP";
            return;
          }
        } else if (key == "mobile") {
          // number of length 10
          const mobilePattern = /^[0-9]{10}$/g;
          const validateMobile = mobilePattern.test(ctx.request.body.mobile);

          if (!validateMobile) {
            ctx.status = 400;
            ctx.body = "Invalid Mobile number";
            return;
          }
        } else if (key == "username") {
          // lowercase only, number (optional), 8-12 in length
          const usernamePattern = /^(?=.*[a-z])[a-z0-9]{8,12}$/;
          const validateUsername = usernamePattern.test(
            ctx.request.body.username
          );

          if (!validateUsername) {
            ctx.status = 400;
            ctx.body =
              "Username can contain only lowercase alphabets (a-z) and numbers (0-9). Numbers are optional but atleast one lowercase alphabet is required. Length of username should be between 8 to 12 characters";
            return;
          }
        }
      }
    }

    await next();
  } catch (error) {
    console.log("data validation error : ", error);
    ctx.status = 400;
    ctx.body = error.message;
    return;
  }
};
