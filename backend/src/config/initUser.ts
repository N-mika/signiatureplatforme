import User from "../models/user"
import bcrypt from "bcrypt"
export const initUser = async () => {
  const password = '0000';
  const existUser = await User.findOne({id : 'admin'});
  if(!existUser){ 
    const user = await User.create({
      id: "admin",
      email: "michaelnadrasana@gmail.com",
      password: await bcrypt.hash(password, 10),
      name : "Mika Tikeo" ,
      isActif : true
    })
    console.log('Utilisateur initier' , user);
  }
}