import { ApplicationConfig } from '@angular/core';
import {
  GANTT_GLOBAL_CONFIG,
  GANTT_I18N_LOCALE_TOKEN,
  GanttI18nLocale,
} from '@worktile/gantt';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: GANTT_GLOBAL_CONFIG,
      useValue: {
        locale: GanttI18nLocale.jaJp,
      },
      multi: true,
    },
    {
      provide: GANTT_I18N_LOCALE_TOKEN,
      useValue: {
        id: 'ja-JP',
      },
      multi: true,
    },
  ],
};
