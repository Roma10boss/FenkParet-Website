// pages/auth/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { LoadingPage } from '../../components/ui/LoadingPage';
import toast from 'react-hot-toast';

import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import styles from './Login.module.css';

export default function Login() {
  const router = useRouter();
  const { login, register: authRegister, isAuthenticated, loading: authLoading } = useAuth();
  const { mounted: themeMounted } = useTheme();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isHookFormSubmitting },
    reset,
    setError: setFormError,
  } = useForm();

  const { redirect } = router.query;

  const pageIsLoading = authLoading || !themeMounted;

  useEffect(() => {
    if (!pageIsLoading && isAuthenticated) {
      const redirectTo = redirect || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, pageIsLoading, router, redirect]);

  useEffect(() => {
    // Clear form when switching modes
    reset();
  }, [isRegisterMode, reset]);

  if (pageIsLoading) {
    return <LoadingPage message="Loading authentication..." />;
  }

  if (isAuthenticated) return null;

  const onSubmit = async (data) => {
    setIsSubmittingForm(true);

    let result;
    if (isRegisterMode) {
      if (data.password !== data.confirmPassword) {
        setFormError('confirmPassword', { type: 'manual', message: 'Passwords do not match!' });
        setIsSubmittingForm(false);
        return;
      }
      if (data.password.length < 6) {
        setFormError('password', { type: 'manual', message: 'Password must be at least 6 characters long!' });
        setIsSubmittingForm(false);
        return;
      }

      const registerData = {
        name: data.fullName,
        email: data.email,
        password: data.password,
      };

      result = await authRegister(registerData);
      if (result.success) {
        toast.success('Registration successful! You are now logged in.');
      } else {
        toast.error(result.error || 'Registration failed.');
      }

    } else {
      result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Logged in successfully!');
      } else {
        toast.error(result.error || 'Login failed.');
      }
    }

    setIsSubmittingForm(false);
  };

  const pageTitle = isRegisterMode ? 'Register' : 'Login';

  return (
    <>
      <Head>
        <title>{pageTitle} | {process.env.NEXT_PUBLIC_SITE_NAME || 'Fenkparet'}</title>
        <meta name="description" content={isRegisterMode ? 'Create your Fenkparet account.' : 'Log in to your Fenkparet account.'} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={`${styles.section} ${styles.fullHeight}`}>
        <div className="container-fluid d-flex justify-content-center align-items-center h-100">
          <div className="text-center w-100">
            <div className={`${styles.section} text-center`}>
                <h6 className={`mb-0 pb-3 ${styles.headerText}`}>
                  <span 
                    className={!isRegisterMode ? styles.activeHeaderText : ''}
                    onClick={() => {
                      if (isRegisterMode) {
                        setIsRegisterMode(false);
                        reset();
                      }
                    }}
                  >
                    Connexion
                  </span>
                  <span 
                    className={isRegisterMode ? styles.activeHeaderText : ''}
                    onClick={() => {
                      if (!isRegisterMode) {
                        setIsRegisterMode(true);
                        reset();
                      }
                    }}
                  >
                    Inscription
                  </span>
                </h6>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  id="reg-log"
                  name="reg-log"
                  checked={isRegisterMode}
                  onChange={() => {
                    setIsRegisterMode(!isRegisterMode);
                    reset();
                  }}
                />
                <label htmlFor="reg-log"></label>
                <div className={`${styles.card3dWrap} mx-auto`}>
                  <div className={styles.card3dWrapper}>
                    
                    {/* Login Front */}
                    <div className={styles.cardFront}>
                      <div className={styles.centerWrap}>
                        <div className={`${styles.section} text-center`}>
                          <h4 className="mb-4 pb-3 text-theme-primary">Log In</h4>


                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-group mb-4 relative">
                              <input
                                type="email"
                                className="form-input pl-10"
                                placeholder="Your Email"
                                id="login-email"
                                autoComplete="off"
                                {...register('email', {
                                  required: 'Email is required.',
                                  pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Enter a valid email address.'
                                  }
                                })}
                              />
                              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              {errors.email && (
                                <p className="form-error mt-1 text-left">{errors.email.message}</p>
                              )}
                            </div>

                            <div className="form-group mb-4 relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input pl-10 pr-10"
                                placeholder="Your Password"
                                id="login-password"
                                autoComplete="off"
                                {...register('password', {
                                  required: 'Password is required.',
                                  minLength: {
                                    value: 6,
                                    message: 'Min 6 characters.'
                                  }
                                })}
                              />
                              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                              </button>
                              {errors.password && (
                                <p className="form-error mt-1 text-left">{errors.password.message}</p>
                              )}
                            </div>

                            <button type="submit" className="btn-primary w-full mt-4" disabled={isHookFormSubmitting || isSubmittingForm}>
                              {isHookFormSubmitting || isSubmittingForm ? 'Submitting...' : 'Login'}
                            </button>
                          </form>

                          <p className="mb-0 mt-4 text-center text-theme-secondary">
                            <Link href="/auth/forgot-password" className="text-accent hover:text-accent-dark">
                              Forgot your password?
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Register Back */}
                    <div className={styles.cardBack}>
                      <div className={styles.centerWrap}>
                        <div className={`${styles.section} text-center`}>
                          <h4 className="mb-4 pb-3 text-theme-primary">Sign Up</h4>


                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-group mb-4 relative">
                              <input
                                type="text"
                                className="form-input pl-10"
                                placeholder="Your Full Name"
                                id="register-fullname"
                                autoComplete="off"
                                {...register('fullName', { required: 'Full Name is required.' })}
                              />
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              {errors.fullName && (
                                <p className="form-error mt-1 text-left">{errors.fullName.message}</p>
                              )}
                            </div>

                            <div className="form-group mb-4 relative">
                              <input
                                type="email"
                                className="form-input pl-10"
                                placeholder="Your Email"
                                id="register-email"
                                autoComplete="off"
                                {...register('email', {
                                  required: 'Email is required.',
                                  pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Enter a valid email address.'
                                  }
                                })}
                              />
                              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              {errors.email && (
                                <p className="form-error mt-1 text-left">{errors.email.message}</p>
                              )}
                            </div>

                            <div className="form-group mb-4 relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input pl-10 pr-10"
                                placeholder="Your Password"
                                id="register-password"
                                autoComplete="off"
                                {...register('password', {
                                  required: 'Password is required.',
                                  minLength: {
                                    value: 6,
                                    message: 'Min 6 characters.'
                                  }
                                })}
                              />
                              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                              </button>
                              {errors.password && (
                                <p className="form-error mt-1 text-left">{errors.password.message}</p>
                              )}
                            </div>

                            <div className="form-group mb-4 relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-input pl-10 pr-10"
                                placeholder="Confirm Password"
                                id="register-confirm-password"
                                autoComplete="off"
                                {...register('confirmPassword', {
                                  required: 'Confirm Password is required.',
                                })}
                              />
                              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-tertiary" />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                              </button>
                              {errors.confirmPassword && (
                                <p className="form-error mt-1 text-left">{errors.confirmPassword.message}</p>
                              )}
                            </div>

                            <button type="submit" className="btn-primary w-full mt-4" disabled={isHookFormSubmitting || isSubmittingForm}>
                              {isHookFormSubmitting || isSubmittingForm ? 'Submitting...' : 'Register'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
