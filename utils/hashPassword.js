import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.log('hashedPassword : ',error);
    // this.res.status(500).json({ message: error.message });
  }
};