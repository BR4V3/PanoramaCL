import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

function LoginPanel({ authUser, isSubmitting, errorMessage, onLogin, onLogout }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin(email.trim(), password);
  };

  if (authUser) {
    return (
      <section className="panel-section login-panel">
        <div className="section-headline">
          <h2>{t('loginAccessTitle')}</h2>
        </div>

        <p className="detail-description">{t('loginSessionAs', { email: authUser.email })}</p>

        <div className="login-actions">
          <Link to="/admin" className="mode-button login-link-button">
            {t('loginGoToAdmin')}
          </Link>
          <button type="button" className="text-button" onClick={onLogout}>
            {t('loginLogout')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-section login-panel">
      <div className="section-headline">
        <h2>{t('loginTitle')}</h2>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          {t('loginEmail')}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          {t('loginPassword')}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {errorMessage ? <p className="admin-notice">{errorMessage}</p> : null}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('loginSubmitting') : t('loginSubmit')}
        </button>
      </form>
    </section>
  );
}

export default LoginPanel;
