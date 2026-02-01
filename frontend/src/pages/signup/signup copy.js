import {useForm} from "react-hook-form"
import { useDispatch } from "react-redux";
import { data, useNavigate } from "react-router";
// import {userActions} from "../../redux/slices/userSlice"
import ReCAPTCHA from "react-google-recaptcha";

import "./signup.css"
import axios from "axios";
import { UserSr } from "../../services/user";
import { AuthGoogle } from "../../components/authGoogle/authGoogle";
import { useEffect, useState } from "react";

import { jwtDecode } from 'jwt-decode';
import { userActions } from "../../redux/slices/userSlice";
import { SighnUpGoogle } from "../../components/sighnUpGoogle/sighnUpGoogle";

export const Signup = () => {
    const SITE_KEY = "6LfGhKUrAAAAAGGbk8OlEajw8mKRHBF51hI9wiLC";
    const [capVal, setCapVal] = useState();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigator = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        try {
            let reqObj = {
                email: data.email.replaceAll(' ', '').toLowerCase(),
                name: data.name.trim().toLowerCase(),
                password: data.password
            };
            await dispatch(userActions.createNewUser(reqObj));
            navigator("/");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h2>Створити акаунт</h2>
                    <p>Приєднуйтесь до нашої спільноти вже сьогодні</p>
                </div>


                <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Поле Email */}
                    <div className="input-group">
                        <label>Електронна пошта</label>
                        <input 
                            className={`main-input ${errors.email ? 'input-error' : ''}`}
                            placeholder="mail@example.com" 
                            {...register("email", { 
                                required: "Це поле обов'язкове",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Невірний формат пошти"
                                }
                            })} 
                        />
                        {errors.email && <span className="error-text">{errors.email.message}</span>}
                    </div>

                    {/* Поле Name */}
                    <div className="input-group">
                        <label>Ім'я</label>
                        <input 
                            className={`main-input ${errors.name ? 'input-error' : ''}`}
                            placeholder="Ваше ім'я" 
                            {...register("name", { 
                                required: "Введіть ім'я",
                                minLength: { value: 2, message: "Ім'я занадто коротке" }
                            })} 
                        />
                        {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>

                    {/* Поле Password */}
                    <div className="input-group">
                        <label>Пароль</label>
                        <input 
                            className={`main-input ${errors.password ? 'input-error' : ''}`}
                            type="password" 
                            placeholder="••••••••" 
                            {...register("password", { 
                                required: "Введіть пароль",
                                minLength: { value: 6, message: "Мінімум 6 символів" }
                            })} 
                        />
                        {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>

                    <div className="captcha-wrapper">
                        <ReCAPTCHA
                            sitekey={SITE_KEY}
                            onChange={(val) => setCapVal(val)}
                        />
                    </div>


                    <button className="submit-btn" disabled={!capVal}>
                        Створити акаунт
                    </button>

                    <div className="auth-divider">
                        <span>або</span>
                    </div>

                    <div className="google-signup-wrapper">
                        <SighnUpGoogle disabled={!capVal} />
                    </div>

                </form>
                {/* <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label>Електронна пошта</label>
                        <input className="main-input" placeholder="example@mail.com" {...register("email", { required: true })} />
                    </div>

                    <div className="input-group">
                        <label>Ваше ім'я</label>
                        <input className="main-input" placeholder="Введіть ваше ім'я" {...register("name", { required: true })} />
                    </div>

                    <div className="input-group">
                        <label>Пароль</label>
                        <input className="main-input" type="password" placeholder="••••••••" {...register("password", { required: true })} />
                    </div>

                    <div className="captcha-wrapper">
                        <ReCAPTCHA
                            sitekey={SITE_KEY}
                            onChange={(val) => setCapVal(val)}
                        />
                    </div>

                    <div className="actions-wrapper">
                        <button className="submit-btn" disabled={!capVal}>
                            Зареєструватися
                        </button>
                        
                        <div className="divider">
                            <span>або</span>
                        </div>

                        <div 
                            className="google-signup-wrapper" 
                            style={{ 
                                opacity: !capVal ? 0.6 : 1, 
                                pointerEvents: !capVal ? 'none' : 'auto' 
                            }}
                        >
                            <SighnUpGoogle disabled={!capVal} />
                        </div>
                    </div>
                </form> */}

                <div className="signup-footer">
                    <span>Вже маєте акаунт? </span>
                    <button onClick={() => navigator("/")} className="link-btn">Увійти</button>
                </div>
            </div>
        </div>
    );
};





// import {useForm} from "react-hook-form"
// import { useDispatch } from "react-redux";
// import { data, useNavigate } from "react-router";
// // import {userActions} from "../../redux/slices/userSlice"
// import ReCAPTCHA from "react-google-recaptcha";

// import "./signup.css"
// import axios from "axios";
// import { UserSr } from "../../services/user";
// import { AuthGoogle } from "../../components/authGoogle/authGoogle";
// import { useEffect, useState } from "react";

// import { jwtDecode } from 'jwt-decode';
// import { userActions } from "../../redux/slices/userSlice";
// import { SighnUpGoogle } from "../../components/sighnUpGoogle/sighnUpGoogle";

// export const Signup = () =>{
    

//     const SITE_KEY = "6LfGhKUrAAAAAGGbk8OlEajw8mKRHBF51hI9wiLC"
//     const SECRET_KEY = "6LfGhKUrAAAAACT-_gM-hjsC72MIGs0VnSuLq26k"

//     const [capVal, setCapVal] = useState();
//     const [error, setError] = useState(null);
//     const [userEmail, setUserEmail] = useState(false)

//     const {register, handleSubmit} = useForm();
//     const navigator = useNavigate();
//     const dispatch = useDispatch();

   

//     const onSubmit = async (data) =>{

//         try {
        
//         let reqObj = {email: data.email.replaceAll(' ','').toLowerCase(), 
//             name: data.name.replaceAll(/\w\s+\w/g, "_").replaceAll(" ", "").replaceAll("_", " ").toLowerCase(),
//             password: data.password}

//         await dispatch(userActions.createNewUser(reqObj))

//         navigator("/")


//         } catch (err) {
//           console.log(err)
//         }
//     }

//     useEffect(()=>{

//     },[])

//     return(
//         <div className="page">


//            <form className="page" onSubmit={handleSubmit(onSubmit)}>

           
//                 <div className="form">

//                         {error&& <div className="error">
//                             {error}
//                         </div>}

//                     <div className="input">
//                         <input className="inp" placeholder="Email" {...register("email")} />
//                     </div>

//                     <div className="input">
//                         <input className="inp" placeholder="Name" {...register("name")} />
//                     </div>

//                     <div className="input">
//                         <input className="inp" placeholder="Password" {...register("password")} />
//                     </div>

//                     <div className="input">
//                         <ReCAPTCHA
//                             sitekey={SITE_KEY}
//                             onChange={(val) => setCapVal(val)}          
//                         />
//                     </div>
                   

                    
//                     <div className="input" disabled={!capVal} >
                        
//                         <button className="button" disabled={!capVal}>
//                             signup
//                         </button>
//                         <div 
//         className="Createbutton" 
//         style={{ 
//             opacity: !capVal ? 0.5 : 1, 
//             pointerEvents: !capVal ? 'none' : 'auto', // Це вимкне можливість кліку
//             cursor: !capVal ? 'not-allowed' : 'pointer' 
//         }}
//     >
//                         <SighnUpGoogle disabled={!capVal}/>
//                         </div>
//                     </div>
                
//                 </div>
                
//             </form> 
            
//         </div>
//     )
// }