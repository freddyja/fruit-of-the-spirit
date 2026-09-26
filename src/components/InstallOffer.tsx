import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useLanguage } from '../i18n/useLanguage'

export function InstallBanner() {
  const { t } = useLanguage()
  const offer = useInstallPrompt()
  if (!offer.showBanner) return null

  return (
    <div className="install-banner" role="region" aria-label={t('installTitle')}>
      <p>{t('installBanner')}</p>
      <div className="install-banner-actions">
        <button type="button" className="button button-small" onClick={() => void offer.install()}>
          {t('installAction')}
        </button>
        <button type="button" className="button button-ghost button-small" onClick={offer.dismissBanner}>
          {t('installNotNow')}
        </button>
      </div>
    </div>
  )
}

export function InstallSettings() {
  const { t } = useLanguage()
  const offer = useInstallPrompt()

  return (
    <section className="panel-block" aria-labelledby="install-heading">
      <h2 id="install-heading">{t('installTitle')}</h2>
      <p className="setting-help">{offer.installed ? t('installInstalled') : t('installHelp')}</p>
      {offer.canInstall ? (
        <button type="button" className="button" onClick={() => void offer.install()}>
          {t('installAction')}
        </button>
      ) : null}
      {!offer.installed && !offer.canInstall ? (
        <p className="setting-help">{offer.ios ? t('installIos') : t('installManual')}</p>
      ) : null}
    </section>
  )
}
