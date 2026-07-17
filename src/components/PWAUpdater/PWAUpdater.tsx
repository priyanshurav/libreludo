import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { logError } from '../../utils/logError';

export const PWAUpdater = () => {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        const shouldUpdate = window.confirm('A new version of LibreLudo is available. Update now?');
        if (shouldUpdate) {
          updateSW(true).catch(logError('PWAUpdater.updateSW'));
          console.info(`LibreLudo updated successfully to v${__LIBRELUDO_VERSION__}`);
        } else {
          console.info('Update postponed. Current version maintained.');
        }
      },
    });
  }, []);

  return null;
};
