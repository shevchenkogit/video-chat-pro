import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from "react-google-recaptcha";

import { userActions } from "../../redux/slices/userSlice";
import { AuthGoogle } from "../../components/authGoogle/authGoogle";
import { AppContext } from "../..";

import "./homePage.css";

export const HomePage = () => {
    const SITE_KEY = process.env.REACT_APP_SITE_KEY;
    const { socket } = useContext(AppContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [capVal, setCapVal] = useState(null);
    const [show, setShow] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange"
    });

    const { getToken, isAuth, isLoading, error } = useSelector(state => state.user);
    // Використовуємо useMemo, щоб не читати localStorage при кожному рендері
    const token = useMemo(() => localStorage.getItem('ut'), [isAuth]);

    const onLoginSubmit = (data) => {
        dispatch(userActions.logIn(data));
    };

    useEffect(() => {
        let isMounted = true;

        if (token && isMounted && !isAuth) {
            dispatch(userActions.authToken(token));
        }

        if (isAuth && token && isMounted) {
            try {
                // Додана перевірка на формат токена (Bearer <token>)
                const tokenParts = token.includes(" ") ? token.split(" ")[1] : token;
                
                if (tokenParts) {
                    const decoded = jwtDecode(tokenParts);
                    const rawUser = localStorage.getItem("user");
                    const userLocal = rawUser ? JSON.parse(rawUser) : {};
                    
                    userLocal.id = decoded.id;
                    localStorage.setItem("user", JSON.stringify(userLocal));
                    
                    if (socket) socket.emit("logIn", decoded.id);
                    navigate("/user_page");
                }
            } catch (e) {
                console.error("JWT Decode Error:", e);
                // Якщо токен битий — краще його видалити
                // localStorage.removeItem('ut');
            }
        }
        return () => { isMounted = false; };
    }, [isAuth, token, dispatch, navigate, socket]);

    const renderStatusMessages = () => {
        if (!getToken?.msg) return null;

        const messages = {
            "user not exist!": {
                title: "Ой! Вас не знайдено",
                desc: "Ваш email не зареєстрований у нашій системі.",
                btn: true
            },
            "need email verification!": { // Виправлено typo
                title: "Підтвердіть пошту",
                desc: "Ми надіслали лист для верифікації на вашу адресу.",
                btn: false
            },
            "user created!": {
                title: "Успіх!",
                desc: "Акаунт створено. Перевірте пошту для активації.",
                btn: false
            }
        };

        const current = messages[getToken.msg];
        if (!current) return null;

        return (
            <div className="status-box">
                <h1>{current.title}</h1>
                <p>{current.desc}</p>
                {current.btn && (
                    <button className="Createbutton" onClick={() => navigate("/signup")}>
                        Зареєструватися
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className={!show ? "Page" : "Pagedark"}>
            {isLoading && <div className="loader-overlay"><div className="spinner"></div></div>}
    
            <div className="container-wrapper">
                {!show ? (
                    <div className="fade-in-scale">
                        <div className="board">
                            {isAuth ? (
                                <button className="Createbutton" onClick={() => navigate("/user_page")}>Enter</button>
                            ) : (
                                <>
                                    <button className="Createbutton" onClick={() => setShow(true)}>Log In</button>
                                    <div className="sighnUp">
                                        <label>New here?</label> 
                                        <span onClick={() => navigate("/signup")} className="link-text"> Click here</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="fade-in-scale">
                        <div className="Sboard">
                            <form onSubmit={handleSubmit(onLoginSubmit)}>
                                {error && <div className="error-message">{error.msg || "Error"}</div>}
                                
                                <input placeholder="Email" {...register("email", { required: true })} />
                                
                                <div className="password-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Password" 
                                        {...register("password", { required: true })} 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "🙈": "👁️"}
                                    </button>
                                </div>
    
                                <div className="captcha-container">
                                    <ReCAPTCHA sitekey={SITE_KEY} onChange={setCapVal} />
                                </div>
    
                                <button 
                                    type="submit"
                                    className="Createbutton" 
                                    disabled={!capVal || isLoading}
                                >
                                    {isLoading ? "Loading..." : "Log In"}
                                </button>
                            </form>

                            <div className="separator"><span>OR</span></div>

                            <div className="google-auth-wrapper">
                                <AuthGoogle disabled={!capVal}/>
                            </div>
                            
                            <button className="back-button" onClick={() => setShow(false)}>← Back</button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="messages-area">
                {renderStatusMessages()}
            </div>
        </div>
    );
};