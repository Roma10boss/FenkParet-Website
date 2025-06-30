import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  KeyIcon,
  BellIcon,
  LanguageIcon,
  SunIcon, 
  MoonIcon, 
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth'; 
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { LoadingPage } from '../../components/ui/LoadingPage'; 

export default function Profile() {
  const router = useRouter();
  const { user, updateUser, changePassword, isAuthenticated, loading: authLoading } = useAuth();
  const { theme, toggleTheme, isDark, mounted: themeMounted } = useTheme(); 
  const currentLocale = 'en';
  const changeLanguage = (lang) => console.log('Language change:', lang);
  const getAvailableLanguages = () => [{ code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }];

  const [activeTab, setActiveTab] = useState('profile');
  const [formLoading, setFormLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '', 
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Haiti' 
    }
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    language: currentLocale, 
    theme: theme 
  });

  const pageIsLoading = authLoading || !themeMounted;

  useEffect(() => {
    if (!authLoading && themeMounted) {
      if (!isAuthenticated) {
        toast.error('You must be logged in to view your profile.');
        router.push('/auth/login');
        return; 
      }

      if (user) {
        let firstName = user.firstName || '';
        let lastName = user.lastName || '';
        if (!user.firstName && !user.lastName && user.name) {
          const nameParts = user.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        setProfileForm({
          firstName: firstName,
          lastName: lastName,
          email: user.email || '', 
          phone: user.phone || '',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            postalCode: user.address?.postalCode || '',
            country: user.address?.country || 'Haiti'
          }
        });

        setPreferences({
          emailNotifications: user.preferences?.emailNotifications ?? true,
          orderUpdates: user.preferences?.orderUpdates ?? true,
          promotions: user.preferences?.promotions ?? false,
          language: currentLocale, 
          theme: theme 
        });
      }
    }
  }, [user, isAuthenticated, authLoading, themeMounted, router, currentLocale, theme]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const userDataToUpdate = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address
      };
      
      const result = await updateUser(userDataToUpdate); 
      if (result && result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result?.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    setFormLoading(true);

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword); 
      if (result && result.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result?.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (preferences.language !== currentLocale) {
        changeLanguage(preferences.language);
      }

      if (preferences.theme !== theme) {
        toggleTheme(); 
      }

      const result = await updateUser({ preferences: {
        emailNotifications: preferences.emailNotifications,
        orderUpdates: preferences.orderUpdates,
        promotions: preferences.promotions,
        language: preferences.language, 
        theme: preferences.theme 
      }});

      if (result && result.success) {
        toast.success('Preferences updated successfully!');
      } else {
        toast.error(result?.error || 'user.preferencesUpdateFailed' || 'Failed to update preferences.');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('error.genericPreferences' || 'An error occurred while updating preferences.');
    } finally {
      setFormLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'user.personalInfo' || 'Personal Info', icon: UserIcon },
    { id: 'password', name: 'user.changePassword' || 'Change Password', icon: KeyIcon },
    { id: 'preferences', name: 'user.preferences' || 'Preferences', icon: BellIcon }
  ];

  if (pageIsLoading) {
    return <LoadingPage message={'loading.profile' || "Loading your profile..."} />;
  }

  if (!user) {
    return null; 
  }

  return (
    <>
      <Head>
        <title>{'user.profile' || 'My Profile'} | Fenkparet</title>
        <meta name="description" content={'user.profileMetaDesc' || "Manage your Fenkparet account profile, settings, and preferences."} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-theme-primary py-8 theme-transition"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary"> 
              {'user.profile' || 'Profile'}
            </h1>
            <p className="text-theme-secondary mt-2"> 
              {'user.profileManageDesc' || 'Manage your account settings and preferences'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="card"> 
                <div className="card-body">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-theme-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-10 h-10 text-accent" /> 
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary"> 
                      {profileForm.firstName} {profileForm.lastName} 
                    </h3>
                    <p className="text-theme-secondary text-sm"> 
                      {user.email}
                    </p>
                  </div>

                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-2 text-left rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-accent text-accent-contrast'
                            : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                        }`}
                      >
                        <tab.icon className="w-5 h-5 mr-3" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card"> 
                <div className="card-body">
                  {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit}>
                      <h2 className="text-xl font-semibold text-theme-primary mb-6"> 
                        {'user.personalInfo' || 'Personal Information'}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.firstName' || 'First Name'}
                          </label>
                          <input
                            type="text"
                            className="form-input" 
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              firstName: e.target.value
                            })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.lastName' || 'Last Name'}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              lastName: e.target.value
                            })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.email' || 'Email'}
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              email: e.target.value
                            })}
                            required
                            readOnly 
                            disabled 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.phone' || 'Phone'}
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              phone: e.target.value
                            })}
                          />
                        </div>

                        <div className="form-group md:col-span-2">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.street' || 'Street Address'}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={profileForm.address.street}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, street: e.target.value }
                            })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.city' || 'City'}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={profileForm.address.city}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, city: e.target.value }
                            })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'checkout.state' || 'State/Province'}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={profileForm.address.state}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              address: { ...profileForm.address, state: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="btn-primary" 
                        >
                          {formLoading ? ('common.updating' || 'Updating...') : ('user.updateProfile' || 'Update Profile')}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit}>
                      <h2 className="text-xl font-semibold text-theme-primary mb-6"> 
                        {'user.changePassword' || 'Change Password'}
                      </h2>

                      <div className="space-y-6 max-w-md">
                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'user.currentPassword' || 'Current Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword.current ? 'text' : 'password'}
                              className="form-input pr-10"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                currentPassword: e.target.value
                              })}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-tertiary" 
                              onClick={() => setShowPassword({
                                ...showPassword,
                                current: !showPassword.current
                              })}
                            >
                              {showPassword.current ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'user.newPassword' || 'New Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword.new ? 'text' : 'password'}
                              className="form-input pr-10"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value
                              })}
                              required
                              minLength="6"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-tertiary" 
                              onClick={() => setShowPassword({
                                ...showPassword,
                                new: !showPassword.new
                              })}
                            >
                              {showPassword.new ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label text-theme-secondary"> 
                            {'user.confirmPassword' || 'Confirm New Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword.confirm ? 'text' : 'password'}
                              className="form-input pr-10"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value
                              })}
                              required
                              minLength="6"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-tertiary" 
                              onClick={() => setShowPassword({
                                ...showPassword,
                                confirm: !showPassword.confirm
                              })}
                            >
                              {showPassword.confirm ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="btn-primary" 
                        >
                          {formLoading ? ('common.changing' || 'Changing...') : ('user.changePassword' || 'Change Password')}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'preferences' && (
                    <form onSubmit={handlePreferencesSubmit}>
                      <h2 className="text-xl font-semibold text-theme-primary mb-6"> 
                        {'user.preferences' || 'Preferences'}
                      </h2>

                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium text-theme-primary mb-4"> 
                            {'user.notifications' || 'Notifications'}
                          </h3>
                          <div className="space-y-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-theme text-accent shadow-sm focus:border-accent focus:ring-accent" 
                                checked={preferences.emailNotifications}
                                onChange={(e) => setPreferences({
                                  ...preferences,
                                  emailNotifications: e.target.checked
                                })}
                              />
                              <span className="ml-3 text-sm text-theme-primary"> 
                                {'user.emailNotifications' || 'Email notifications'}
                              </span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-theme text-accent shadow-sm focus:border-accent focus:ring-accent" 
                                checked={preferences.orderUpdates}
                                onChange={(e) => setPreferences({
                                  ...preferences,
                                  orderUpdates: e.target.checked
                                })}
                              />
                              <span className="ml-3 text-sm text-theme-primary"> 
                                {'user.orderUpdates' || 'Order updates'}
                              </span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-theme text-accent shadow-sm focus:border-accent focus:ring-accent" 
                                checked={preferences.promotions}
                                onChange={(e) => setPreferences({
                                  ...preferences,
                                  promotions: e.target.checked
                                })}
                              />
                              <span className="ml-3 text-sm text-theme-primary"> 
                                {'user.promotionalEmails' || 'Promotional emails and special offers'}
                              </span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-theme-primary mb-4"> 
                            {'user.language' || 'Language'}
                          </h3>
                          <div className="max-w-xs">
                            <select
                              className="form-input bg-theme-input text-theme-primary border-theme focus:ring-accent focus:border-accent" 
                              value={preferences.language}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                language: e.target.value
                              })}
                            >
                              {getAvailableLanguages().map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                  {lang.flag} {lang.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-theme-primary mb-4"> 
                            {'user.theme' || 'Theme'}
                          </h3>
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                              className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                                preferences.theme === 'light'
                                  ? 'border-accent bg-accent-light text-accent' 
                                  : 'border-theme text-theme-secondary hover:bg-theme-tertiary' 
                              }`}
                            >
                              <SunIcon className="w-5 h-5 mr-2" />
                              {'theme.light' || 'Light'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                              className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                                preferences.theme === 'dark'
                                  ? 'border-accent bg-accent-light text-accent' 
                                  : 'border-theme text-theme-secondary hover:bg-theme-tertiary' 
                              }`}
                            >
                              <MoonIcon className="w-5 h-5 mr-2" />
                              {'theme.dark' || 'Dark'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setPreferences({ ...preferences, theme: 'system' })}
                              className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                                preferences.theme === 'system'
                                  ? 'border-accent bg-accent-light text-accent' 
                                  : 'border-theme text-theme-secondary hover:bg-theme-tertiary' 
                              }`}
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {'theme.system' || 'System'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="btn-primary" 
                        >
                          {formLoading ? ('common.saving' || 'Saving...') : ('common.save' || 'Save')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
