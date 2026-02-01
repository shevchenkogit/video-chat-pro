import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";

import { userActions } from "../../redux/slices/userSlice";
import { SignUpGoogle } from '../../components/sighnUpGoogle/sighnUpGoogle';

import "./signup.css";

export const Signup = () => {
    // Рекомендую винести SITE_KEY в .env файл для безпеки
    const SITE_KEY = process.env.REACT_APP_SITE_KEY || "6LfGhKUrAAAAAGGbk8OlEajw8mKRHBF51hI9wiLC";
    
    const [capVal, setCapVal] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        mode: "onBlur" // Валідація спрацює, коли користувач покине поле
    });
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        try {
            const reqObj = {
                email: data.email.trim().toLowerCase(),
                name: data.name.trim(), // Зберігаємо оригінальний регістр або робимо toLowerCase за потребою
                password: data.password
            };
            
            await dispatch(userActions.createNewUser(reqObj));
            // Після успішної реєстрації зазвичай ведемо на сторінку підтвердження або входу
            navigate("/");
        } catch (err) {
            console.error("Signup error:", err);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card shadow-lg">
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
                                minLength: { value: 2, message: "Ім'я занадто коротке" },
                                maxLength: { value: 30, message: "Ім'я занадто довге" }
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

                    <button 
                        className="submit-btn" 
                        disabled={!capVal || isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? "Створення..." : "Створити акаунт"}
                    </button>

                    <div className="auth-divider">
                        <span>або</span>
                    </div>

                    <div className="google-signup-wrapper">
                        <SighnUpGoogle disabled={!capVal} />
                    </div>
                </form>

                <div className="signup-footer">
                    <span>Вже маєте акаунт? </span>
                    <button onClick={() => navigate("/")} className="link-btn">Увійти</button>
                </div>
            </div>
        </div>
    );
};